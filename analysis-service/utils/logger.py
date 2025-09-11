"""
Logging configuration for AgriPredict Analysis Service
"""

import logging
import sys
from utils.config import settings

def setup_logger(name: str) -> logging.Logger:
    """Setup logger with proper configuration"""
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, settings.LOG_LEVEL))

    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.LOG_LEVEL))

    # Create formatter
    formatter = logging.Formatter(settings.LOG_FORMAT)
    console_handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(console_handler)

    return logger

# Global logger instance
logger = setup_logger(__name__)
