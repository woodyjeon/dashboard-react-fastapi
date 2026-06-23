from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    openai_api_key: str = ""
    openai_model: str = "gpt-5-nano"
    openai_temperature: float = 0.1
    news_rss_feeds: str = ""
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # SMK automation (uses the OpenAI key/model above)
    student_name: str = "홍길동"
    smk_upload_dir: str = "uploads"
    smk_output_dir: str = "outputs"
    smk_max_upload_mb: int = 20
    smk_pdf_dpi: int = 150

    @property
    def rss_feed_list(self) -> list[str]:
        return [f.strip() for f in self.news_rss_feeds.split(",") if f.strip()]

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
