/**
 * Fixture provenance tests. Run with: tsx src/utils/fixtureSeeds.test.ts
 * No framework: the repo's other tests are plain scripts with assertions.
 */
import {
  seedMatchLifecycle,
  publicEvents,
  loadFixtureEvents,
  purgeFixtureRun,
  auditSingleOccurrence,
  fixtureRunsSummary,
  isFixtureEvent,
  EVENTS_STORAGE_KEY,
} from './fixtureSeeds';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
  getItem(key: string): string | null { return this.map.has(key) ? (this.map.get(key) as string) : null; }
  key(index: number): string | null { return [...this.map.keys()][index] ?? null; }
  removeItem(key: string): void { this.map.delete(key); }
  setItem(key: string, value: string): void { this.map.set(key, String(value)); }
}

(globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();

let failures = 0;
const check = (name: string, condition: boolean, detail = '') => {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.log(`FAIL ${name} ${detail}`);
  }
};

const run = () => {
  const clean = seedMatchLifecycle({ runId: 'fx-test-clean', startedAt: new Date('2025-09-01T08:00:00Z') });
  check('clean run seeds four events', clean.events.length === 4, String(clean.events.length));
  check('clean run has no violation', clean.violations.length === 0, JSON.stringify(clean.violations));
  check('every seeded event is marked', clean.events.every(isFixtureEvent));

  const all = JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || '[]');
  check('public reader hides fixtures entirely', publicEvents(all).length === 0);

  const broken = seedMatchLifecycle({ runId: 'fx-test-broken', withViolation: true, startedAt: new Date('2025-09-01T09:00:00Z') });
  check('broken run seeds five events', broken.events.length === 5, String(broken.events.length));
  check('broken run yields exactly one violation', broken.violations.length === 1);
  check('violation names two confirmations', broken.violations[0]?.confirmations === 2);

  check('fixtures are loadable per run', loadFixtureEvents('fx-test-broken').length === 5);
  check('admin summary lists both runs', fixtureRunsSummary().length === 2, JSON.stringify(fixtureRunsSummary()));

  // a real event must survive the purge untouched
  const real = {
    eventId: 'real-1', schemaVersion: 1, entityType: 'request', entityId: 'req-real',
    relatedRequestId: null, eventType: 'request_created', occurredAt: '2025-09-01T07:00:00Z',
    recordedAt: '2025-09-01T07:00:00Z', actorId: 'pharmacy-1', actorType: 'pharmacy',
    source: 'web_client', idempotencyKey: 'real-1', metadata: {},
  };
  localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify([...JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || '[]'), real]));

  const purged = purgeFixtureRun('fx-test-broken');
  check('purge removes exactly the run', purged.removedEvents === 5, JSON.stringify(purged));
  check('purge keeps the remaining run', loadFixtureEvents().length === 4);
  check('purge keeps the real event', publicEvents(JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || '[]')).length === 1);

  const after = auditSingleOccurrence(JSON.parse(localStorage.getItem(EVENTS_STORAGE_KEY) || '[]'));
  check('no violation survives the purge', after.length === 0);

  console.log(failures === 0 ? '\nALL FIXTURE TESTS PASSED' : `\n${failures} FAILURE(S)`);
  if (failures > 0) throw new Error('fixture tests failed');
};

run();
