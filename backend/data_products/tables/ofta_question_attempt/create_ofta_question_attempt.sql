CREATE TABLE IF NOT EXISTS ofta_prod.ofta_question_attempt (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id              UUID            NOT NULL REFERENCES ofta_prod.ofta_game_session(id) ON DELETE CASCADE,
    question_template_id    UUID            NOT NULL REFERENCES ofta_prod.ofta_question_template(id),
    question_index          INTEGER         NOT NULL,
    shown_at_tms            TIMESTAMP,
    answered_at_tms         TIMESTAMP,
    response_time_ms        INTEGER,
    user_answer             JSONB           NOT NULL,
    is_correct              BOOLEAN         NOT NULL,
    error_value             NUMERIC(10,4),
    hints_used              INTEGER         NOT NULL DEFAULT 0,
    score_awarded           INTEGER         NOT NULL DEFAULT 0,
    streak_at_time          INTEGER         NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ofta_attempt_session  ON ofta_prod.ofta_question_attempt(session_id);
CREATE INDEX IF NOT EXISTS idx_ofta_attempt_question ON ofta_prod.ofta_question_attempt(question_template_id);

COMMENT ON TABLE ofta_prod.ofta_question_attempt IS 'Per-question attempt records within a game session';
