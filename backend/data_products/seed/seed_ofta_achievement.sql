INSERT INTO ofta_prod.ofta_achievement (id, title, description, icon, condition_type, condition_value)
VALUES
    ('first_game',     'Welcome to the Game', 'Complete your first game',                'GAME',     'games_played',   1),
    ('streak_5',       'On Fire',             'Get a streak of 5 correct answers',       'FIRE',     'best_streak',    5),
    ('streak_10',      'Unstoppable',         'Get a streak of 10 correct answers',      'BOLT',     'best_streak',    10),
    ('perfect_daily',  'Perfect Day',         'Score 100% on a daily challenge',         'STAR',     'daily_accuracy', 100),
    ('century_club',   'Century Club',        'Play 100 games',                          'TROPHY',   'games_played',   100)
ON CONFLICT (id) DO NOTHING;
