CREATE TABLE IF NOT EXISTS ofta_prod.ofta_user_achievement (
    user_id             UUID            NOT NULL REFERENCES ofta_prod.ofta_user_account(id),
    achievement_id      VARCHAR(100)    NOT NULL REFERENCES ofta_prod.ofta_achievement(id),
    unlocked_at_tms     TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_ofta_user_ach_user ON ofta_prod.ofta_user_achievement(user_id);

COMMENT ON TABLE ofta_prod.ofta_user_achievement IS 'Achievements unlocked by each user';
