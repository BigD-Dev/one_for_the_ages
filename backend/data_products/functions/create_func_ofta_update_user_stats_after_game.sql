CREATE OR REPLACE FUNCTION ofta_prod.ofta_update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO ofta_prod.ofta_user_stats (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;

    UPDATE ofta_prod.ofta_user_stats
    SET
        games_played    = games_played + 1,
        lifetime_score  = lifetime_score + NEW.total_score,
        best_streak     = GREATEST(best_streak, NEW.best_streak),
        total_questions = total_questions + NEW.questions_count,
        total_correct   = total_correct + NEW.correct_count,
        accuracy_pct    = CASE
                            WHEN total_questions + NEW.questions_count > 0
                            THEN ((total_correct + NEW.correct_count)::NUMERIC
                                  / (total_questions + NEW.questions_count)::NUMERIC) * 100
                            ELSE 0
                          END,
        updated_at_tms  = CURRENT_TIMESTAMP
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ofta_trigger_update_user_stats ON ofta_prod.ofta_game_session;
CREATE TRIGGER ofta_trigger_update_user_stats
    AFTER UPDATE OF ended_at_tms ON ofta_prod.ofta_game_session
    FOR EACH ROW
    WHEN (NEW.ended_at_tms IS NOT NULL AND OLD.ended_at_tms IS NULL)
    EXECUTE FUNCTION ofta_prod.ofta_update_user_stats_after_game();

COMMENT ON FUNCTION ofta_prod.ofta_update_user_stats_after_game()
    IS 'Trigger function that aggregates per-game results into ofta_user_stats when a session ends';
