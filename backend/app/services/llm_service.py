"""LangChain ChatOpenAI wrapper for RAG-backed replies."""

from __future__ import annotations

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.config import get_settings
from app.models import ChatMessage

SYSTEM_PROMPT = """당신은 wjeon Dashboard의 AI 어시스턴트입니다.

역할:
- wjeon Dashboard(뉴스, 포트폴리오, SMK Agent 등) 관련 질문은 제공된 참고 문서를 우선 활용합니다.
- 그 외 일반 질문·기술·개념 질문에는 질문에 맞는 내용을 바로 답변합니다.

규칙:
1. 사용자 질문에 직접 답하세요. '참고 문서', '지식 베이스', '공식 문서', '다루어지지 않음' 같은 메타 설명은 절대 하지 마세요.
2. 문서에 없는 주제라도, 알고 있는 범위에서 자연스럽게 설명하세요.
3. 정말 확실하지 않은 사실만 간단히 밝히고, 그 외에는 답변을 회피하지 마세요.
4. 한국어로 친절하고 간결하게 답변하세요.
5. 인사만 하면 간단히 인사하고 무엇을 도와드릴지 물어보세요.
"""


def _build_messages(
    message: str, context: str, history: list[ChatMessage]
) -> list[SystemMessage | HumanMessage | AIMessage]:
    system_text = SYSTEM_PROMPT
    if context.strip():
        system_text += (
            f"\n\n## 참고 문서 (대시보드 관련 질문일 때만 참고)\n{context}"
        )

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
