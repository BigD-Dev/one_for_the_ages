# ofta_core/api/users.py
"""
User stats and achievements endpoints for OFTA
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from ofta_core.utils.firebase_auth import get_current_user
from ofta_core.utils.util_db import get_db_connector

router = APIRouter()


# ────────────────────────────────────────────────
# Response Models
# ────────────────────────────────────────────────

class UserStatsResponse(BaseModel):
    lifetime_score: int = 0
    best_streak: int = 0
    current_streak: int = 0
    games_played: int = 0
    total_correct: int = 0
    total_questions: int = 0
    accuracy_pct: float = 0.0
    favourite_category: Optional[str] = None
    daily_challenges: int = 0
    last_daily_date: Optional[str] = None


class AchievementResponse(BaseModel):
    id: str
    title: str
    description: str
    icon: Optional[str] = None
    unlocked: bool = False
    unlocked_at: Optional[datetime] = None


class UserAchievementsResponse(BaseModel):
    achievements: List[AchievementResponse]
    total_unlocked: int
    total_available: int


class GameHistoryEntry(BaseModel):
    session_id: str
    mode: str
    score: int
    correct_count: int
    questions_count: int
    best_streak: int
    accuracy: float
    played_at: datetime


class GameHistoryResponse(BaseModel):
    games: List[GameHistoryEntry]
    total_games: int


# ────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────

@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get current user's aggregated stats."""
    db = get_db_connector()

    user_df = db.select_df(
        "SELECT id FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
        params={"firebase_uid": current_user["firebase_uid"]}
    )

    if user_df.empty:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_df.iloc[0]['id']

    stats_df = db.select_df(
        "SELECT * FROM da_prod.ofta_user_stats WHERE user_id = :user_id",
        params={"user_id": user_id}
    )

    if stats_df.empty:
        # No stats yet — return defaults
        return UserStatsResponse()

    stats = stats_df.iloc[0]
    return UserStatsResponse(
        lifetime_score=int(stats.get('lifetime_score', 0) or 0),
        best_streak=int(stats.get('best_streak', 0) or 0),
        current_streak=int(stats.get('current_streak', 0) or 0),
        games_played=int(stats.get('games_played', 0) or 0),
        total_correct=int(stats.get('total_correct', 0) or 0),
        total_questions=int(stats.get('total_questions', 0) or 0),
        accuracy_pct=float(stats.get('accuracy_pct', 0.0) or 0.0),
        favourite_category=stats.get('favourite_category'),
        daily_challenges=int(stats.get('daily_challenges', 0) or 0),
        last_daily_date=str(stats['last_daily_date']) if stats.get('last_daily_date') else None,
    )


@router.get("/achievements", response_model=UserAchievementsResponse)
async def get_user_achievements(
    current_user: dict = Depends(get_current_user)
):
    """Get user's achievements (unlocked and locked)."""
    db = get_db_connector()

    user_df = db.select_df(
        "SELECT id FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
        params={"firebase_uid": current_user["firebase_uid"]}
    )

    if user_df.empty:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_df.iloc[0]['id']

    # Get all achievements with user unlock status
    ach_df = db.select_df(
        """
        SELECT 
            a.id, a.title, a.description, a.icon,
            ua.unlocked_at
        FROM da_prod.ofta_achievement a
        LEFT JOIN da_prod.ofta_user_achievement ua 
            ON a.id = ua.achievement_id AND ua.user_id = :user_id
        ORDER BY ua.unlocked_at DESC NULLS LAST, a.id
        """,
        params={"user_id": user_id}
    )

    achievements = []
    total_unlocked = 0
    for _, row in ach_df.iterrows():
        unlocked = row['unlocked_at'] is not None
        if unlocked:
            total_unlocked += 1
        achievements.append(AchievementResponse(
            id=row['id'],
            title=row['title'],
            description=row['description'],
            icon=row.get('icon'),
            unlocked=unlocked,
            unlocked_at=row['unlocked_at'] if unlocked else None,
        ))

    return UserAchievementsResponse(
        achievements=achievements,
        total_unlocked=total_unlocked,
        total_available=len(achievements),
    )


@router.get("/history", response_model=GameHistoryResponse)
async def get_game_history(
    limit: int = 20,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get user's game history."""
    db = get_db_connector()

    user_df = db.select_df(
        "SELECT id FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
        params={"firebase_uid": current_user["firebase_uid"]}
    )

    if user_df.empty:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_df.iloc[0]['id']

    games_df = db.select_df(
        """
        SELECT 
            id, mode, total_score, correct_count, questions_count,
            best_streak, started_at
        FROM da_prod.ofta_game_session
        WHERE user_id = :user_id AND ended_at IS NOT NULL
        ORDER BY started_at DESC
        LIMIT :limit OFFSET :offset
        """,
        params={"user_id": user_id, "limit": limit, "offset": offset}
    )

    total_df = db.select_df(
        """
        SELECT COUNT(*) as cnt FROM da_prod.ofta_game_session
        WHERE user_id = :user_id AND ended_at IS NOT NULL
        """,
        params={"user_id": user_id}
    )

    games = []
    for _, row in games_df.iterrows():
        questions_count = int(row.get('questions_count', 0) or 0)
        correct_count = int(row.get('correct_count', 0) or 0)
        accuracy = (correct_count / questions_count * 100) if questions_count > 0 else 0

        games.append(GameHistoryEntry(
            session_id=str(row['id']),
            mode=row['mode'],
            score=int(row.get('total_score', 0) or 0),
            correct_count=correct_count,
            questions_count=questions_count,
            best_streak=int(row.get('best_streak', 0) or 0),
            accuracy=accuracy,
            played_at=row['started_at'],
        ))

    return GameHistoryResponse(
        games=games,
        total_games=int(total_df.iloc[0]['cnt']) if not total_df.empty else 0,
    )
