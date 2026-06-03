CREATE TABLE IF NOT EXISTS ofta_prod.ofta_leaderboard_daily (
    pack_date           DATE            NOT NULL,
    user_id             UUID            NOT NULL REFERENCES ofta_prod.ofta_user_account(id),
    score               INTEGER         NOT NULL,
    rank                INTEGER,
    submitted_at_tms    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pack_date, user_id)
);

CREATE INDEX IF NOT EXISTS idx_ofta_lb_daily_score ON ofta_prod.ofta_leaderboard_daily(pack_date, score DESC);
CREATE INDEX IF NOT EXISTS idx_ofta_lb_daily_user  ON ofta_prod.ofta_leaderboard_daily(user_id);

COMMENT ON TABLE ofta_prod.ofta_leaderboard_daily IS 'Daily-challenge leaderboard entries per user per day';
