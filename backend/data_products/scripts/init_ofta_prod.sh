#!/bin/bash
# Apply all OFTA data_products to the target Postgres database.
# Order: schema → tables → functions → seed.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

: "${PGHOST:=34.71.254.207}"
: "${PGPORT:=5432}"
: "${PGUSER:=postgres}"
: "${PGDATABASE:=tasc_db}"
: "${PGPASSWORD:?PGPASSWORD must be set}"

export PGHOST PGPORT PGUSER PGDATABASE PGPASSWORD

echo "Applying ofta_prod schema to $PGDATABASE on $PGHOST..."
psql -c "CREATE SCHEMA IF NOT EXISTS ofta_prod;"

echo "Creating tables..."
# Explicit order: parents before children (FK dependencies)
TABLE_ORDER=(
    ofta_user_account
    ofta_celebrity
    ofta_question_template
    ofta_daily_pack
    ofta_game_session
    ofta_question_attempt
    ofta_leaderboard_daily
    ofta_user_stats
    ofta_achievement
    ofta_user_achievement
    ofta_telemetry_event
    ofta_app_config
)
for t in "${TABLE_ORDER[@]}"; do
    f="$ROOT/tables/$t/create_$t.sql"
    echo "  $f"
    psql -v ON_ERROR_STOP=1 -f "$f"
done

echo "Creating functions and triggers..."
for f in "$ROOT"/functions/create_*.sql; do
    echo "  $f"
    psql -v ON_ERROR_STOP=1 -f "$f"
done

echo "Seeding reference data..."
for f in "$ROOT"/seed/seed_*.sql; do
    echo "  $f"
    psql -f "$f"
done

echo "ofta_prod ready."
