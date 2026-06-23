from fastapi import APIRouter, HTTPException, Query

from app.models import NewsResponse
from app.services.news_service import SUPPORTED_SOURCES, get_news, paginate_meta

router = APIRouter(prefix="/api", tags=["news"])


@router.get("/news", response_model=NewsResponse)
async def list_news(
    source: str = Query(
        default="naver_it",
        description="뉴스 소스 (naver_it, naver_economy, investing_economy)",
    ),
    page: int = Query(default=1, ge=1, description="페이지 번호 (1부터 시작)"),
    page_size: int = Query(
        default=12,
        ge=1,
        le=50,
        description="페이지당 뉴스 개수",
    ),
    refresh: bool = Query(
        default=False,
        description="캐시를 무시하고 소스에서 다시 크롤링",
    ),
) -> NewsResponse:
    if source not in SUPPORTED_SOURCES:
        raise HTTPException(
            status_code=400,
            detail=f"지원하지 않는 소스입니다. 사용 가능: {', '.join(sorted(SUPPORTED_SOURCES))}",
        )
    try:
        items, total = get_news(
            source=source,
            page=page,
            page_size=page_size,
            refresh=refresh,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=502,
            detail=f"뉴스를 가져오는 중 오류가 발생했습니다: {exc}",
        ) from exc

    meta = paginate_meta(total, page, page_size)
    return NewsResponse(source=source, items=items, **meta)
