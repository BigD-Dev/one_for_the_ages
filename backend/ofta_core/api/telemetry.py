# ofta_core/api/telemetry.py
"""
Telemetry / analytics endpoints for OFTA
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from ofta_core.utils.firebase_auth import get_optional_user
from ofta_core.utils.util_db import get_db_connector

router = APIRouter()


# ────────────────────────────────────────────────
# Request Models
# ────────────────────────────────────────────────

class TelemetryEvent(BaseModel):
    event_type: str = Field(..., max_length=100)
    event_data: Optional[dict] = None
    client_ts: Optional[str] = None
    device_os: Optional[str] = None
    app_version: Optional[str] = None


class BatchEventsRequest(BaseModel):
    events: List[TelemetryEvent]


# ────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────

@router.post("/events", status_code=status.HTTP_202_ACCEPTED)
async def log_event(
    event: TelemetryEvent,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """
    Log a single telemetry event.
    Accepts events from both authenticated and anonymous users.
    """
    db = get_db_connector()

    # Resolve user_id if authenticated
    user_id = None
    if current_user:
        user_df = db.select_df(
            "SELECT id FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
            params={"firebase_uid": current_user["firebase_uid"]}
        )
        if not user_df.empty:
            user_id = user_df.iloc[0]['id']

    # Parse client timestamp
    client_ts = None
    if event.client_ts:
        try:
            client_ts = datetime.fromisoformat(event.client_ts.replace('Z', '+00:00'))
        except (ValueError, AttributeError):
            client_ts = None

    db.execute_query(
        """
        INSERT INTO da_prod.ofta_telemetry_event (
            user_id, event_type, event_data, client_ts,
            device_os, app_version
        ) VALUES (
            :user_id, :event_type, :event_data::jsonb, :client_ts,
            :device_os, :app_version
        )
        """,
        params={
            "user_id": user_id,
            "event_type": event.event_type,
            "event_data": str(event.event_data) if event.event_data else None,
            "client_ts": client_ts,
            "device_os": event.device_os,
            "app_version": event.app_version,
        }
    )

    return {"status": "accepted"}


@router.post("/events/batch", status_code=status.HTTP_202_ACCEPTED)
async def log_batch_events(
    request: BatchEventsRequest,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Log multiple telemetry events in a batch."""
    db = get_db_connector()

    # Resolve user_id once
    user_id = None
    if current_user:
        user_df = db.select_df(
            "SELECT id FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
            params={"firebase_uid": current_user["firebase_uid"]}
        )
        if not user_df.empty:
            user_id = user_df.iloc[0]['id']

    for event in request.events:
        client_ts = None
        if event.client_ts:
            try:
                client_ts = datetime.fromisoformat(event.client_ts.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                client_ts = None

        db.execute_query(
            """
            INSERT INTO da_prod.ofta_telemetry_event (
                user_id, event_type, event_data, client_ts,
                device_os, app_version
            ) VALUES (
                :user_id, :event_type, :event_data::jsonb, :client_ts,
                :device_os, :app_version
            )
            """,
            params={
                "user_id": user_id,
                "event_type": event.event_type,
                "event_data": str(event.event_data) if event.event_data else None,
                "client_ts": client_ts,
                "device_os": event.device_os,
                "app_version": event.app_version,
            }
        )

    return {"status": "accepted", "count": len(request.events)}
