CREATE TABLE IF NOT EXISTS ofta_prod.ofta_app_config (
    key                 VARCHAR(100)    PRIMARY KEY,
    value               JSONB           NOT NULL,
    updated_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ofta_prod.ofta_app_config IS 'Runtime configuration / feature flags for the OFTA app';
