"""Research market size (SMK item 07) using OpenAI with optional web search."""

from __future__ import annotations

import json

from openai import OpenAI

from app.config import get_settings
from app.services.openai_patent_service import _parse_json

settings = get_settings()

MARKET_PROMPT = """당신은 기술 시장조사 전문가입니다.
아래 특허 기술과 관련된 시장규모를 웹 검색 등 공개 자료를 바탕으로 조사하고 JSON으로만 출력하세요.

[특허 정보]
- 발명의 명칭: {title}
- 기술요약: {tech_summary}
- 주요 키워드(참고): {keywords}

[조사 내용]
- 국내·세계 시장규모: 최근 실적 및 전망 (단위: 억 원)
- 연평균 성장률(CAGR) 또는 성장 추세가 확인되면 summary에 포함
- 신뢰할 수 있는 출처명과 URL (통계청, KOTRA, Gartner, IDC, 산업협회 등)

[출력 규칙]
1. summary: 보고서형 한국어 3~6문장. 시장 규모·성장률·전망을 간결히 서술.
2. sources: 조사에 참고한 출처 배열 (name, url).
3. has_chart: 연도별 국내·세계 시장규모(억 원) 수치가 **출처에서 확인 가능할 때만** true.
4. has_chart가 true이면 chart에 years, domestic, global 배열 (길이 동일, 최소 2개 연도).
5. 수치·성장률을 확인할 수 없으면 has_chart=false, summary에 조사 내용만 서술하고 sources는 반드시 포함.
6. 추측 수치를 만들지 말 것. 불확실하면 has_chart=false.

[JSON 형식]
{{
  "summary": "시장규모 요약 텍스트...",
  "sources": [{{"name": "출처명", "url": "https://..."}}],
  "has_chart": true,
  "chart": {{
    "years": [2022, 2023, 2024, 2025, 2026],
    "domestic": [100, 120, 150, 180, 210],
    "global": [5000, 5500, 6000, 6500, 7000]
  }}
}}
"""


def _extract_responses_text(response: object) -> str:
    output = getattr(response, "output", None) or []
    parts: list[str] = []
    for item in output:
        item_type = getattr(item, "type", "")
        if item_type == "message":
            for block in getattr(item, "content", []) or []:
                if getattr(block, "type", "") == "output_text":
                    parts.append(getattr(block, "text", "") or "")
    return "".join(parts).strip()


def _align_series(years: list, domestic: list, global_vals: list) -> tuple[list[int], list[float], list[float]]:
    n = len(years)
    if n < 2:
        return [], [], []

    def pad(values: list, size: int) -> list:
        if not values:
            return [0.0] * size
        trimmed = list(values[:size])
        while len(trimmed) < size:
            trimmed.append(trimmed[-1] if trimmed else 0.0)
        return trimmed

    return (
        [int(y) for y in years],
        [float(v) for v in pad(domestic, n)],
        [float(v) for v in pad(global_vals, n)],
    )


def _normalize_market(parsed: dict) -> dict:
    chart = parsed.get("chart") or {}
    years = chart.get("years") or []
    domestic = chart.get("domestic") or []
    global_vals = chart.get("global") or chart.get("global_values") or []

    years, domestic, global_vals = _align_series(years, domestic, global_vals)

    has_numeric = any(v > 0 for v in domestic + global_vals)
    has_chart = bool(parsed.get("has_chart")) and len(years) >= 2 and has_numeric

    if not has_chart:
        years, domestic, global_vals = [], [], []

    sources = []
    for src in parsed.get("sources") or []:
        if isinstance(src, dict):
            name = str(src.get("name", "") or "").strip()
            url = str(src.get("url", "") or "").strip()
            if name or url:
                sources.append({"name": name or url, "url": url})
        elif isinstance(src, str) and src.strip():
            sources.append({"name": src.strip(), "url": ""})

    summary = str(parsed.get("summary", "") or "").strip()
    if not summary and not has_chart:
        summary = "공개된 시장규모·성장률 수치를 확인하지 못했습니다. 관련 산업 동향은 아래 출처를 참고해 주세요."

    return {
        "summary": summary,
        "sources": sources,
        "has_chart": has_chart,
        "years": years,
        "domestic": domestic,
        "global_values": global_vals,
    }


def research_market(patent: dict, keywords: str = "") -> dict:
    """Return market research result for SMK item 07."""
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    client = OpenAI(api_key=settings.openai_api_key)
    prompt = MARKET_PROMPT.format(
        title=patent.get("title", "") or "(없음)",
        tech_summary=patent.get("tech_summary", "") or "(없음)",
        keywords=keywords or patent.get("title", "") or "(없음)",
    )

    text = ""
    try:
        response = client.responses.create(
            model=settings.openai_model,
            tools=[{"type": "web_search_preview"}],
            input=prompt,
        )
        text = _extract_responses_text(response)
    except Exception:
        text = ""

    if not text.strip():
        response = client.chat.completions.create(
            model=settings.openai_model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "시장조사 결과를 JSON만 출력합니다. "
                        "확인된 연도별 수치가 없으면 has_chart는 false입니다."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )
        text = response.choices[0].message.content or ""

    parsed = _parse_json(text)
    if not parsed:
        return {
            "summary": "시장규모 관련 공개 데이터를 확인하지 못했습니다.",
            "sources": [],
            "has_chart": False,
            "years": [],
            "domestic": [],
            "global_values": [],
        }

    return _normalize_market(parsed)
