/**
 * The user-facing reader must never return a fixture, and the raw reader must.
 * Run with: tsx src/utils/publicEvents.test.ts
 */
import { seedMatchLifecycle, EVENTS_STORAGE_KEY } from './fixtureSeeds';
import { loadMarketEvents, loadPublicEvents } from './pharmaEventEngine';

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
  getItem(k: string): string | null { return this.map.has(k) ? (this.map.get(k) as string) : null; }
  key(i: number): string | null { return [...this.map.keys()][i] ?? null; }
  removeItem(k: string): void { this.map.delete(k); }
  setItem(k: string, v: string): void { this.map.set(k, String(v)); }
}
(globalThis as unknown as { localStorage: Storage }).localStorage = new MemoryStorage();

const real = {
  eventId: 'real-1', schemaVersion: 1, entityType: 'request', entityId: 'req-real',
  relatedRequestId: null, eventType: 'request_created', occurredAt: '2025-10-01T06:00:00.000Z',
  recordedAt: '2025-10-01T06:00:00.000Z', actorId: 'pharmacy-1', actorType: 'pharmacy',
  source: 'web_client', idempotencyKey: 'real-1', metadata: {},
};
localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify([real]));
seedMatchLifecycle({ runId: 'fx-public-test', withViolation: true });

let failures = 0;
const check = (name: string, ok: boolean, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ' ' + detail}`);
  if (!ok) failures += 1;
};

check('raw reader sees the fixture stream', loadMarketEvents().length === 6, String(loadMarketEvents().length));
check('public reader sees only the real event', loadPublicEvents().length === 1, String(loadPublicEvents().length));
check('public reader keeps the real id', loadPublicEvents()[0]?.eventId === 'real-1');

console.log(failures === 0 ? '\nPUBLIC READER OK' : `\n${failures} FAILURE(S)`);
if (failures) throw new Error('public reader test failed');
