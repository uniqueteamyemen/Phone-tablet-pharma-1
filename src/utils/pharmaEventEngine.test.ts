import { 
  recordMarketEvent, 
  recordRequestCreated, 
  recordRequestEdited, 
  recordRequestCancelled, 
  recordRequestClosedUnmatched,
  recordOfferCreated, 
  recordOfferClosed, 
  recordRepostAttempted, 
  recordRepostSucceeded, 
  recordMatchProposed, 
  recordMatchConfirmed,
  diagnoseUnmatchedReason,
  calculateTimeToMatchStats,
  calculateUnmatchedAnalysis,
  calculateRepostMetrics,
  generateMarketEventsSummaryReport,
  exportEventsToJSON,
  exportEventsToCSV,
  loadMarketEvents,
} from './pharmaEventEngine';
import { PharmaRequest, PharmaOffer, PharmaMatch, PharmaEntity } from '../types/pharmayemen';
import workerHandler from '../worker';

// Polyfill in-memory localStorage for Node testing environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };
}

const mockEntity: PharmaEntity = {
  id: 'ent-test-pharm',
  name: 'صيدلية الاختبار المركزية',
  type: 'pharmacy',
  licenseNumber: 'YE-SAN-2026-TEST',
  governorate: 'صنعاء',
  city: 'صنعاء',
  address: 'شارع الزبيري',
  phone: '+967 777 000 111',
  status: 'verified',
  createdAt: new Date().toISOString(),
};

