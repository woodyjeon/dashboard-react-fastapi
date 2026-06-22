"""Chat orchestration: RAG retrieval + LangChain OpenAI reply."""

from __future__ import annotations

from app.models import ChatRequest, ChatResponse
from app.services.llm_service import generate_reply
from app.services.rag_service import retrieve


async def handle_chat(request: ChatRequest) -> ChatResponse:
    sources, context = retrieve(request.message)
    reply = await generate_reply(request.message, context, request.history)
    return ChatResponse(reply=reply, sources=sources)
