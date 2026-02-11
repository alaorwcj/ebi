from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_env: str = "dev"
    app_host: str = "0.0.0.0"
    app_port: int = 8000
    app_secret_key: str = "change_me"
    access_token_expire_minutes: int = 60 * 12

    db_host: str = "host.docker.internal"
    db_port: int = 5432
    db_name: str = "ebi_vila_paula"
    db_user: str = "ebi_user"
    db_pass: str = "ebi_pass"

    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:4173"]

    allow_bootstrap: bool = True

    # WhatsApp (Meta Cloud API)
    whatsapp_enabled: bool = False
    whatsapp_api_version: str = "v19.0"
    whatsapp_phone_number_id: str = ""
    whatsapp_access_token: str = ""
    whatsapp_template_name: str = ""
    whatsapp_template_language: str = "pt_BR"
    whatsapp_default_country_code: str = "55"

    class Config:
        env_file = ".env"
        env_prefix = ""

    @property
    def database_url(self) -> str:
        return (
            "postgresql+psycopg2://"
            f"{self.db_user}:{self.db_pass}@{self.db_host}:{self.db_port}/{self.db_name}"
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
