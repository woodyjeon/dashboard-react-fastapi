from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.models import ChatRequest, ChatResponse
from app.services.chat_service import handle_chat

router = APIRouter(prefix="/api", tags=["chat"])


@router.get("/chat/status")
async def chat_status() -> dict[str, bool | str]:
    settings = get_settings()
    return {
        "configured": bool(settings.openai_api_key),
        "model": settings.openai_model,
    }


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="메시지를 입력해 주세요.")

    try:
        return await handle_chat(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"챗봇 처리 중 오류가 발생했습니다: {exc}",
        ) from exc
