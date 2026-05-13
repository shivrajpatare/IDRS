from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    database_url: str = Field(default="sqlite:///./test.db", env="DATABASE_URL")
    secret_key: str = Field(default="test-secret-key", env="SECRET_KEY")
    firebase_credentials_path: str = Field(default="backend/firebase-service-account.json", env="FIREBASE_CREDENTIALS_PATH")
    ml_service_url: str = Field(default="http://localhost:8002", env="ML_SERVICE_URL")
    openweather_api_key: str = Field(default="", env="OPENWEATHER_API_KEY")
    mapcn_base_url: str = Field(default="https://www.mapcn.dev/", env="MAPCN_BASE_URL")
    ors_api_key: str = Field(default="", env="ORS_API_KEY")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()