CREATE TABLE IF NOT EXISTS ofta_prod.ofta_celebrity (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name           VARCHAR(255)    NOT NULL,
    date_of_birth       DATE            NOT NULL,
    star_sign           VARCHAR(50)     NOT NULL,
    primary_category    VARCHAR(100)    NOT NULL,
    secondary_category  VARCHAR(100),
    nationality         VARCHAR(100),
    gender              VARCHAR(50),
    popularity_score    NUMERIC(5,2)    NOT NULL DEFAULT 50.0,
    image_url           TEXT,
    image_license       VARCHAR(100),
    hints_easy          JSONB           NOT NULL DEFAULT '[]'::jsonb,
    hints_medium        JSONB           NOT NULL DEFAULT '[]'::jsonb,
    hints_hard          JSONB           NOT NULL DEFAULT '[]'::jsonb,
    aliases             TEXT[]          NOT NULL DEFAULT '{}',
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ofta_celebrity_category   ON ofta_prod.ofta_celebrity(primary_category);
CREATE INDEX IF NOT EXISTS idx_ofta_celebrity_active     ON ofta_prod.ofta_celebrity(is_active);
CREATE INDEX IF NOT EXISTS idx_ofta_celebrity_popularity ON ofta_prod.ofta_celebrity(popularity_score DESC);
CREATE INDEX IF NOT EXISTS idx_ofta_celebrity_name       ON ofta_prod.ofta_celebrity(full_name);

COMMENT ON TABLE ofta_prod.ofta_celebrity IS 'Celebrities used as question subjects across all OFTA game modes';
