"""Naver News section crawler (IT/과학 sid=105)."""

from __future__ import annotations

import hashlib
import re

import httpx
from bs4 import BeautifulSoup

from app.models import NewsItem

NAVER_IT_SECTION_URL = "https://news.naver.com/section/105"
DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
}
CATEGORY = "IT/과학"


def _make_id(url: str) -> str:
    return hashlib.sha1(url.encode("utf-8")).hexdigest()[:12]


def _clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def fetch_naver_it_news(limit: int = 20) -> list[NewsItem]:
    """Scrape headline articles from Naver IT/Science section."""
    response = httpx.get(
        NAVER_IT_SECTION_URL,
        headers=DEFAULT_HEADERS,
        timeout=20.0,
        follow_redirects=True,
    )
    response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")
    items: list[NewsItem] = []
    seen_urls: set[str] = set()

    for block in soup.select(".sa_item"):
        link_el = block.select_one("a.sa_text_title")
        if not link_el:
            continue

        url = link_el.get("href", "").strip()
        if not url or url in seen_urls:
            continue
        seen_urls.add(url)

        title_el = block.select_one(".sa_text_strong")
        title = _clean_text(
            title_el.get_text() if title_el else link_el.get_text(" ", strip=True)
        )
        if not title:
            continue

        press_el = block.select_one(".sa_text_press")
        press = _clean_text(press_el.get_text()) if press_el else "네이버 뉴스"

        lede_el = block.select_one(".sa_text_lede")
        summary = _clean_text(lede_el.get_text()) if lede_el else title
        if len(summary) > 240:
            summary = summary[:237] + "..."

        img_el = block.select_one("img")
        image = None
        if img_el:
            image = img_el.get("src") or img_el.get("data-src")

        time_el = block.select_one(".sa_text_datetime")
        published_at = _clean_text(time_el.get_text()) if time_el else None

        items.append(
            NewsItem(
                id=_make_id(url),
                title=title,
                summary=summary,
                category=CATEGORY,
                source=press,
                url=url,
                image=image,
                published_at=published_at,
            )
        )

        if len(items) >= limit:
            break

    return items
