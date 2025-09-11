"""
Configuration settings for AgriPredict Analysis Service
"""

import os
from typing import List

class Settings:
    """Application settings"""

    # API Settings
    API_HOST: str = os.getenv("API_HOST", "0.0.0.0")
    API_PORT: int = int(os.getenv("PORT", 8000))
    API_WORKERS: int = int(os.getenv("API_WORKERS", 1))

    # CORS Settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://*.huggingface.co",
        "https://huggingface.co",
        os.getenv("FRONTEND_URL", "*")
    ]

    # Model Settings
    DEFAULT_MODELS: List[str] = ["ensemble"]
    MAX_FORECAST_DAYS: int = 365
    MIN_HISTORICAL_DATA_POINTS: int = 3

    # CatBoost Settings (for future training)
    CATBOOST_ITERATIONS: int = 100
    CATBOOST_LEARNING_RATE: float = 0.1
    CATBOOST_DEPTH: int = 6
    CATBOOST_VERBOSE: bool = False

    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Data Processing
    DATE_FORMAT: str = "%Y-%m-%d"
    MAX_DATA_POINTS: int = 10000

# Global settings instance
settings = Settings()
