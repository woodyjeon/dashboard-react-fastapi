"""Build an SMK PDF document with fpdf2."""

from __future__ import annotations

import re
from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos

_SECTIONS = [
    ("01", "기술개요", "item_01"),
    ("02", "기술의 차별성", "item_02"),
    ("03", "주요 키워드", "item_03"),
    ("04", "TRL 단계", "item_04"),
    ("05", "사업화 포인트", "item_05"),
    ("06", "활용분야", "item_06"),
]

_HEADER_ROW = [
    "구분",
    "특허명",
    "등록/공개",
    "공보/등록번호",
    "출원번호",
    "출원인",
    "출원일",
]
_FONT_NAME = "smk-kr"
_ASSETS_FONTS = Path(__file__).resolve().parent.parent / "assets" / "fonts"

_NEXT_LINE = {"new_x": XPos.LMARGIN, "new_y": YPos.NEXT}
_NEXT_CELL = {"new_x": XPos.RIGHT, "new_y": YPos.TOP}


def _safe(value: str, default: str) -> str:
    value = (value or "").strip()
    if not value:
        return default
    return re.sub(r'[\\/:*?"<>|]+', "_", value)


def _resolve_font() -> Path:
    candidates = [
        _ASSETS_FONTS / "malgun.ttf",
        _ASSETS_FONTS / "NotoSansKR-Regular.ttf",
        Path("C:/Windows/Fonts/malgun.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return path
    raise FileNotFoundError(
        "한글 PDF 폰트를 찾을 수 없습니다. backend/app/assets/fonts/ 에 폰트를 추가해주세요."
    )


def _register_font(pdf: FPDF) -> None:
    font_path = _resolve_font()
    pdf.add_font(_FONT_NAME, "", str(font_path))
    pdf.add_font(_FONT_NAME, "B", str(font_path))
    pdf.set_font(_FONT_NAME, size=11)


def _write_heading(pdf: FPDF, text: str) -> None:
    pdf.set_font(_FONT_NAME, "B", 12)
    pdf.multi_cell(0, 8, text, **_NEXT_LINE)
    pdf.ln(2)
    pdf.set_font(_FONT_NAME, size=11)


def _write_body(pdf: FPDF, body: str) -> None:
    for line in (body or "").split("\n"):
        line = line.strip()
        if not line:
            continue
        pdf.multi_cell(0, 7, line, **_NEXT_LINE)
    pdf.ln(2)


def _write_table_row(
    pdf: FPDF,
    values: list[str],
    col_widths: list[float],
    height: float,
) -> None:
    for value, width in zip(values, col_widths):
        pdf.cell(width, height, str(value or ""), border=1, **_NEXT_CELL)
    pdf.ln(height)


def _write_market(pdf: FPDF, market: dict | None) -> None:
    _write_heading(pdf, "07. 시장규모")
    if not market:
        _write_body(pdf, "시장규모 데이터가 아직 준비되지 않았습니다.")
        return

    summary = market.get("summary") or market.get("text") or ""
    if summary:
        _write_body(pdf, summary)

    if market.get("has_chart") and market.get("years"):
        years = market.get("years") or []
        domestic = market.get("domestic") or []
        global_vals = market.get("global_values") or market.get("global") or []
        col_w = pdf.epw / 3
        col_widths = [col_w, col_w, col_w]

        pdf.set_font(_FONT_NAME, "B", 10)
        _write_table_row(pdf, ["연도", "국내 (억원)", "세계 (억원)"], col_widths, 7)
        pdf.set_font(_FONT_NAME, size=10)
        for i, year in enumerate(years):
            _write_table_row(
                pdf,
                [
                    str(year),
                    str(domestic[i]) if i < len(domestic) else "",
                    str(global_vals[i]) if i < len(global_vals) else "",
                ],
                col_widths,
                7,
            )
        pdf.ln(3)

    for src in market.get("sources") or []:
        if isinstance(src, dict):
            name = src.get("name", "")
            url = src.get("url", "")
            _write_body(pdf, f"- {name} {url}".strip())


def _write_ip_table(pdf: FPDF, ip_table: list[dict]) -> None:
    _write_heading(pdf, "08. 지식재산권 현황")
    if not ip_table:
        _write_body(pdf, "—")
        return

    # 특허명 열을 넓게 배분.
    ratios = [0.10, 0.22, 0.10, 0.16, 0.16, 0.14, 0.12]
    col_widths = [pdf.epw * ratio for ratio in ratios]

    pdf.set_font(_FONT_NAME, "B", 9)
    _write_table_row(pdf, _HEADER_ROW, col_widths, 7)
    pdf.set_font(_FONT_NAME, size=9)
    for row in ip_table:
        _write_table_row(
            pdf,
            [
                row.get("category", ""),
                row.get("title", ""),
                row.get("doc_type", ""),
                row.get("doc_no", ""),
                row.get("app_no", ""),
                row.get("applicant", ""),
                row.get("apply_date", ""),
            ],
            col_widths,
            7,
        )
    pdf.ln(3)


def build_smk_pdf(
    patent: dict,
    items: dict,
    ip_table: list[dict],
    output_dir: Path,
    market: dict | None = None,
    sources: list[str] | None = None,
) -> tuple[Path, str]:
    """Create the SMK .pdf and return (path, filename)."""
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    _register_font(pdf)

    pdf.set_font(_FONT_NAME, "B", 16)
    pdf.cell(0, 10, "기술이전 마케팅 자료 (SMK)", align="C", **_NEXT_LINE)
    pdf.ln(2)

    pdf.set_font(_FONT_NAME, "B", 13)
    pdf.multi_cell(
        0,
        8,
        patent.get("title") or "(발명의 명칭 없음)",
        align="C",
        **_NEXT_LINE,
    )
    pdf.ln(4)

    pdf.set_font(_FONT_NAME, size=11)
    pdf.cell(0, 6, "─" * 30, align="C", **_NEXT_LINE)
    pdf.ln(4)

    for no, sec_title, key in _SECTIONS:
        _write_heading(pdf, f"{no}. {sec_title}")
        _write_body(pdf, items.get(key, ""))

    _write_market(pdf, market)
    _write_ip_table(pdf, ip_table)

    extra_sources = sources or []
    market_sources = []
    if market:
        for src in market.get("sources") or []:
            if isinstance(src, dict):
                market_sources.append(
                    f"{src.get('name', '')} {src.get('url', '')}".strip()
                )

    all_sources = extra_sources or market_sources
    if all_sources:
        _write_heading(pdf, "출처")
        for src in all_sources:
            _write_body(pdf, f"- {src}")

    output_dir.mkdir(parents=True, exist_ok=True)
    filename = (
        f"SMK_{_safe(patent.get('app_no'), 'unknown')}"
        f"_{_safe(patent.get('apply_date'), 'nodate')}.pdf"
    )
    path = output_dir / filename
    pdf.output(str(path))
    return path, filename
