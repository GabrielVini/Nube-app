from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[1]

class Settings(BaseSettings):
    admin_email: str = "estagionube015@gmail.com"
    mail_enabled: bool = False
    mail_provider: str = "gmail"
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = "estagionube015@gmail.com"
    smtp_password: str = ""
    initial_password_1001: str = ""
    initial_password_1002: str = ""
    initial_password_1003: str = ""
    initial_password_1004: str = ""
    initial_password_1005: str = ""
    initial_password_1006: str = ""

    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
