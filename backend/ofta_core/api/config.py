# ofta_core/api/config.py
"""
App configuration endpoints for OFTA
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any

from ofta_core.utils.util_db import get_db_connector
from ofta_core.utils.firebase_auth import get_optional_user

router = APIRouter()


# ────────────────────────────────────────────────
# Response Models
# ────────────────────────────────────────────────

class AppConfigResponse(BaseModel):
    min_client_version: Dict[str, str]
    feature_flags: Dict[str, bool]
    maintenance_mode: bool
    categories: list[str]
    game_modes: list[str]


# ────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────

@router.get("/config", response_model=AppConfigResponse)
async def get_app_config(
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Get app configuration.
    Public endpoint (no auth required).
    """
    db = get_db_connector()
    
    # Fetch config from database
    config_df = db.select_df(
        """
        SELECT key, value FROM da_prod.ofta_app_config
        WHERE key IN ('min_client_version', 'feature_flags', 'maintenance_mode')
        """
    )
    
    config = {}
    for _, row in config_df.iterrows():
        config[row['key']] = row['value']
    
    # Default values if not in database
    min_client_version = config.get('min_client_version', {"ios": "1.0.0", "android": "1.0.0"})
    feature_flags = config.get('feature_flags', {
        "reverse_mode": True,
        "leaderboard": True,
        "daily_challenge": True
    })
    maintenance_mode = config.get('maintenance_mode', False)
    
    # Static configuration
    categories = [
        "Film & TV",
        "Music",
        "Sports",
        "Influencers",
        "Legends",
        "Models",
        "Politics"
    ]
    
    game_modes = [
        "AGE_GUESS",
        "WHO_OLDER",
        "REVERSE_DOB",
        "REVERSE_SIGN",
        "DAILY_CHALLENGE"
    ]
    
    return AppConfigResponse(
        min_client_version=min_client_version,
        feature_flags=feature_flags,
        maintenance_mode=maintenance_mode,
        categories=categories,
        game_modes=game_modes
    )


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "ofta-api",
        "version": "0.0.1"
    }
