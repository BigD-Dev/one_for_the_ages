CREATE TABLE IF NOT EXISTS ofta_prod.ofta_achievement (
    id                  VARCHAR(100)    PRIMARY KEY,
    title               VARCHAR(255)    NOT NULL,
    description         TEXT            NOT NULL,
    icon                VARCHAR(50),
    condition_type      VARCHAR(100)    NOT NULL,
    condition_value     INTEGER         NOT NULL,
    created_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE ofta_prod.ofta_achievement IS 'Catalog of achievement badges users can unlock';