console.log('======================================================');
console.log('🧪 Starting Event Collection Engine & Telemetry Tests');
console.log('======================================================\n');

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${testName} - ${errorDetail || 'Condition not met'}`);
  }
}

// -------------------------------------------------------------------------
// TEST SUITE 1: REQUEST LIFECYCLE & RAW DRUG NAME PRESERVATION
// -------------------------------------------------------------------------
console.log('--- Test Suite 1: Request Lifecycle & Audit Trail ---');

const req1: PharmaRequest = {
  id: `req-test-${Date.now()}`,
  entityId: mockEntity.id,
  entityName: mockEntity.name,
  isFreeText: true,
  freeTextName: 'أنسولين لانتوس قلم أصلي (سولستار)',
  genericName: 'Insulin Glargine',
  brandName: 'Lantus SoloStar',
  strength: '100 units/ml',
  quantity: 5,
  unit: 'قلم (Pen)',
  urgency: 'critical',
  status: 'open',
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
};

const reqEvent = recordRequestCreated(req1, mockEntity);
assert(Boolean(reqEvent), 'Request created produces a valid event object');
assert(reqEvent?.eventType === 'request_created', 'Event type is request_created');
assert(reqEvent?.metadata.drugNameRaw === 'أنسولين لانتوس قلم أصلي (سولستار)', 'Raw unnormalized drug name is preserved without alteration');
assert(reqEvent?.metadata.quantity === 5, 'Quantity is strictly recorded');
assert(reqEvent?.actorType === 'pharmacy', 'Actor type is recorded accurately');

// -------------------------------------------------------------------------
// TEST SUITE 2: IDEMPOTENCY & DUPLICATE PREVENTION
// -------------------------------------------------------------------------
console.log('\n--- Test Suite 2: Idempotency & Replay Protection ---');

const duplicateAttempt = recordRequestCreated(req1, mockEntity);
assert(duplicateAttempt === null, 'Replaying the same event returns null and does NOT duplicate');

// -------------------------------------------------------------------------
// TEST SUITE 3: REPOST LIFECYCLE & SEPARATION OF ATTEMPT FROM SUCCESS
// -------------------------------------------------------------------------
console.log('\n--- Test Suite 3: Repost Lifecycle (Attempt vs Success) ---');

// 1. Repost attempt
const { event: attemptEvt, attemptId } = recordRepostAttempted(req1, 'telegram', mockEntity);
assert(Boolean(attemptEvt), 'Repost attempt records a distinct repost_attempted event');
assert(attemptEvt?.eventType === 'repost_attempted', 'Event type is repost_attempted');
assert(Boolean(attemptId), 'Generates unique attemptId for traceability');

// 2. Repost success (does not create a new request)
const successEvt = recordRepostSucceeded(attemptId, req1, 'telegram', mockEntity);
assert(Boolean(successEvt), 'Confirmed repost records repost_succeeded');
assert(successEvt?.eventType === 'repost_succeeded', 'Event type is repost_succeeded');
assert(successEvt?.metadata.repostSuccessCount === 1, 'Verified success counter is incremented to 1');

// 3. Second repost attempt on Facebook
const { attemptId: fbAttemptId } = recordRepostAttempted(req1, 'facebook', mockEntity);
const fbSuccessEvt = recordRepostSucceeded(fbAttemptId, req1, 'facebook', mockEntity);
assert(fbSuccessEvt?.metadata.repostSuccessCount === 2, 'Counter correctly increments on subsequent verified successes');

// -------------------------------------------------------------------------
// TEST SUITE 4: TIME-TO-MATCH METRIC CALCULATION
// -------------------------------------------------------------------------
console.log('\n--- Test Suite 4: Time-to-Match & Clinical Linkage ---');

const testMatch: PharmaMatch = {
  id: `match-test-${Date.now()}`,
  offerId: 'off-test-1',
  requestId: req1.id,
  drugName: req1.genericName!,
  activeIngredient: req1.genericName!,
  offeringEntity: 'مستودع الأمل الدوائي',
  requestingEntity: mockEntity.name,
  offerQuantity: 10,
  requestQuantity: 5,
  matchType: 'exact',
  createdAt: new Date().toISOString(),
  status: 'connected',
  isSameStrength: true,
  isSameDosageForm: true,
  clinicalMatchKind: 'exact_clinical',
  clinicalMatchLabel: 'تطابق سريري تام',
};

const matchConfirmedEvt = recordMatchConfirmed(testMatch, req1.createdAt, mockEntity);
assert(Boolean(matchConfirmedEvt), 'Match confirmed records match_confirmed event');
assert(
  typeof matchConfirmedEvt?.metadata.timeToMatchSeconds === 'number' && 
  (matchConfirmedEvt?.metadata.timeToMatchSeconds as number) > 7000,
  'Time-to-Match calculated correctly in seconds (~7200s for 2-hour delta)'
);

// -------------------------------------------------------------------------
// TEST SUITE 5: UNMATCHED ROOT CAUSE DIAGNOSIS
// -------------------------------------------------------------------------
console.log('\n--- Test Suite 5: Unmatched Reason Root Cause Analysis ---');

const emptyOffers: PharmaOffer[] = [];
const diagnosis1 = diagnoseUnmatchedReason(req1, emptyOffers, []);
assert(
  diagnosis1.reason === 'no_supply_signal_in_market',
  'Diagnoses total market absence when no matching active ingredient offer exists'
);

const differentStrengthOffer: PharmaOffer = {
  id: 'off-diff-str',
  entityId: 'ent-other',
  entityName: 'صيدلية أخرى',
  isFreeText: false,
  genericName: 'Insulin Glargine',
  strength: '300 units/ml (Toujeo)', // Different strength from 100 units/ml
  quantity: 10,
  unit: 'قلم',
  currency: 'YER',
  expiryDate: '2028-01-01',
  status: 'active',
  createdAt: new Date().toISOString(),
};

const diagnosis2 = diagnoseUnmatchedReason(req1, [differentStrengthOffer], []);
assert(
  diagnosis2.reason === 'strength_mismatch_only',
  'Correctly diagnoses strength_mismatch_only when active ingredient is present but strength differs'
);

// -------------------------------------------------------------------------
// TEST SUITE 6: DATA EXPORT TO JSON & CSV
// -------------------------------------------------------------------------
console.log('\n--- Test Suite 6: Event Store Export (JSON & CSV) ---');

const exportedJson = exportEventsToJSON();
const parsedJson = JSON.parse(exportedJson);
assert(Array.isArray(parsedJson) && parsedJson.length >= 4, 'exportEventsToJSON produces valid JSON array of events');

const exportedCsv = exportEventsToCSV();
assert(exportedCsv.startsWith('eventId,schemaVersion'), 'exportEventsToCSV starts with standard column headers');
assert(exportedCsv.includes('request_created'), 'exportEventsToCSV includes serialized event records');

// -------------------------------------------------------------------------
// TEST SUITE 7: CLOUDFLARE WORKER EDGE HANDLER VERIFICATION
// -------------------------------------------------------------------------
console.log('\n--- Test Suite 7: Cloudflare Worker Edge Handler ---');

async function testCloudflareWorker() {
  // 1. Health check
  const healthReq = new Request('https://ypharma1.deterministicsolutionsdesign.com/api/health');
  const healthRes = await workerHandler.fetch(healthReq, {});
  const healthJson = await healthRes.json();
  assert(healthRes.status === 200, 'Cloudflare Worker /api/health responds with 200');
  assert(healthJson.status === 'healthy', 'Health check reports healthy');

  // 2. Ingest event via POST
  const testIngestReq = new Request('https://ypharma1.deterministicsolutionsdesign.com/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Pharma-Idempotency-Key': 'edge-test-key-101',
    },
    body: JSON.stringify({
      eventId: 'evt-edge-101',
      eventType: 'request_created',
      entityId: 'req-edge-1',
      occurredAt: new Date().toISOString(),
      metadata: { drugNameRaw: 'Test Edge Drug', quantity: 10 },
    }),
  });

  const ingestRes = await workerHandler.fetch(testIngestReq, {});
  assert(ingestRes.status === 201, 'Cloudflare Worker /api/events ingests event with 201 Created');

  // 3. Test edge deduplication
  const replayReq = new Request('https://ypharma1.deterministicsolutionsdesign.com/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Pharma-Idempotency-Key': 'edge-test-key-101',
    },
    body: JSON.stringify({
      eventId: 'evt-edge-101-replay',
      eventType: 'request_created',
      entityId: 'req-edge-1',
    }),
  });

  const replayRes = await workerHandler.fetch(replayReq, {});
  const replayJson = await replayRes.json();
  assert(replayJson.status === 'idempotent_duplicate_ignored', 'Cloudflare Worker ignores duplicate replay on edge');

  // 4. GET telemetry summary
  const getReq = new Request('https://ypharma1.deterministicsolutionsdesign.com/api/events');
  const getRes = await workerHandler.fetch(getReq, {});
  const getJson = await getRes.json();
  assert(getRes.status === 200 && getJson.edgeBufferedCount > 0, 'Cloudflare Worker GET returns telemetry summary');
}

testCloudflareWorker().then(() => {
  console.log('\n======================================================');
  console.log(`📊 Test Results: Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('======================================================');
  if (failedCount > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All Event Collection Engine tests completed successfully!\n');
  }
}).catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
