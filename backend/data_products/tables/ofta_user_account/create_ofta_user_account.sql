CREATE TABLE IF NOT EXISTS ofta_prod.ofta_user_account (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid        VARCHAR(255)    UNIQUE,
    display_name        VARCHAR(255),
    email               VARCHAR(320),
    country             VARCHAR(2),
    device_os           VARCHAR(50),
    auth_provider       VARCHAR(50)     NOT NULL DEFAULT 'anonymous',
    is_banned           BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_active_at_tms  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at_tms      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ofta_user_firebase_uid ON ofta_prod.ofta_user_account(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_ofta_user_created      ON ofta_prod.ofta_user_account(created_at_tms DESC);

COMMENT ON TABLE ofta_prod.ofta_user_account IS 'OFTA player accounts, keyed by Firebase UID';
