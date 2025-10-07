# backend/app/config.py
from pydantic import BaseSettings

class Settings(BaseSettings):
    SMTP_USER: str
    DATABASE_URL: str

    class Config:
        env_file = ".env"

settings = Settings()
print(settings.SMTP_USER)
