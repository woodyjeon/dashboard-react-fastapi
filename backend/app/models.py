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
    page: int = 1
    page_size: int = 20
    total: int = 0
    total_pages: int = 0
    has_more: bool = False


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


class SmkUploadResponse(BaseModel):
    id: str
    filename: str
    page_count: int
    representative_image: str | None = None


class SmkPatentInfo(BaseModel):
    doc_type: str = ""
    doc_no: str = ""
    app_no: str = ""
    title: str = ""
    applicant: str = ""
    apply_date: str = ""
    tech_summary: str = ""
    drawing_base64: str | None = None


class SmkIpRow(BaseModel):
    category: str = ""
    title: str = ""
    doc_type: str = ""
    doc_no: str = ""
    app_no: str = ""
    applicant: str = ""
    apply_date: str = ""


class SmkMarketSource(BaseModel):
    name: str = ""
    url: str = ""


class SmkMarketData(BaseModel):
    summary: str = ""
    sources: list[SmkMarketSource] = []
    has_chart: bool = False
    years: list[int] = []
    domestic: list[float] = []
    global_values: list[float] = []


class SmkItemsResponse(BaseModel):
    item_01: str = ""
    item_02: str = ""
    item_03: str = ""
    item_04: str = ""
    item_05: str = ""
    item_06: str = ""
    item_07: SmkMarketData | None = None
    item_08: list[SmkIpRow] = []
