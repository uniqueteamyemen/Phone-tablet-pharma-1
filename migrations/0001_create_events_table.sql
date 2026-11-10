-- Cloudflare D1 Migration: 0001_create_events_table.sql
-- PharmaYemen Centralized Append-Only Event Store
-- Designed for Cloudflare D1 (SQLite-compatible)

CREATE TABLE IF NOT EXISTS pharma_events (
    event_id TEXT PRIMARY KEY,
    schema_version INTEGER NOT NULL DEFAULT 1,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    related_request_id TEXT,
    event_type TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    recorded_at TEXT NOT NULL,
    actor_id TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'web_client',
    idempotency_key TEXT NOT NULL UNIQUE,
    metadata_json TEXT NOT NULL DEFAULT '{}'
);

-- Indices for rapid querying, filtering, analytics, and time-to-match calculations
CREATE UNIQUE INDEX IF NOT EXISTS idx_pharma_events_idempotency_key 
    ON pharma_events(idempotency_key);

CREATE INDEX IF NOT EXISTS idx_pharma_events_event_type 
    ON pharma_events(event_type);

CREATE INDEX IF NOT EXISTS idx_pharma_events_entity 
    ON pharma_events(entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_pharma_events_related_request 
    ON pharma_events(related_request_id);

CREATE INDEX IF NOT EXISTS idx_pharma_events_occurred_at 
    ON pharma_events(occurred_at DESC);

CREATE INDEX IF NOT EXISTS idx_pharma_events_recorded_at 
    ON pharma_events(recorded_at DESC);
