"""Extract patent bibliographic info from page images using OpenAI vision."""

from __future__ import annotations

import json
import re

from openai import OpenAI

from app.config import get_settings

settings = get_settings()

_FIELDS = (
    "doc_type",
    "doc_no",
    "app_no",
    "title",
    "applicant",
    "apply_date",
    "tech_summary",
)

EXTRACT_PROMPT = """당신은 한국 특허 공보(공개/등록 공보)에서 서지정보를 추출하는 도우미입니다.
제공된 특허 문서 이미지를 보고 아래 항목을 정확히 찾아 JSON으로만 출력하세요.

- doc_type: 문서 종류. "등록특허공보"이면 "등록", "공개특허공보"이면 "공개". 문서 제목·머리글과 (11) 항목을 함께 참고하세요.
- doc_no: 문서에서 "(11) 공보번호" 또는 "(11) 등록번호" 우측에 있는 번호 (공개번호 또는 등록번호)
- app_no: 문서에서 "(21) 출원번호" 우측에 있는 번호
- title: 문서에서 "(54) 발명의 명칭" 우측에 있는 텍스트
- applicant: 문서에서 "(73) 특허권자" 하단에 있는 텍스트 (이름만)
- apply_date: 문서에서 "(22) 출원일자" 우측에 있는 텍스트
- tech_summary: 문서에서 "(57) 요약" 하단에 있는 텍스트를 300자 내외의 한국어로 자연스럽게 정리

규칙:
- doc_type은 반드시 "등록", "공개", 또는 빈 문자열("") 중 하나입니다.
- 찾을 수 없는 항목은 빈 문자열("")로 두세요.
- 추측하지 말고 문서에 보이는 값만 사용하세요.
- 설명, 코드블록, 추가 텍스트 없이 JSON 객체 하나만 출력하세요.

출력 형식 예시:
{"doc_type": "공개", "doc_no": "10-2024-0123456", "app_no": "10-2024-0012345", "title": "발명의 명칭", "applicant": "출원인", "apply_date": "2024.01.15", "tech_summary": "기술 요약..."}
"""


def _parse_json(text: str) -> dict:
    text = (text or "").strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(0))
            except json.JSONDecodeError:
                pass
    return {}


def extract_patent_info(images: list[str], max_pages: int = 2) -> dict:
    """Send the first pages to OpenAI and return the extracted fields.

    Returns a dict with keys: doc_type, doc_no, app_no, title, applicant,
    apply_date, tech_summary.
    ``images`` are ``data:image/...;base64,...`` URLs.
    """
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")
    if not images:
        return {field: "" for field in _FIELDS}

    client = OpenAI(api_key=settings.openai_api_key)

    content: list[dict] = [{"type": "text", "text": EXTRACT_PROMPT}]
    for data_url in images[:max_pages]:
        content.append({"type": "image_url", "image_url": {"url": data_url}})

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[{"role": "user", "content": content}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content or ""
    parsed = _parse_json(text)

    return {field: str(parsed.get(field, "") or "") for field in _FIELDS}
