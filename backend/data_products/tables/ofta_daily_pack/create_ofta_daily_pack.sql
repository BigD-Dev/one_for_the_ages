CREATE TABLE IF NOT EXISTS ofta_prod.ofta_daily_pack (
    pack_date           DATE            PRIMARY KEY,
    pack_json_url       TEXT            NOT NULL,
    pack_hash           VARCHAR(64)     NOT NULL,
    question_count      INTEGER         NOT NULL,
    created_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ofta_pack_date ON ofta_prod.ofta_daily_pack(pack_date DESC);

COMMENT ON TABLE ofta_prod.ofta_daily_pack IS 'Daily challenge question bundles';
