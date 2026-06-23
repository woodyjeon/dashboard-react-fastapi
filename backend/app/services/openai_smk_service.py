"""Generate SMK items 01~06 from patent info + page images using OpenAI."""

from __future__ import annotations

from openai import OpenAI

from app.config import get_settings
from app.services.openai_patent_service import _parse_json

settings = get_settings()

_ITEM_KEYS = ("item_01", "item_02", "item_03", "item_04", "item_05", "item_06")

GENERATE_PROMPT = """당신은 기술 사업화 전문가입니다.
아래 특허 정보와 특허 문서 이미지를 바탕으로 SMK(기술 소개 자료) 항목을 작성하세요.

[특허 정보]
- 출원번호: {app_no}
- 발명의 명칭: {title}
- 출원인: {applicant}
- 출원일: {apply_date}
- 기술요약: {tech_summary}

[공통 작성 규칙]
- 모든 항목은 개조식으로 작성합니다. ("~합니다"는 "~함", "~입니다"는 "~임", "~됩니다"는 "~됨" 등)
- 글머리표가 필요한 항목은 각 줄 앞에 "• "를 붙이고, 줄바꿈(\\n)으로 구분합니다.
- 추측보다는 문서 내용에 근거해 작성합니다.

[작성 항목]

item_01 (기술개요)
- 출원서 내용 기반, 한국어, 개조식으로 서술
- 글머리표나 줄바꿈 없이 하나의 문단으로 3~4줄 이내 작성

item_02 (기술의 차별성)
- 기존 기술 대비 차별점 3가지
- 형식: "• [제목] 설명" (각 줄 글머리표, 개조식)
- 줄바꿈(\\n)으로 3줄 구분

item_03 (주요 키워드)
- 핵심 키워드 5개를 쉼표(,)로 구분한 한 줄

item_04 (TRL 단계)
- TRL 단계 정의: ① 기초 이론/실험 ② 아이디어 특허 등 개념 정립 ③ 실험실 규모의 기본 성능 검증 ④ 소재·부품·시스템 성능 검증 ⑤ 소재·부품·시스템 시작품 제작 및 성능 검증 ⑥ 파일롯 규모 시작품 제작 및 성능 평가 ⑦ 신뢰성 평가/수요기업 평가 ⑧ 시제품 인증 및 표준화 ⑨ 사업화
- 첫 줄: "04. TRL : N (단계 설명) 단계" 형식 (예: "04. TRL : 6 (파일롯 규모 시작품 제작 및 성능 평가) 단계")
- 다음 줄부터: 판단 근거 2개 이내, "• "로 시작, 개조식으로 간단히
- 줄바꿈(\\n)으로 구분

item_05 (사업화 포인트)
- 사업화 포인트 3가지
- 형식: "• [제목] 설명" (각 줄 글머리표, 개조식)
- 줄바꿈(\\n)으로 3줄 구분

item_06 (활용분야)
- 산업군별 활용분야 3가지
- 형식: "• [산업명] 활용 방법" (각 줄 글머리표, 개조식)
- 줄바꿈(\\n)으로 3줄 구분

[출력 형식]
설명, 코드블록 없이 아래 키를 가진 JSON 객체 하나만 출력하세요.
{{"item_01": "...", "item_02": "...", "item_03": "...", "item_04": "...", "item_05": "...", "item_06": "..."}}
"""


def generate_smk_items(
    images: list[str], patent: dict, max_pages: int = 3
) -> dict:
    """Generate SMK items 01~06 as a dict of strings."""
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY가 설정되지 않았습니다.")

    client = OpenAI(api_key=settings.openai_api_key)

    prompt = GENERATE_PROMPT.format(
        app_no=patent.get("app_no", "") or "(없음)",
        title=patent.get("title", "") or "(없음)",
        applicant=patent.get("applicant", "") or "(없음)",
        apply_date=patent.get("apply_date", "") or "(없음)",
        tech_summary=patent.get("tech_summary", "") or "(없음)",
    )

    content: list[dict] = [{"type": "text", "text": prompt}]
    for data_url in images[:max_pages]:
        content.append({"type": "image_url", "image_url": {"url": data_url}})

    response = client.chat.completions.create(
        model=settings.openai_model,
        messages=[{"role": "user", "content": content}],
        response_format={"type": "json_object"},
    )

    text = response.choices[0].message.content or ""
    parsed = _parse_json(text)

    return {key: str(parsed.get(key, "") or "") for key in _ITEM_KEYS}
