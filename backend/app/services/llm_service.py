"""LangChain ChatOpenAI wrapper for RAG-backed replies."""

from __future__ import annotations

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import get_settings
from app.models import ChatMessage

SYSTEM_PROMPT = """당신은 Woody Jeon Dashboard의 공식 도움말 어시스턴트입니다.

역할:
- 대시보드의 뉴스, 포트폴리오, RAG 챗봇, SMK Agent 기능을 안내합니다.
- 개발자 Woody Jeon(전우열)의 포트폴리오 사이트 맥락에서 답변합니다.

규칙:
1. 아래 '참고 문서'에 근거해 답변하세요. 문서에 없는 내용은 추측하지 말고 모른다고 말하세요.
2. 한국어로 친절하고 간결하게 답변하세요. 목록이나 단계가 있으면 읽기 쉽게 정리하세요.
3. 사용자가 인사만 하면 간단히 인사하고 무엇을 도와드릴지 물어보세요.
"""


def _build_messages(
    message: str, context: str, history: list[ChatMessage]
) -> list[SystemMessage | HumanMessage | AIMessage]:
    system_text = SYSTEM_PROMPT
    if context.strip():
        system_text += f"\n\n## 참고 문서\n{context}"
    else:
        system_text += "\n\n## 참고 문서\n(관련 문서를 찾지 못했습니다. 일반적인 안내만 가능합니다.)"

    messages: list[SystemMessage | HumanMessage | AIMessage] = [
        SystemMessage(content=system_text)
    ]

    for item in history[-6:]:
        if item.role == "user":
            messages.append(HumanMessage(content=item.content))
        elif item.role == "assistant":
            messages.append(AIMessage(content=item.content))

    messages.append(HumanMessage(content=message))
    return messages


def _extract_text(content: object) -> str:
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = [
            block.get("text", "")
            for block in content
            if isinstance(block, dict) and block.get("type") == "text"
        ]
        if parts:
            return "\n".join(p for p in parts if p).strip()
    return str(content).strip()


async def generate_reply(
    message: str, context: str, history: list[ChatMessage]
) -> str:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError(
            "OPENAI_API_KEY가 설정되지 않았습니다. backend/.env 파일을 확인하세요."
        )

    llm = ChatOpenAI(
        model=settings.openai_model,
        temperature=settings.openai_temperature,
        api_key=settings.openai_api_key,
    )

    messages = _build_messages(message, context, history)
    response = await llm.ainvoke(messages)
    return _extract_text(response.content)
