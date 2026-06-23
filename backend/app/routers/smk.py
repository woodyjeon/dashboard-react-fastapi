"""SMK automation API.

Step 3: PDF upload + image conversion.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import FileResponse

from app.config import get_settings
from app.models import (
    SmkIpRow,
    SmkItemsResponse,
    SmkMarketData,
    SmkPatentInfo,
    SmkUploadResponse,
)
from app.services.openai_market_service import research_market
from app.services.openai_patent_service import extract_patent_info
from app.services.openai_smk_service import generate_smk_items
from app.services.pdf_service import (
    convert_pdf_to_images,
    extract_representative_drawing,
)
from app.services import smk_store
from app.services.smk_pdf_service import build_smk_pdf
from app.services.word_service import build_smk_docx

settings = get_settings()
router = APIRouter(prefix="/api/smk", tags=["smk"])

UPLOAD_DIR = Path(settings.smk_upload_dir)
OUTPUT_DIR = Path(settings.smk_output_dir)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

MAX_UPLOAD_BYTES = settings.smk_max_upload_mb * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"application/pdf", "application/x-pdf"}

# In-memory store of converted pages so later steps can reuse them.
# Keyed by upload id -> {"filename": str, "images": list[str]}.
_conversions: dict[str, dict] = {}


def _safe_name(value: str, default: str) -> str:
    value = (value or "").strip()
    if not value:
        return default
    return re.sub(r'[\\/:*?"<>|]+', "_", value)


def _rebuild_record(upload_id: str, stored: dict | None = None) -> dict:
    """Rebuild in-memory conversion from a PDF on disk."""
    pdf_path = UPLOAD_DIR / f"{upload_id}.pdf"
    if not pdf_path.exists():
        raise HTTPException(
            status_code=404,
            detail="업로드된 PDF를 찾을 수 없습니다. PDF를 다시 업로드해주세요.",
        )
    try:
        images = convert_pdf_to_images(pdf_path, dpi=settings.smk_pdf_dpi)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"PDF 변환 중 오류가 발생했습니다: {exc}",
        ) from exc

    record: dict = {"filename": pdf_path.name, "images": images, "upload_file_id": upload_id}

    if stored and stored.get("smk_data"):
        data = stored["smk_data"]
        patent = data.get("patent") or {}
        if patent:
            record["patent"] = {
                "doc_type": patent.get("doc_type", ""),
                "doc_no": patent.get("doc_no", ""),
                "app_no": patent.get("app_no", ""),
                "title": patent.get("title", ""),
                "applicant": patent.get("applicant", ""),
                "apply_date": patent.get("apply_date", ""),
                "tech_summary": patent.get("tech_summary", ""),
            }
            record["drawing"] = patent.get("drawing_base64")
        if data.get("items"):
            record["smk"] = {
                "items": data["items"],
                "ip_table": data.get("ip_table", []),
            }
        if data.get("upload_file_id"):
            record["upload_file_id"] = data["upload_file_id"]

    _conversions[upload_id] = record
    _index_record_aliases(record)
    return record


def _index_record_aliases(record: dict) -> None:
    """Allow lookup by upload id or app_no (출원번호)."""
    upload_id = record.get("upload_file_id")
    if upload_id:
        _conversions[upload_id] = record
    patent = record.get("patent") or {}
    app_no = (patent.get("app_no") or "").strip()
    if app_no:
        _conversions[app_no] = record


def _find_stored_by_key(key: str) -> dict | None:
    stored = smk_store.get_result(OUTPUT_DIR, key)
    if stored:
        return stored
    for row in smk_store.load_results(OUTPUT_DIR):
        if row.get("id") == key or row.get("app_no") == key:
            return row
    return None


def _resolve_upload_record(key: str) -> tuple[str, dict]:
    """Resolve upload uuid + in-memory record from file_id or app_no."""
    record = _conversions.get(key)
    if record:
        upload_id = record.get("upload_file_id", key)
        return upload_id, record

    stored = _find_stored_by_key(key)
    upload_id = None
    if stored:
        upload_id = (stored.get("smk_data") or {}).get("upload_file_id")

    if upload_id:
        record = _conversions.get(upload_id)
        if record:
            _index_record_aliases(record)
            return upload_id, record
        return upload_id, _rebuild_record(upload_id, stored)

    pdf_path = UPLOAD_DIR / f"{key}.pdf"
    if pdf_path.exists():
        return key, _rebuild_record(key, stored)

    raise HTTPException(
        status_code=404,
        detail="업로드된 PDF를 찾을 수 없습니다. PDF를 다시 업로드해주세요.",
    )


def _persist_extract_entry(file_id: str, record: dict, patent: dict, drawing: str | None) -> str:
    """Save / update extract-only data in smk_list.json (keeps existing SMK items)."""
    result_id = (patent.get("app_no") or "").strip() or file_id
    existing = smk_store.get_result(OUTPUT_DIR, result_id)
    existing_data = (existing or {}).get("smk_data") or {}

    smk_data = {
        "upload_file_id": file_id,
        "patent": {
            "doc_type": patent.get("doc_type", ""),
            "doc_no": patent.get("doc_no", ""),
            "app_no": patent.get("app_no", ""),
            "title": patent.get("title", ""),
            "applicant": patent.get("applicant", ""),
            "apply_date": patent.get("apply_date", ""),
            "tech_summary": patent.get("tech_summary", ""),
            "drawing_base64": drawing,
        },
    }
    if existing_data.get("items"):
        smk_data["items"] = existing_data["items"]
        smk_data["ip_table"] = existing_data.get("ip_table", [])

    entry = {
        "id": result_id,
        "doc_type": patent.get("doc_type", ""),
        "doc_no": patent.get("doc_no", ""),
        "app_no": patent.get("app_no", ""),
        "title": patent.get("title", ""),
        "applicant": patent.get("applicant", ""),
        "apply_date": patent.get("apply_date", ""),
        "created_at": (existing or {}).get("created_at")
        or datetime.now().strftime("%Y-%m-%d %H:%M"),
        "smk_data": smk_data,
        "word_path": (existing or {}).get("word_path", ""),
        "pdf_path": (existing or {}).get("pdf_path", ""),
    }
    if not entry["word_path"]:
        basename = _smk_basename(patent)
        entry["word_path"] = f"{settings.smk_output_dir}/{basename}.docx"
        entry["pdf_path"] = f"{settings.smk_output_dir}/{basename}.pdf"

    smk_store.upsert_result(OUTPUT_DIR, entry)
    record["result_id"] = result_id
    return result_id


def _smk_basename(patent: dict) -> str:
    return (
        f"SMK_{_safe_name(patent.get('app_no'), 'unknown')}"
        f"_{_safe_name(patent.get('apply_date'), 'nodate')}"
    )


@router.post("/upload", response_model=SmkUploadResponse)
async def upload_pdf(file: UploadFile = File(...)) -> SmkUploadResponse:
    # 1. Validate file (extension + MIME type).
    filename = (file.filename or "").strip()
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드할 수 있습니다.")
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"올바른 PDF 형식이 아닙니다 (전달된 형식: {file.content_type}).",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="빈 파일입니다.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"파일이 너무 큽니다. 최대 {settings.smk_max_upload_mb}MB까지 허용됩니다.",
        )

    # 2. Save the PDF to uploads/.
    file_id = uuid.uuid4().hex[:12]
    saved_path = UPLOAD_DIR / f"{file_id}.pdf"
    saved_path.write_bytes(data)

    # 3-4. Convert pages to images and base64-encode them.
    try:
        images = convert_pdf_to_images(saved_path, dpi=settings.smk_pdf_dpi)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"PDF 변환 중 오류가 발생했습니다: {exc}",
        ) from exc

    page_count = len(images)
    print(f"PDF 변환 완료: {page_count} 페이지")

    # 5. Keep the result available for the next processing step.
    _conversions[file_id] = {
        "filename": filename,
        "images": images,
        "upload_file_id": file_id,
    }

    return SmkUploadResponse(
        id=file_id,
        filename=filename,
        page_count=page_count,
        representative_image=images[0] if images else None,
    )


@router.post("/extract/{file_id}", response_model=SmkPatentInfo)
async def extract_patent(file_id: str) -> SmkPatentInfo:
    upload_id, record = _resolve_upload_record(file_id)
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY가 설정되지 않았습니다. backend/.env를 확인해주세요.",
        )

    # 1. Extract bibliographic fields with OpenAI vision.
    try:
        info = extract_patent_info(record["images"])
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"특허 정보 추출 중 오류가 발생했습니다: {exc}",
        ) from exc

    # 2. Extract the representative drawing with PyMuPDF.
    pdf_path = UPLOAD_DIR / f"{upload_id}.pdf"
    drawing = None
    try:
        if pdf_path.exists():
            drawing = extract_representative_drawing(
                pdf_path, dpi=settings.smk_pdf_dpi
            )
    except Exception as exc:  # noqa: BLE001
        print(f"대표도면 추출 실패: {exc}")

    print(f"특허 정보 추출 완료: {info.get('title') or '(제목 없음)'}")

    # Keep the extracted info so SMK generation (Step 5) can reuse it.
    record["patent"] = {
        "doc_type": info.get("doc_type", ""),
        "doc_no": info.get("doc_no", ""),
        "app_no": info.get("app_no", ""),
        "title": info.get("title", ""),
        "applicant": info.get("applicant", ""),
        "apply_date": info.get("apply_date", ""),
        "tech_summary": info.get("tech_summary", ""),
    }
    record["drawing"] = drawing
    record["upload_file_id"] = upload_id
    _index_record_aliases(record)
    _persist_extract_entry(upload_id, record, record["patent"], drawing)

    return SmkPatentInfo(
        doc_type=info.get("doc_type", ""),
        doc_no=info.get("doc_no", ""),
        app_no=info.get("app_no", ""),
        title=info.get("title", ""),
        applicant=info.get("applicant", ""),
        apply_date=info.get("apply_date", ""),
        tech_summary=info.get("tech_summary", ""),
        drawing_base64=drawing,
    )


@router.post("/generate/{file_id}", response_model=SmkItemsResponse)
async def generate_smk(file_id: str) -> SmkItemsResponse:
    upload_id, record = _resolve_upload_record(file_id)
    patent = record.get("patent")
    if not patent:
        raise HTTPException(
            status_code=400,
            detail="먼저 특허 정보를 추출해주세요. (특허 정보 보기)",
        )
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENAI_API_KEY가 설정되지 않았습니다. backend/.env를 확인해주세요.",
        )

    # 01~06: generate with OpenAI.
    try:
        items = generate_smk_items(record["images"], patent)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"SMK 작성 중 오류가 발생했습니다: {exc}",
        ) from exc

    # 08: build the IP-status table from the extracted patent info.
    doc_type = patent.get("doc_type", "")
    ip_rows = [
        {
            "category": f"특허({doc_type})" if doc_type else "특허(출원)",
            "title": patent.get("title", ""),
            "doc_type": doc_type,
            "doc_no": patent.get("doc_no", ""),
            "app_no": patent.get("app_no", ""),
            "applicant": patent.get("applicant", ""),
            "apply_date": patent.get("apply_date", ""),
        }
    ]
    ip_table = [SmkIpRow(**row) for row in ip_rows]

    # 07: 시장규모 조사 (OpenAI web search + 폴백).
    try:
        market_raw = research_market(patent, keywords=items.get("item_03", ""))
        market_data = SmkMarketData(**market_raw)
    except Exception as exc:  # noqa: BLE001
        print(f"시장규모 조사 실패: {exc}")
        market_raw = {
            "summary": "시장규모 조사 중 오류가 발생했습니다.",
            "sources": [],
            "has_chart": False,
            "years": [],
            "domestic": [],
            "global_values": [],
        }
        market_data = SmkMarketData(**market_raw)

    # 다운로드(Word/PDF) 단계에서 재사용할 수 있도록 결과를 저장.
    record["smk"] = {
        "items": items,
        "ip_table": ip_rows,
        "market": market_raw,
        "sources": [
            f"{s.get('name', '')} {s.get('url', '')}".strip()
            for s in market_raw.get("sources", [])
        ],
    }

    # === Step 8: 결과 목록 영속화 (outputs/smk_list.json, app_no 기준 upsert) ===
    app_no = patent.get("app_no", "")
    result_id = app_no or upload_id
    basename = _smk_basename(patent)
    smk_data = {
        "upload_file_id": upload_id,
        "patent": {
            "doc_type": patent.get("doc_type", ""),
            "doc_no": patent.get("doc_no", ""),
            "app_no": patent.get("app_no", ""),
            "title": patent.get("title", ""),
            "applicant": patent.get("applicant", ""),
            "apply_date": patent.get("apply_date", ""),
            "tech_summary": patent.get("tech_summary", ""),
            "drawing_base64": record.get("drawing"),
        },
        "items": items,
        "ip_table": ip_rows,
        "market": market_raw,
    }
    entry = {
        "id": result_id,
        "doc_type": patent.get("doc_type", ""),
        "doc_no": patent.get("doc_no", ""),
        "app_no": patent.get("app_no", ""),
        "title": patent.get("title", ""),
        "applicant": patent.get("applicant", ""),
        "apply_date": patent.get("apply_date", ""),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "smk_data": smk_data,
        "word_path": f"{settings.smk_output_dir}/{basename}.docx",
        "pdf_path": f"{settings.smk_output_dir}/{basename}.pdf",
    }
    record["result_id"] = result_id
    smk_store.upsert_result(OUTPUT_DIR, entry)

    print(f"SMK 작성 완료: {patent.get('title') or '(제목 없음)'}")

    return SmkItemsResponse(
        item_01=items.get("item_01", ""),
        item_02=items.get("item_02", ""),
        item_03=items.get("item_03", ""),
        item_04=items.get("item_04", ""),
        item_05=items.get("item_05", ""),
        item_06=items.get("item_06", ""),
        item_07=market_data,
        item_08=ip_table,
    )


def _resolve_smk(key: str) -> tuple[dict, dict] | None:
    """Find SMK (patent, smk-dict) by in-memory file_id or stored result id."""
    record = _conversions.get(key)
    if record and record.get("smk") and record.get("patent"):
        return record["patent"], record["smk"]

    stored = smk_store.get_result(OUTPUT_DIR, key)
    if stored and stored.get("smk_data"):
        data = stored["smk_data"]
        return data.get("patent", {}), {
            "items": data.get("items", {}),
            "ip_table": data.get("ip_table", []),
            "market": data.get("market"),
            "sources": data.get("sources"),
        }
    return None


@router.get("/download/word/{file_id}")
async def download_word(file_id: str) -> FileResponse:
    resolved = _resolve_smk(file_id)
    if not resolved:
        raise HTTPException(
            status_code=400,
            detail="먼저 SMK 작성을 완료해주세요. (SMK 작성 시작)",
        )
    patent, smk = resolved

    try:
        path, filename = build_smk_docx(
            patent=patent,
            items=smk["items"],
            ip_table=smk["ip_table"],
            output_dir=OUTPUT_DIR,
            market=smk.get("market"),
            sources=smk.get("sources"),
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"Word 파일 생성 중 오류가 발생했습니다: {exc}",
        ) from exc

    print(f"Word 생성 완료: {filename}")

    return FileResponse(
        path,
        filename=filename,
        media_type=(
            "application/vnd.openxmlformats-officedocument."
            "wordprocessingml.document"
        ),
    )


@router.get("/download/pdf/{file_id}")
async def download_pdf(file_id: str) -> FileResponse:
    resolved = _resolve_smk(file_id)
    if not resolved:
        raise HTTPException(
            status_code=400,
            detail="먼저 SMK 작성을 완료해주세요. (SMK 작성 시작)",
        )
    patent, smk = resolved

    try:
        path, filename = build_smk_pdf(
            patent=patent,
            items=smk["items"],
            ip_table=smk["ip_table"],
            output_dir=OUTPUT_DIR,
            market=smk.get("market"),
            sources=smk.get("sources"),
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"PDF 파일 생성 중 오류가 발생했습니다: {exc}",
        ) from exc

    print(f"PDF 생성 완료: {filename}")

    return FileResponse(
        path,
        filename=filename,
        media_type="application/pdf",
    )


# ===== Step 8: 결과 목록 조회 / 상세 조회 / 삭제 =====
@router.get("/results")
async def list_results() -> list[dict]:
    """smk_list.json의 결과 목록을 최신순으로 반환."""
    return smk_store.list_summaries(OUTPUT_DIR)


@router.get("/result/{result_id}")
async def get_result(result_id: str) -> dict:
    entry = smk_store.get_result(OUTPUT_DIR, result_id)
    if not entry:
        raise HTTPException(status_code=404, detail="해당 결과를 찾을 수 없습니다.")
    return entry


@router.delete("/result/{result_id}")
async def delete_result(result_id: str) -> dict:
    deleted = smk_store.delete_result(OUTPUT_DIR, result_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="해당 결과를 찾을 수 없습니다.")
    return {"deleted": True, "id": result_id}
