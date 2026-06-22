from pydantic import BaseModel


class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    category: str
    source: str
    url: str
    image: str | None = None
    published_at: str | None = None


class NewsResponse(BaseModel):
    source: str = "naver_it"
    items: list[NewsItem]


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []


class ChatSource(BaseModel):
    title: str
    snippet: str


class ChatResponse(BaseModel):
    reply: str
    sources: list[ChatSource] = []
