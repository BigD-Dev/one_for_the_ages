# ofta_core/api/admin.py
"""
Admin API endpoints for OFTA content management.
These endpoints power the admin panel.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import json
import uuid

from ofta_core.utils.util_db import get_db_connector

router = APIRouter()


# ────────────────────────────────────────────────
# Stats
# ────────────────────────────────────────────────

@router.get("/stats/celebrities")
async def stats_celebrities():
    db = get_db_connector()
    df = db.select_df("SELECT COUNT(*) as count FROM da_prod.ofta_celebrity")
    return {"count": int(df.iloc[0]['count']) if not df.empty else 0}


@router.get("/stats/questions")
async def stats_questions():
    db = get_db_connector()
    df = db.select_df("SELECT COUNT(*) as count FROM da_prod.ofta_question_template")
    return {"count": int(df.iloc[0]['count']) if not df.empty else 0}


@router.get("/stats/users")
async def stats_users():
    db = get_db_connector()
    df = db.select_df("SELECT COUNT(*) as count FROM da_prod.ofta_user_account")
    return {"count": int(df.iloc[0]['count']) if not df.empty else 0}


@router.get("/stats/sessions")
async def stats_sessions():
    db = get_db_connector()
    df = db.select_df("SELECT COUNT(*) as count FROM da_prod.ofta_game_session")
    return {"count": int(df.iloc[0]['count']) if not df.empty else 0}


# ────────────────────────────────────────────────
# Celebrities CRUD
# ────────────────────────────────────────────────

class CelebrityCreateRequest(BaseModel):
    full_name: str
    date_of_birth: str
    star_sign: str
    primary_category: str
    nationality: Optional[str] = None
    gender: Optional[str] = None
    popularity_score: Optional[float] = 50.0
    hints_easy: Optional[list] = []
    hints_medium: Optional[list] = []
    hints_hard: Optional[list] = []


class CelebrityUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    full_name: Optional[str] = None
    popularity_score: Optional[float] = None


@router.get("/celebrities")
async def list_celebrities():
    db = get_db_connector()
    df = db.select_df("""
        SELECT id, full_name, date_of_birth, star_sign, primary_category,
               nationality, gender, popularity_score, is_active, created_at
        FROM da_prod.ofta_celebrity
        ORDER BY full_name
    """)

    celebrities = []
    for _, row in df.iterrows():
        celebrities.append({
            "id": str(row['id']),
            "full_name": row['full_name'],
            "date_of_birth": str(row['date_of_birth']),
            "star_sign": row['star_sign'],
            "primary_category": row['primary_category'],
            "nationality": row.get('nationality'),
            "gender": row.get('gender'),
            "popularity_score": float(row.get('popularity_score', 50)),
            "is_active": bool(row.get('is_active', True)),
            "created_at": str(row.get('created_at', '')),
        })

    return {"celebrities": celebrities}


@router.post("/celebrities")
async def create_celebrity(request: CelebrityCreateRequest):
    db = get_db_connector()
    celeb_id = str(uuid.uuid4())

    db.execute_query(
        """
        INSERT INTO da_prod.ofta_celebrity (
            id, full_name, date_of_birth, star_sign, primary_category,
            nationality, gender, popularity_score, hints_easy, hints_medium, hints_hard
        ) VALUES (
            :id, :full_name, :date_of_birth, :star_sign, :primary_category,
            :nationality, :gender, :popularity_score,
            :hints_easy::jsonb, :hints_medium::jsonb, :hints_hard::jsonb
        )
        """,
        params={
            "id": celeb_id,
            "full_name": request.full_name,
            "date_of_birth": request.date_of_birth,
            "star_sign": request.star_sign,
            "primary_category": request.primary_category,
            "nationality": request.nationality,
            "gender": request.gender,
            "popularity_score": request.popularity_score,
            "hints_easy": json.dumps(request.hints_easy or []),
            "hints_medium": json.dumps(request.hints_medium or []),
            "hints_hard": json.dumps(request.hints_hard or []),
        }
    )

    return {"id": celeb_id, "status": "created"}


@router.patch("/celebrities/{celeb_id}")
async def update_celebrity(celeb_id: str, request: CelebrityUpdateRequest):
    db = get_db_connector()

    updates = []
    params = {"id": celeb_id}

    if request.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = request.is_active

    if request.full_name is not None:
        updates.append("full_name = :full_name")
        params["full_name"] = request.full_name

    if request.popularity_score is not None:
        updates.append("popularity_score = :popularity_score")
        params["popularity_score"] = request.popularity_score

    if not updates:
        return {"status": "no changes"}

    updates.append("updated_at = NOW()")
    set_clause = ", ".join(updates)

    db.execute_query(
        f"UPDATE da_prod.ofta_celebrity SET {set_clause} WHERE id = :id",
        params=params
    )

    return {"status": "updated"}


# ────────────────────────────────────────────────
# Questions CRUD
# ────────────────────────────────────────────────

class QuestionUpdateRequest(BaseModel):
    is_active: Optional[bool] = None
    difficulty: Optional[int] = None


@router.get("/questions")
async def list_questions():
    db = get_db_connector()
    df = db.select_df("""
        SELECT 
            qt.id, qt.mode, qt.difficulty, qt.is_active,
            c.full_name as celebrity_name,
            ca.full_name as celebrity_a_name,
            cb.full_name as celebrity_b_name
        FROM da_prod.ofta_question_template qt
        LEFT JOIN da_prod.ofta_celebrity c ON qt.celebrity_id = c.id
        LEFT JOIN da_prod.ofta_celebrity ca ON qt.celebrity_id_a = ca.id
        LEFT JOIN da_prod.ofta_celebrity cb ON qt.celebrity_id_b = cb.id
        ORDER BY qt.mode, qt.difficulty
    """)

    questions = []
    for _, row in df.iterrows():
        questions.append({
            "id": str(row['id']),
            "mode": row['mode'],
            "difficulty": int(row['difficulty']),
            "is_active": bool(row.get('is_active', True)),
            "celebrity_name": row.get('celebrity_name'),
            "celebrity_a_name": row.get('celebrity_a_name'),
            "celebrity_b_name": row.get('celebrity_b_name'),
        })

    return {"questions": questions}


@router.patch("/questions/{question_id}")
async def update_question(question_id: str, request: QuestionUpdateRequest):
    db = get_db_connector()

    updates = []
    params = {"id": question_id}

    if request.is_active is not None:
        updates.append("is_active = :is_active")
        params["is_active"] = request.is_active

    if request.difficulty is not None:
        updates.append("difficulty = :difficulty")
        params["difficulty"] = request.difficulty

    if not updates:
        return {"status": "no changes"}

    updates.append("updated_at = NOW()")
    set_clause = ", ".join(updates)

    db.execute_query(
        f"UPDATE da_prod.ofta_question_template SET {set_clause} WHERE id = :id",
        params=params
    )

    return {"status": "updated"}


# ────────────────────────────────────────────────
# Users (Read-only)
# ────────────────────────────────────────────────

@router.get("/users")
async def list_users():
    db = get_db_connector()
    df = db.select_df("""
        SELECT id, display_name, email, auth_provider, is_banned,
               created_at, last_active_at
        FROM da_prod.ofta_user_account
        ORDER BY created_at DESC
        LIMIT 200
    """)

    users = []
    for _, row in df.iterrows():
        users.append({
            "id": str(row['id']),
            "display_name": row.get('display_name'),
            "email": row.get('email'),
            "auth_provider": row.get('auth_provider', 'anonymous'),
            "is_banned": bool(row.get('is_banned', False)),
            "created_at": str(row.get('created_at', '')),
            "last_active_at": str(row.get('last_active_at', '')),
        })

    return {"users": users}


# ────────────────────────────────────────────────
# Config CRUD
# ────────────────────────────────────────────────

class ConfigRequest(BaseModel):
    key: str
    value: dict


@router.get("/config")
async def list_config():
    db = get_db_connector()
    df = db.select_df("SELECT key, value, updated_at FROM da_prod.ofta_app_config ORDER BY key")

    configs = []
    for _, row in df.iterrows():
        configs.append({
            "key": row['key'],
            "value": row['value'],
            "updated_at": str(row.get('updated_at', '')),
        })

    return {"configs": configs}


@router.post("/config")
async def upsert_config(request: ConfigRequest):
    db = get_db_connector()

    db.execute_query(
        """
        INSERT INTO da_prod.ofta_app_config (key, value, updated_at)
        VALUES (:key, :value::jsonb, NOW())
        ON CONFLICT (key) DO UPDATE SET value = :value::jsonb, updated_at = NOW()
        """,
        params={"key": request.key, "value": json.dumps(request.value)}
    )

    return {"status": "saved"}
