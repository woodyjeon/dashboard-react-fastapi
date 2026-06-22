"""News aggregation by source."""

from __future__ import annotations

from app.models import NewsItem
from app.services.naver_news_service import fetch_naver_it_news

SUPPORTED_SOURCES = {"naver_it", "other"}


def get_news(source: str = "naver_it", limit: int = 20) -> list[NewsItem]:
    if source == "naver_it":
        return fetch_naver_it_news(limit=limit)
    if source == "other":
        # Placeholder for future crawlers.
        return []
    raise ValueError(f"Unknown news source: {source}")
