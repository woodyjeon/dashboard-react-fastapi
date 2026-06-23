"""RAG retriever: OpenAI embeddings + FAISS over markdown knowledge base."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import get_settings
from app.models import ChatSource

KNOWLEDGE_DIR = Path(__file__).resolve().parent.parent / "knowledge"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 80


def _load_documents() -> list[Document]:
    docs: list[Document] = []
    for path in sorted(KNOWLEDGE_DIR.glob("*.md")):
        text = path.read_text(encoding="utf-8").strip()
        if not text:
            continue
        title = path.stem.replace("_", " ").title()
        first_line = text.splitlines()[0].lstrip("# ").strip()
        if first_line:
            title = first_line
        docs.append(
            Document(
                page_content=text,
                metadata={"title": title, "source": path.name},
            )
        )
    return docs


def _split_documents(documents: list[Document]) -> list[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n## ", "\n### ", "\n\n", "\n", " "],
    )
    return splitter.split_documents(documents)


@lru_cache
def _get_vectorstore() -> FAISS:
    settings = get_settings()
    if not settings.openai_api_key:
        raise RuntimeError(
            "OPENAI_API_KEY가 설정되지 않았습니다. backend/.env 파일을 확인하세요."
        )

    raw_docs = _load_documents()
    if not raw_docs:
        raise RuntimeError("지식 베이스 파일이 없습니다. backend/app/knowledge/ 를 확인하세요.")

    chunks = _split_documents(raw_docs)
    embeddings = OpenAIEmbeddings(api_key=settings.openai_api_key)
    return FAISS.from_documents(chunks, embeddings)


def retrieve(query: str, top_k: int = 4, min_relevance: float = 0.72) -> tuple[list[ChatSource], str]:
    """Semantic search; returns display sources and context when relevant."""
    store = _get_vectorstore()
    scored_docs = store.similarity_search_with_relevance_scores(query, k=top_k)
    relevant = [(doc, score) for doc, score in scored_docs if score >= min_relevance]

    if not relevant:
        return [], ""

    sources: list[ChatSource] = []
    context_parts: list[str] = []
    seen_titles: set[str] = set()

    for doc, _score in relevant:
        title = str(doc.metadata.get("title", "문서"))
        if title not in seen_titles:
            seen_titles.add(title)
            sources.append(
                ChatSource(
                    title=title,
                    snippet=doc.page_content[:220].replace("\n", " "),
                )
            )
        context_parts.append(f"### {title}\n{doc.page_content}")

    context = "\n\n".join(context_parts)
    return sources, context
