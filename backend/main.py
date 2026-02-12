# main.py – OFTA FastAPI entry-point
import os
import secrets
import uvicorn
from typing import cast
from datetime import datetime

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
    status,
    Request,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from starlette.datastructures import State

# ───────────────────────────
#  Docs HTTP-Basic guard
# ───────────────────────────
security = HTTPBasic()
DOCS_USER = os.getenv("DOCS_USER")
DOCS_PASS = os.getenv("DOCS_PASS")


def _docs_guard(creds: HTTPBasicCredentials = Depends(security)) -> None:
    """Gate Swagger / ReDoc behind HTTP Basic auth."""
    if not DOCS_USER or not DOCS_PASS:
        return None
    
    if not (
        secrets.compare_digest(creds.username, DOCS_USER)
        and secrets.compare_digest(creds.password, DOCS_PASS)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid docs credentials",
            headers={"WWW-Authenticate": "Basic"},
        )


# ───────────────────────────
#  FastAPI application
# ───────────────────────────
app = FastAPI(
    title="OFTA API",
    version="0.0.1",
    description="One for the Ages - Celebrity Age Trivia Game API",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.state = cast(State, app.state)

# ───────────────────────────
#  CORS
# ───────────────────────────
TRUSTED_ORIGINS = [
    "http://localhost:3000",  # Mobile dev
    "http://localhost:3001",  # Admin dev
    "http://localhost:3002",  # Landing dev
    "capacitor://localhost",  # Capacitor iOS
    "http://localhost",       # Capacitor Android
    # Add production domains here
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=TRUSTED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ───────────────────────────
#  Secure headers middleware
# ───────────────────────────
@app.middleware("http")
async def secure_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "same-origin"
    return resp


# ───────────────────────────
#  Routers
# ───────────────────────────
from ofta_core.api.auth import router as auth_router
from ofta_core.api.config import router as config_router
from ofta_core.api.sessions import router as sessions_router
from ofta_core.api.packs import router as packs_router
from ofta_core.api.leaderboards import router as leaderboards_router
from ofta_core.api.users import router as users_router
from ofta_core.api.telemetry import router as telemetry_router
from ofta_core.api.admin import router as admin_router

app.include_router(config_router, prefix="/v1", tags=["Config"])
app.include_router(auth_router, prefix="/v1/auth", tags=["Auth"])
app.include_router(sessions_router, prefix="/v1/sessions", tags=["Sessions"])
app.include_router(packs_router, prefix="/v1/packs", tags=["Packs"])
app.include_router(leaderboards_router, prefix="/v1/leaderboards", tags=["Leaderboards"])
app.include_router(users_router, prefix="/v1/users", tags=["Users"])
app.include_router(telemetry_router, prefix="/v1/telemetry", tags=["Telemetry"])
app.include_router(admin_router, prefix="/admin", tags=["Admin"])




# ───────────────────────────
#  Startup / shutdown
# ───────────────────────────
@app.on_event("startup")
def on_startup() -> None:
    print("🚀 OFTA API starting up...")
    # Database connector will be initialized lazily
    # Start monitoring, etc.


@app.on_event("shutdown")
def on_shutdown() -> None:
    print("👋 OFTA API shutting down...")
    # Close database connections, etc.


# ───────────────────────────
#  Health & utilities
# ───────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {
        "message": "OFTA API is running",
        "version": "0.0.1",
        "status": "healthy"
    }


@app.get("/health", tags=["Health"])
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }


# ───────────────────────────
#  Uvicorn local shim
# ───────────────────────────
if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    print(f"Starting OFTA API on http://0.0.0.0:{port}")
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=port,
        log_level="info",
        access_log=True,
        reload=True,
    )
