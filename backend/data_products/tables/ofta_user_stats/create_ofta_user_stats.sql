CREATE TABLE IF NOT EXISTS ofta_prod.ofta_user_stats (
    user_id             UUID            PRIMARY KEY REFERENCES ofta_prod.ofta_user_account(id),
    lifetime_score      BIGINT          NOT NULL DEFAULT 0,
    best_streak         INTEGER         NOT NULL DEFAULT 0,
    current_streak      INTEGER         NOT NULL DEFAULT 0,
    games_played        INTEGER         NOT NULL DEFAULT 0,
    total_correct       INTEGER         NOT NULL DEFAULT 0,
    total_questions     INTEGER         NOT NULL DEFAULT 0,
    accuracy_pct        NUMERIC(5,2)    NOT NULL DEFAULT 0.0,
    favourite_category  VARCHAR(100),
    daily_challenges    INTEGER         NOT NULL DEFAULT 0,
    last_daily_date     DATE,
    updated_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ofta_stats_lifetime ON ofta_prod.ofta_user_stats(lifetime_score DESC);
CREATE INDEX IF NOT EXISTS idx_ofta_stats_streak   ON ofta_prod.ofta_user_stats(best_streak DESC);

COMMENT ON TABLE ofta_prod.ofta_user_stats IS 'Aggregated lifetime stats per user';
