"""
Structured logging configuration for OFTA.
JSON format in production, human-readable in development.
"""

import logging
import os
import json
from datetime import datetime


class JSONFormatter(logging.Formatter):
    """JSON log formatter for production environments (Cloud Run, etc.)."""

    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "extra_data"):
            log_data.update(record.extra_data)
        return json.dumps(log_data)


def setup_logging():
    """Configure logging based on environment."""
    env = os.getenv("ENVIRONMENT", "development")
    level = logging.DEBUG if env == "development" else logging.INFO

    handler = logging.StreamHandler()
    if env != "development":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        ))

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]

    # Quiet noisy libraries
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("firebase_admin").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance."""
    return logging.getLogger(name)
