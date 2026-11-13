-- Cloudflare D1 Migration: 0002_add_fixture_provenance.sql
-- Fixture provenance for the append-only event store.
-- Rules: a fixture is a first-class column, never a naming convention.
--        fixtures are excluded from the public view and from every aggregate by default.

ALTER TABLE pharma_events ADD COLUMN is_fixture INTEGER NOT NULL DEFAULT 0;
ALTER TABLE pharma_events ADD COLUMN fixture_run TEXT;

CREATE INDEX IF NOT EXISTS idx_pharma_events_fixture
    ON pharma_events(is_fixture, fixture_run);

-- Everything user-facing reads this view, so a fixture cannot leak into a page by accident.
CREATE VIEW IF NOT EXISTS pharma_events_public AS
SELECT
    event_id, schema_version, entity_type, entity_id, related_request_id,
    event_type, occurred_at, recorded_at, actor_id, actor_type, source,
    idempotency_key, metadata_json
FROM pharma_events
WHERE is_fixture = 0;

-- A fixture that is older than its run is still a fixture. Nothing auto-expires.
CREATE INDEX IF NOT EXISTS idx_pharma_events_fixture_recorded
    ON pharma_events(fixture_run, recorded_at);
