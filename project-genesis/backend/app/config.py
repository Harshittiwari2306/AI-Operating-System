import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Project Genesis - AI OS"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "SUPER_SECRET_SECURITY_KEY_FOR_PROJECT_GENESIS_AI_OS_2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./genesis.db")
    
    # AI keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # File storage configuration
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
    
    # Vector store configuration
    CHROMA_DB_DIR: str = os.getenv("CHROMA_DB_DIR", "chroma_db")
    
    class Config:
        case_sensitive = True

settings = Settings()
