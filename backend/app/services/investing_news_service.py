"""Investing.com Economy news — paginated HTML crawl (scroll/load-more simulation)."""

from __future__ import annotations

import hashlib
import re
from urllib.parse import urljoin

from bs4 import BeautifulSoup
from curl_cffi import requests as curl_requests

from app.models import NewsItem

INVESTING_ECONOMY_BASE = "https://www.investing.com/news/economy"
CATEGORY = "Economy"
MAX_PAGES = 8  # scroll 시 추가 로드되는 페이지 수준까지 순차 요청
DEFAULT_HEADERS = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.investing.com/",
}


def _make_id(url: str) -> str:
    return hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _page_url(page: int) -> str:
    if page <= 1:
        return INVESTING_ECONOMY_BASE
    return f"{INVESTING_ECONOMY_BASE}/{page}"


def _fetch_html(url: str) -> str:
    response = curl_requests.get(
        url,
        headers=DEFAULT_HEADERS,
        impersonate="chrome131",
        timeout=30,
    )
    response.raise_for_status()
    return response.text


def _parse_article(article) -> NewsItem | None:
    link = article.select_one('a[data-test="article-title-link"]')
    if not link:
        link = article.select_one('a[href*="/news/"]')
    if not link:
        return None

    href = _clean_text(link.get("href", ""))
    if not href:
        return None
    url = href if href.startswith("http") else urljoin("https://www.investing.com", href)

    title = _clean_text(link.get_text())
    if not title or title.isdigit():
        return None

    desc_el = article.select_one('[data-test="article-description"]')
    summary = _clean_text(desc_el.get_text()) if desc_el else title
    if len(summary) > 240:
        summary = summary[:237] + "..."

    time_el = article.select_one('[data-test="article-publish-date"]')
    published_at = None
    if time_el:
        published_at = _clean_text(time_el.get("datetime", "") or time_el.get_text())

    provider_el = article.select_one('[data-test="news-provider-name"]')
    source = _clean_text(provider_el.get_text()) if provider_el else "Investing.com"

    img_el = article.select_one('img[src*="invdn"]')
    image = img_el.get("src") if img_el else None

    return NewsItem(
        id=_make_id(url),
        title=title,
        summary=summary,
        category=CATEGORY,
        source=source,
        url=url,
        image=image,
        published_at=published_at,
    )


def _parse_listing_html(html: str) -> list[NewsItem]:
    soup = BeautifulSoup(html, "html.parser")
    items: list[NewsItem] = []
    for article in soup.select('article[data-test="article-item"]'):
        parsed = _parse_article(article)
        if parsed:
            items.append(parsed)
    return items


def _fetch_paginated_html() -> list[NewsItem]:
    """Fetch economy news across paginated pages (simulates infinite scroll)."""
    merged: list[NewsItem] = []
    seen_urls: set[str] = set()

    for page in range(1, MAX_PAGES + 1):
        html = _fetch_html(_page_url(page))
        page_items = _parse_listing_html(html)
        if not page_items:
            break

        new_count = 0
        for item in page_items:
            if item.url in seen_urls:
                continue
            seen_urls.add(item.url)
            merged.append(item)
            new_count += 1

        if new_count == 0:
            break

    return merged


def _fetch_rss_fallback() -> list[NewsItem]:
    """Fallback when HTML crawl is blocked."""
    import feedparser
    import httpx
    from email.utils import parsedate_to_datetime

    rss_url = "https://www.investing.com/rss/news_14.rss"
    response = httpx.get(
        rss_url,
        headers={
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            ),
        },
        timeout=20,
        follow_redirects=True,
    )
    response.raise_for_status()
    feed = feedparser.parse(response.content)

    items: list[NewsItem] = []
    seen: set[str] = set()
    for entry in feed.entries:
        url = _clean_text(entry.get("link", ""))
        if not url or url in seen:
            continue
        seen.add(url)
        title = _clean_text(entry.get("title", ""))
        if not title:
            continue
        summary_raw = entry.get("summary") or entry.get("description") or title
        summary = _clean_text(summary_raw)
        if len(summary) > 240:
            summary = summary[:237] + "..."
        published_at = None
        if entry.get("published"):
            published_at = _clean_text(entry["published"])
        elif entry.get("published_parsed"):
            try:
                published_at = parsedate_to_datetime(entry["published"]).isoformat()
            except (TypeError, ValueError, OverflowError):
                pass
        items.append(
            NewsItem(
                id=_make_id(url),
                title=title,
                summary=summary,
                category=CATEGORY,
                source=_clean_text(entry.get("author", "")) or "Investing.com",
                url=url,
                image=None,
                published_at=published_at,
            )
        )
    return items


def fetch_investing_economy_news() -> list[NewsItem]:
    """Fetch economy headlines from Investing.com with paginated HTML crawl."""
    try:
        items = _fetch_paginated_html()
        if items:
            return items
    except Exception as exc:  # noqa: BLE001
        print(f"Investing HTML crawl failed, using RSS fallback: {exc}")

    return _fetch_rss_fallback()
