INSERT INTO ofta_prod.ofta_app_config (key, value)
VALUES
    ('min_client_version', '{"ios": "1.0.0", "android": "1.0.0"}'::jsonb),
    ('feature_flags',      '{"reverse_mode": true, "leaderboard": true, "daily_challenge": true}'::jsonb),
    ('maintenance_mode',   'false'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
