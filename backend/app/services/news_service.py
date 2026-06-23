"""News aggregation by source with crawl cache and pagination."""

from __future__ import annotations

import math
import time

from app.models import NewsItem
from app.services.investing_news_service import fetch_investing_economy_news
from app.services.naver_news_service import fetch_naver_economy_news, fetch_naver_it_news

SUPPORTED_SOURCES = {"naver_it", "naver_economy", "investing_economy"}
CACHE_TTL_SECONDS = 90

_cache: dict[str, tuple[float, list[NewsItem]]] = {}


def _crawl_source(source: str) -> list[NewsItem]:
    if source == "naver_it":
        return fetch_naver_it_news()
    if source == "naver_economy":
        return fetch_naver_economy_news()
    if source == "investing_economy":
        return fetch_investing_economy_news()
    raise ValueError(f"Unknown news source: {source}")


def _get_cached_items(source: str, *, refresh: bool = False) -> list[NewsItem]:
    now = time.time()
    cached = _cache.get(source)
    if not refresh and cached and now - cached[0] < CACHE_TTL_SECONDS:
        return cached[1]

    items = _crawl_source(source)
    _cache[source] = (now, items)
    return items


def get_news(
    source: str = "naver_it",
    *,
    page: int = 1,
    page_size: int = 20,
    refresh: bool = False,
) -> tuple[list[NewsItem], int]:
    all_items = _get_cached_items(source, refresh=refresh)
    total = len(all_items)
    if total == 0:
        return [], 0

    start = (page - 1) * page_size
    if start >= total:
        return [], total

    end = start + page_size
    return all_items[start:end], total


def paginate_meta(total: int, page: int, page_size: int) -> dict[str, int | bool]:
    total_pages = max(1, math.ceil(total / page_size)) if total else 0
    safe_page = min(max(page, 1), total_pages) if total else 1
    return {
        "page": safe_page,
        "page_size": page_size,
        "total": total,
        "total_pages": total_pages,
        "has_more": safe_page < total_pages,
    }
