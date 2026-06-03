CREATE TABLE IF NOT EXISTS ofta_prod.ofta_telemetry_event (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID,
    event_type          VARCHAR(100)    NOT NULL,
    event_data          JSONB,
    client_ts_tms       TIMESTAMP,
    server_ts_tms       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    device_os           VARCHAR(50),
    app_version         VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_ofta_telemetry_type ON ofta_prod.ofta_telemetry_event(event_type);
CREATE INDEX IF NOT EXISTS idx_ofta_telemetry_time ON ofta_prod.ofta_telemetry_event(server_ts_tms DESC);
CREATE INDEX IF NOT EXISTS idx_ofta_telemetry_user ON ofta_prod.ofta_telemetry_event(user_id);

COMMENT ON TABLE ofta_prod.ofta_telemetry_event IS 'Client-emitted analytics/telemetry events';
