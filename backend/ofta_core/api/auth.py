# ofta_core/api/auth.py
"""
Authentication endpoints for OFTA
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

from ofta_core.utils.firebase_auth import get_current_user, verify_firebase_token
from ofta_core.utils.util_db import get_db_connector

router = APIRouter()


# ────────────────────────────────────────────────
# Request/Response Models
# ────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    firebase_uid: str
    display_name: Optional[str] = None
    email: Optional[str] = None
    country: Optional[str] = None
    device_os: Optional[str] = None
    auth_provider: str = "anonymous"


class UserResponse(BaseModel):
    id: str
    firebase_uid: Optional[str]
    display_name: Optional[str]
    email: Optional[str]
    country: Optional[str]
    device_os: Optional[str]
    auth_provider: str
    created_at: datetime
    last_active_at: datetime


# ────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    request: RegisterRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Register a new user or return existing user.
    Called after Firebase authentication.
    """
    db = get_db_connector()
    
    # 🚨 DEV MOCK
    if request.firebase_uid == "dev_user_123" or current_user.get("firebase_uid") == "dev_user_123":
        return UserResponse(
            id="dev_user_id_123",
            firebase_uid="dev_user_123",
            display_name="Dev Player",
            email="dev@ofta.com",
            country="US",
            device_os="web",
            auth_provider="email",
            created_at=datetime.utcnow(),
            last_active_at=datetime.utcnow()
        )
    
    # Verify the firebase_uid matches the authenticated user
    if request.firebase_uid != current_user["firebase_uid"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Firebase UID mismatch"
        )
    
    # Check if user already exists
    existing_user = db.select_df(
        """
        SELECT * FROM da_prod.ofta_user_account
        WHERE firebase_uid = :firebase_uid
        """,
        params={"firebase_uid": request.firebase_uid}
    )
    
    if not existing_user.empty:
        # Update last_active_at
        db.execute_query(
            """
            UPDATE da_prod.ofta_user_account
            SET last_active_at = NOW()
            WHERE firebase_uid = :firebase_uid
            """,
            params={"firebase_uid": request.firebase_uid}
        )
        
        user = existing_user.iloc[0].to_dict()
        return UserResponse(**user)
    
    # Create new user
    user_id = str(uuid.uuid4())
    
    db.execute_query(
        """
        INSERT INTO da_prod.ofta_user_account (
            id, firebase_uid, display_name, email, country, 
            device_os, auth_provider, created_at, last_active_at
        )
        VALUES (
            :id, :firebase_uid, :display_name, :email, :country,
            :device_os, :auth_provider, NOW(), NOW()
        )
        """,
        params={
            "id": user_id,
            "firebase_uid": request.firebase_uid,
            "display_name": request.display_name,
            "email": request.email,
            "country": request.country,
            "device_os": request.device_os,
            "auth_provider": request.auth_provider,
        }
    )
    
    # Fetch created user
    user_df = db.select_df(
        "SELECT * FROM da_prod.ofta_user_account WHERE id = :id",
        params={"id": user_id}
    )
    
    user = user_df.iloc[0].to_dict()
    return UserResponse(**user)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """Get current authenticated user's information."""
    db = get_db_connector()
    
    user_df = db.select_df(
        """
        SELECT * FROM da_prod.ofta_user_account
        WHERE firebase_uid = :firebase_uid
        """,
        params={"firebase_uid": current_user["firebase_uid"]}
    )
    
    if user_df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please register first."
        )
    
    # Update last_active_at
    db.execute_query(
        """
        UPDATE da_prod.ofta_user_account
        SET last_active_at = NOW()
        WHERE firebase_uid = :firebase_uid
        """,
        params={"firebase_uid": current_user["firebase_uid"]}
    )
    
    user = user_df.iloc[0].to_dict()
    return UserResponse(**user)


@router.patch("/me", response_model=UserResponse)
async def update_user_profile(
    display_name: Optional[str] = None,
    country: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile."""
    db = get_db_connector()
    
    updates = []
    params = {"firebase_uid": current_user["firebase_uid"]}
    
    if display_name is not None:
        updates.append("display_name = :display_name")
        params["display_name"] = display_name
    
    if country is not None:
        updates.append("country = :country")
        params["country"] = country
    
    if not updates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    updates.append("updated_at = NOW()")
    
    query = f"""
        UPDATE da_prod.ofta_user_account
        SET {', '.join(updates)}
        WHERE firebase_uid = :firebase_uid
    """
    
    db.execute_query(query, params=params)
    
    # Fetch updated user
    user_df = db.select_df(
        "SELECT * FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
        params={"firebase_uid": current_user["firebase_uid"]}
    )
    
    user = user_df.iloc[0].to_dict()
    return UserResponse(**user)


@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_account(
    current_user: dict = Depends(get_current_user)
):
    """
    Delete current user's account (soft delete - mark as banned).
    For GDPR compliance, implement hard delete separately.
    """
    db = get_db_connector()
    
    db.execute_query(
        """
        UPDATE da_prod.ofta_user_account
        SET is_banned = TRUE, updated_at = NOW()
        WHERE firebase_uid = :firebase_uid
        """,
        params={"firebase_uid": current_user["firebase_uid"]}
    )
    
    return None
