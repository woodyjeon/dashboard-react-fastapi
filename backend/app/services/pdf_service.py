"""PDF upload processing: page images and representative drawing extraction."""

from __future__ import annotations

import base64
from pathlib import Path

import fitz

# Embedded images smaller than this (in pixels^2) are treated as logos/marks,
# not as the representative drawing.
_MIN_DRAWING_AREA = 20_000


def convert_pdf_to_images(pdf_path: str | Path, dpi: int = 150) -> list[str]:
    """Convert every PDF page to a base64 PNG data URL."""
    pdf_path = Path(pdf_path)
    zoom = dpi / 72.0
    matrix = fitz.Matrix(zoom, zoom)

    images: list[str] = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            pixmap = page.get_pixmap(matrix=matrix)
            png_bytes = pixmap.tobytes("png")
            encoded = base64.b64encode(png_bytes).decode("ascii")
            images.append(f"data:image/png;base64,{encoded}")

    return images


def extract_representative_drawing(
    pdf_path: str | Path, dpi: int = 150
) -> str | None:
    """Return the representative drawing on the first page as a data URL."""
    with fitz.open(pdf_path) as doc:
        if doc.page_count == 0:
            return None

        page = doc[0]

        best_bytes: bytes | None = None
        best_ext = "png"
        best_area = 0
        for img in page.get_images(full=True):
            xref = img[0]
            try:
                info = doc.extract_image(xref)
            except Exception:  # noqa: BLE001
                continue
            area = int(info.get("width", 0)) * int(info.get("height", 0))
            if area > best_area:
                best_area = area
                best_bytes = info.get("image")
                best_ext = info.get("ext", "png")

        if best_bytes and best_area >= _MIN_DRAWING_AREA:
            encoded = base64.b64encode(best_bytes).decode("ascii")
            return f"data:image/{best_ext};base64,{encoded}"

        zoom = dpi / 72.0
        pixmap = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
        encoded = base64.b64encode(pixmap.tobytes("png")).decode("ascii")
        return f"data:image/png;base64,{encoded}"
