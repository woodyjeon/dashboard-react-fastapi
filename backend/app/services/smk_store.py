"""Persist SMK results to outputs/smk_list.json (append / upsert by id)."""

from __future__ import annotations

import json
from pathlib import Path
from threading import Lock

_lock = Lock()
_FILENAME = "smk_list.json"


def _list_path(output_dir: Path) -> Path:
    return Path(output_dir) / _FILENAME


def load_results(output_dir: Path) -> list[dict]:
    path = _list_path(output_dir)
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    return data if isinstance(data, list) else []


def _save(output_dir: Path, results: list[dict]) -> None:
    path = _list_path(output_dir)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def upsert_result(output_dir: Path, entry: dict) -> list[dict]:
    """Insert a new entry or overwrite an existing one with the same id."""
    with _lock:
        results = [r for r in load_results(output_dir) if r.get("id") != entry["id"]]
        results.append(entry)
        _save(output_dir, results)
    return results


def get_result(output_dir: Path, result_id: str) -> dict | None:
    for row in load_results(output_dir):
        if row.get("id") == result_id:
            return row
    return None


def delete_result(output_dir: Path, result_id: str) -> bool:
    with _lock:
        results = load_results(output_dir)
        remaining = [r for r in results if r.get("id") != result_id]
        if len(remaining) == len(results):
            return False
        _save(output_dir, remaining)
    return True


def list_summaries(output_dir: Path) -> list[dict]:
    """Return lightweight entries (no heavy smk_data), newest first."""
    rows = load_results(output_dir)
    summaries = [
        {
            "id": r.get("id", ""),
            "doc_type": r.get("doc_type", ""),
            "doc_no": r.get("doc_no", ""),
            "app_no": r.get("app_no", ""),
            "title": r.get("title", ""),
            "applicant": r.get("applicant", ""),
            "apply_date": r.get("apply_date", ""),
            "created_at": r.get("created_at", ""),
        }
        for r in rows
    ]
    summaries.sort(key=lambda r: r.get("created_at", ""), reverse=True)
    return summaries
