# Fixture provenance

A fixture is a synthetic event run that lives inside the real event stream, is invisible to every
user-facing view, and can be removed exactly and completely.

It exists for one reason: to exercise analytics and the CHAOS detectors on this platform's own
event shapes, instead of on a foreign CSV or on a generator that knows nothing about our schema.

## Three rules

1. **Every fixture event carries provenance.** `metadata.fixture === true` and `metadata.fixtureRun`
   are written on the event itself — never inferred from an entity id, a name prefix, or a date.
2. **User-facing code reads `publicEvents()`.** It filters fixtures out. The same filter is
   applied in SQL through the `pharma_events_public` view.
3. **A run can be purged exactly.** `purgeFixtureRun(runId)` deletes that run's events and its
   idempotency keys, and nothing else. There is no "delete everything that looks fake".

## Why not a naming convention

Because prefixes get typed by hand, copied, and eventually used by a real record. A column cannot
be typed by accident: `is_fixture` defaults to `0`, and only the seeder writes `1`.

## What a fixture is allowed to claim

| Claim | Allowed |
|---|---|
| "the ingestion path accepts this event" | yes |
| "the detector fires on this shape" | yes |
| "our detection rate is X" | **no** — you seeded the fault |
| "our KPI is Y" | **no** — fixtures are excluded from aggregates by construction |

Any number derived from fixtures is a *plumbing* number, not a *performance* number.

## Usage

```ts
import { seedMatchLifecycle, publicEvents, purgeFixtureRun, loadFixtureEvents } from './utils/fixtureSeeds';

// a clean lifecycle: request -> offer -> match proposed -> match confirmed
const clean = seedMatchLifecycle();

// the deliberate fault: a second confirmation for the same request
const broken = seedMatchLifecycle({ withViolation: true });
broken.violations; // [{ requestId, confirmations: 2, eventIds: [...] }]

publicEvents(events);            // what users may see
loadFixtureEvents(broken.runId);  // what analytics may see
purgeFixtureRun(broken.runId);    // exact removal
```

## The identity this fixture exercises

> one request may be confirmed once.

That is the same statement as *one session may produce one H1*, and it is the reason the second
`match_confirmed` in a run is a break rather than a duplicate. The fixture does not test the
detector's statistics; it tests that the platform can express the violation at all.

## Admin

`fixtureRunsSummary()` returns one row per run with its event count and time span. It is the only
place where fixtures are meant to be visible, and it belongs behind the admin surface.
