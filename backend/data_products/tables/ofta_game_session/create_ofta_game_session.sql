CREATE TABLE IF NOT EXISTS ofta_prod.ofta_game_session (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL REFERENCES ofta_prod.ofta_user_account(id),
    mode                VARCHAR(50)     NOT NULL,
    pack_date           DATE,
    started_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at_tms        TIMESTAMP,
    total_score         INTEGER         NOT NULL DEFAULT 0,
    questions_count     INTEGER         NOT NULL DEFAULT 0,
    correct_count       INTEGER         NOT NULL DEFAULT 0,
    best_streak         INTEGER         NOT NULL DEFAULT 0,
    device_os           VARCHAR(50),
    client_version      VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_ofta_session_user ON ofta_prod.ofta_game_session(user_id);
CREATE INDEX IF NOT EXISTS idx_ofta_session_date ON ofta_prod.ofta_game_session(started_at_tms DESC);
CREATE INDEX IF NOT EXISTS idx_ofta_session_pack ON ofta_prod.ofta_game_session(pack_date);

COMMENT ON TABLE ofta_prod.ofta_game_session IS 'One row per game session played by a user';
