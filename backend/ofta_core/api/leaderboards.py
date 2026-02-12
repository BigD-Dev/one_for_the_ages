# ofta_core/api/leaderboards.py
"""
Leaderboard endpoints for OFTA
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

from ofta_core.utils.firebase_auth import get_current_user, get_optional_user
from ofta_core.utils.util_db import get_db_connector

router = APIRouter()


# ────────────────────────────────────────────────
# Response Models
# ────────────────────────────────────────────────

class LeaderboardEntry(BaseModel):
    rank: int
    display_name: Optional[str] = "Anonymous"
    score: int
    is_current_user: bool = False


class DailyLeaderboardResponse(BaseModel):
    pack_date: str
    entries: List[LeaderboardEntry]
    total_players: int
    current_user_rank: Optional[int] = None
    current_user_score: Optional[int] = None


class AllTimeLeaderboardEntry(BaseModel):
    rank: int
    display_name: Optional[str] = "Anonymous"
    lifetime_score: int
    games_played: int
    accuracy_pct: float
    best_streak: int
    is_current_user: bool = False


class AllTimeLeaderboardResponse(BaseModel):
    entries: List[AllTimeLeaderboardEntry]
    total_players: int
    current_user_rank: Optional[int] = None


# ────────────────────────────────────────────────
# Endpoints
# ────────────────────────────────────────────────

@router.get("/daily/{pack_date}", response_model=DailyLeaderboardResponse)
async def get_daily_leaderboard(
    pack_date: str,
    limit: int = 100,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get the daily leaderboard for a specific date."""
    db = get_db_connector()

    # Validate date
    try:
        target_date = datetime.strptime(pack_date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    # Get leaderboard entries with rank
    lb_df = db.select_df(
        """
        SELECT 
            lb.score,
            ua.display_name,
            ua.firebase_uid,
            RANK() OVER (ORDER BY lb.score DESC) as rank
        FROM da_prod.ofta_leaderboard_daily lb
        JOIN da_prod.ofta_user_account ua ON lb.user_id = ua.id
        WHERE lb.pack_date = :pack_date
        ORDER BY lb.score DESC
        LIMIT :limit
        """,
        params={"pack_date": target_date, "limit": limit}
    )

    current_uid = current_user["firebase_uid"] if current_user else None

    entries = []
    current_user_rank = None
    current_user_score = None

    for _, row in lb_df.iterrows():
        is_me = current_uid and row['firebase_uid'] == current_uid
        entry = LeaderboardEntry(
            rank=int(row['rank']),
            display_name=row['display_name'] or "Anonymous",
            score=int(row['score']),
            is_current_user=bool(is_me),
        )
        entries.append(entry)

        if is_me:
            current_user_rank = int(row['rank'])
            current_user_score = int(row['score'])

    # Total players count
    total_df = db.select_df(
        "SELECT COUNT(*) as cnt FROM da_prod.ofta_leaderboard_daily WHERE pack_date = :pack_date",
        params={"pack_date": target_date}
    )
    total_players = int(total_df.iloc[0]['cnt']) if not total_df.empty else 0

    return DailyLeaderboardResponse(
        pack_date=pack_date,
        entries=entries,
        total_players=total_players,
        current_user_rank=current_user_rank,
        current_user_score=current_user_score,
    )


@router.get("/all-time", response_model=AllTimeLeaderboardResponse)
async def get_all_time_leaderboard(
    limit: int = 100,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Get the all-time leaderboard based on lifetime scores."""
    db = get_db_connector()

    lb_df = db.select_df(
        """
        SELECT 
            us.lifetime_score,
            us.games_played,
            us.accuracy_pct,
            us.best_streak,
            ua.display_name,
            ua.firebase_uid,
            RANK() OVER (ORDER BY us.lifetime_score DESC) as rank
        FROM da_prod.ofta_user_stats us
        JOIN da_prod.ofta_user_account ua ON us.user_id = ua.id
        WHERE us.games_played > 0
        ORDER BY us.lifetime_score DESC
        LIMIT :limit
        """,
        params={"limit": limit}
    )

    current_uid = current_user["firebase_uid"] if current_user else None
    current_user_rank = None

    entries = []
    for _, row in lb_df.iterrows():
        is_me = current_uid and row['firebase_uid'] == current_uid
        entry = AllTimeLeaderboardEntry(
            rank=int(row['rank']),
            display_name=row['display_name'] or "Anonymous",
            lifetime_score=int(row['lifetime_score']),
            games_played=int(row['games_played']),
            accuracy_pct=float(row['accuracy_pct']),
            best_streak=int(row['best_streak']),
            is_current_user=bool(is_me),
        )
        entries.append(entry)
        if is_me:
            current_user_rank = int(row['rank'])

    total_df = db.select_df(
        "SELECT COUNT(*) as cnt FROM da_prod.ofta_user_stats WHERE games_played > 0"
    )
    total_players = int(total_df.iloc[0]['cnt']) if not total_df.empty else 0

    return AllTimeLeaderboardResponse(
        entries=entries,
        total_players=total_players,
        current_user_rank=current_user_rank,
    )


@router.post("/daily/{pack_date}/submit")
async def submit_daily_score(
    pack_date: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Submit a user's daily challenge score to the leaderboard.
    Called automatically when a daily challenge session ends.
    """
    db = get_db_connector()

    # Get user
    user_df = db.select_df(
        "SELECT id FROM da_prod.ofta_user_account WHERE firebase_uid = :firebase_uid",
        params={"firebase_uid": current_user["firebase_uid"]}
    )

    if user_df.empty:
        raise HTTPException(status_code=404, detail="User not found")

    user_id = user_df.iloc[0]['id']

    # Get user's daily session score
    session_df = db.select_df(
        """
        SELECT total_score
        FROM da_prod.ofta_game_session
        WHERE user_id = :user_id
          AND mode = 'DAILY_CHALLENGE'
          AND pack_date = :pack_date
          AND ended_at IS NOT NULL
        ORDER BY total_score DESC
        LIMIT 1
        """,
        params={"user_id": user_id, "pack_date": pack_date}
    )

    if session_df.empty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No completed daily session found for this date"
        )

    score = int(session_df.iloc[0]['total_score'])

    # Upsert leaderboard entry (keep best score)
    db.execute_query(
        """
        INSERT INTO da_prod.ofta_leaderboard_daily (pack_date, user_id, score, submitted_at)
        VALUES (:pack_date, :user_id, :score, NOW())
        ON CONFLICT (pack_date, user_id)
        DO UPDATE SET score = GREATEST(da_prod.ofta_leaderboard_daily.score, EXCLUDED.score),
                      submitted_at = NOW()
        """,
        params={"pack_date": pack_date, "user_id": user_id, "score": score}
    )

    return {"status": "submitted", "score": score}
