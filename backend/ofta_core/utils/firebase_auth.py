# ofta_core/utils/firebase_auth.py
"""
Firebase Authentication utilities for OFTA
"""

import os
import logging
from typing import Optional
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK
_firebase_app = None


def initialize_firebase():
    """Initialize Firebase Admin SDK."""
    global _firebase_app
    
    if _firebase_app is not None:
        return _firebase_app
    
    try:
        # Try to use service account key file
        key_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
        if key_path and os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase initialized with service account")
        else:
            # Use default credentials (for Cloud Run)
            _firebase_app = firebase_admin.initialize_app()
            logger.info("✅ Firebase initialized with default credentials")
        
        return _firebase_app
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Firebase: {e}")
        raise


# Initialize on import
try:
    initialize_firebase()
except Exception as e:
    logger.warning(f"Firebase initialization deferred: {e}")


# HTTP Bearer token scheme
security = HTTPBearer()


async def verify_firebase_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Verify Firebase ID token and return decoded token.
    
    Args:
        credentials: HTTP Bearer credentials
    
    Returns:
        dict: Decoded token with user info
    
    Raises:
        HTTPException: If token is invalid
    """
    token = credentials.credentials
    
    try:
        # Verify the token
        decoded_token = auth.verify_id_token(token)
        return decoded_token
        
    except auth.InvalidIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except auth.ExpiredIdTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user(
    token_data: dict = Depends(verify_firebase_token)
) -> dict:
    """
    Get current user from verified token.
    
    Args:
        token_data: Decoded Firebase token
    
    Returns:
        dict: User information
    """
    return {
        "firebase_uid": token_data.get("uid"),
        "email": token_data.get("email"),
        "email_verified": token_data.get("email_verified", False),
        "display_name": token_data.get("name"),
        "photo_url": token_data.get("picture"),
        "provider": token_data.get("firebase", {}).get("sign_in_provider"),
    }


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
) -> Optional[dict]:
    """
    Get current user if authenticated, otherwise None.
    Useful for endpoints that work with or without auth.
    
    Args:
        credentials: Optional HTTP Bearer credentials
    
    Returns:
        dict | None: User information or None
    """
    if credentials is None:
        return None
    
    try:
        token_data = await verify_firebase_token(credentials)
        return await get_current_user(token_data)
    except HTTPException:
        return None


def create_custom_token(uid: str, claims: dict = None) -> str:
    """
    Create a custom Firebase token for a user.
    
    Args:
        uid: User ID
        claims: Optional custom claims
    
    Returns:
        str: Custom token
    """
    try:
        token = auth.create_custom_token(uid, claims)
        return token.decode('utf-8') if isinstance(token, bytes) else token
    except Exception as e:
        logger.error(f"Error creating custom token: {e}")
        raise


def get_user_by_uid(uid: str) -> dict:
    """
    Get Firebase user by UID.
    
    Args:
        uid: User ID
    
    Returns:
        dict: User information
    """
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "email_verified": user.email_verified,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "disabled": user.disabled,
            "created_at": user.user_metadata.creation_timestamp,
        }
    except Exception as e:
        logger.error(f"Error getting user: {e}")
        raise
