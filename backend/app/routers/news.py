from fastapi import APIRouter, HTTPException, Query

from app.models import NewsResponse
from app.services.news_service import SUPPORTED_SOURCES, get_news

router = APIRouter(prefix="/api", tags=["news"])


@router.get("/news", response_model=NewsResponse)
async def list_news(
    source: str = Query(default="naver_it", description="뉴스 소스 (naver_it, other)"),
    limit: int = Query(default=20, ge=1, le=50),
) -> NewsResponse:
    if source not in SUPPORTED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 소스입니다. 사용 가능: {', '.join(sorted(SUPPORTED_SOURCES))}",
        )
    try:
        items = get_news(source=source, limit=limit)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"뉴스를 가져오는 중 오류가 발생했습니다: {exc}",
        ) from exc
    return NewsResponse(source=source, items=items)
