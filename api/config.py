from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str
    clerk_jwks_url: str = ""
    clerk_issuer: str = ""
    clerk_secret_key: str = ""
    admin_clerk_user_id: str = ""
    clerk_webhook_secret: str = ""


settings = Settings()
