import { 
  PharmaMarketEvent, 
  PharmaMarketEventType, 
  IngestEventPayload, 
  EventActorType, 
  UnmatchedReasonCode,
  TimeToMatchMetric,
  UnmatchedAnalysisReport,
  RepostMetricsReport,
  MarketEventsSummaryReport
} from '../types/pharmaEvents';
import { PharmaRequest, PharmaOffer, PharmaMatch, PharmaEntity, PharmaCatalogDrug } from '../types/pharmayemen';
import { evaluateClinicalDrugMatch } from './pharmaClinicalMatcher';
import { isFixtureEvent } from './fixtureSeeds';

const EVENT_STREAM_STORAGE_KEY = 'pharmayemen_events_stream_v1';
const IDEMPOTENCY_KEYS_STORAGE_KEY = 'pharmayemen_idempotency_keys_v1';
const REPOST_SUCCESS_COUNTER_KEY = 'pharmayemen_repost_success_counters_v1';

// Max cached in-memory events before rotating
const MAX_LOCAL_EVENTS = 2000;

/**
 * Loads the persistent event stream from storage
 */
export const loadMarketEvents = (): PharmaMarketEvent[] => {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(EVENT_STREAM_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[EventEngine] Failed to load event stream from storage', err);
    return [];
  }
};

/**
 * The reader every user-facing and analytical path must use.
 * Fixtures are provenance-tagged seeded runs; they are excluded here by construction,
 * so no calculator can count them even by accident.
 */
export const loadPublicEvents = (): PharmaMarketEvent[] =>
  loadMarketEvents().filter((event) => !isFixtureEvent(event as { metadata?: Record<string, unknown> | null }));


/**
 * Persists event stream to storage safely
 */
const saveMarketEvents = (events: PharmaMarketEvent[]): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    const capped = events.slice(-MAX_LOCAL_EVENTS);
    localStorage.setItem(EVENT_STREAM_STORAGE_KEY, JSON.stringify(capped));
  } catch (err) {
    console.error('[EventEngine] Failed to persist event stream', err);
  }
};

/**
 * Checks if an idempotency key was already processed
 */
export const isIdempotencyKeyRecorded = (key: string): boolean => {
  try {
    if (typeof localStorage === 'undefined') return false;
    const raw = localStorage.getItem(IDEMPOTENCY_KEYS_STORAGE_KEY);
    const keys: Record<string, number> = raw ? JSON.parse(raw) : {};
    return Boolean(keys[key]);
  } catch {
    return false;
  }
};

/**
 * Marks an idempotency key as processed
 */
const markIdempotencyKeyRecorded = (key: string): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    const raw = localStorage.getItem(IDEMPOTENCY_KEYS_STORAGE_KEY);
    const keys: Record<string, number> = raw ? JSON.parse(raw) : {};
    keys[key] = Date.now();
    // Prune keys older than 30 days
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const pruned: Record<string, number> = {};
    for (const [k, ts] of Object.entries(keys)) {
      if (ts > thirtyDaysAgo) pruned[k] = ts;
    }
    localStorage.setItem(IDEMPOTENCY_KEYS_STORAGE_KEY, JSON.stringify(pruned));
  } catch (err) {
    console.error('[EventEngine] Failed to record idempotency key', err);
  }
};

/**
 * Asynchronously posts event to Cloudflare Worker endpoint if available
 */
const dispatchEventToCloudflareWorker = async (event: PharmaMarketEvent): Promise<void> => {
  if (typeof window === 'undefined') return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s timeout non-blocking
    
    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Pharma-Idempotency-Key': event.idempotencyKey,
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    }).catch(() => {
      // Quietly ignore network failures in offline / dev environments
    });
    clearTimeout(timeoutId);
  } catch {
    // Non-blocking fallback
  }
};

/**
 * Primary Core Event Ingestion Function
 * Implements Append-Only Event Store, Idempotency Deduplication, and UTC Time-Stamping
 */
export const recordMarketEvent = (payload: IngestEventPayload): PharmaMarketEvent | null => {
  try {
    const nowUtc = new Date().toISOString();
    const occurredAt = payload.occurredAt || nowUtc;

    // Generate or enforce idempotency key
    const idempotencyKey = payload.idempotencyKey || 
      `${payload.eventType}-${payload.entityId}-${occurredAt.slice(0, 19)}`;

    // Rule: Duplicate prevention
    if (isIdempotencyKeyRecorded(idempotencyKey)) {
      return null;
    }

    const eventId = `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const event: PharmaMarketEvent = {
      eventId,
      schemaVersion: 1,
      entityType: payload.entityType,
      entityId: payload.entityId,
      relatedRequestId: payload.relatedRequestId || null,
      eventType: payload.eventType,
      occurredAt,
      recordedAt: nowUtc,
      actorId: payload.actorId || 'system',
      actorType: payload.actorType || 'pharmacy',
      source: payload.source || 'web_client',
      idempotencyKey,
      metadata: payload.metadata || {},
    };

    // Append to Event Store
    const currentEvents = loadMarketEvents();
    currentEvents.push(event);
    saveMarketEvents(currentEvents);
    markIdempotencyKeyRecorded(idempotencyKey);

    // Non-blocking dispatch to Cloudflare Worker edge route
    dispatchEventToCloudflareWorker(event);

    return event;
  } catch (err) {
    // Non-blocking failure guarantee: App functionality NEVER crashes if telemetry errors
    console.error('[EventEngine] Error capturing market event:', err);
    return null;
  }
};

/* =========================================================================
   REQUEST LIFECYCLE EVENT CAPTURE HELPERS
   ========================================================================= */

export const recordRequestCreated = (
  req: PharmaRequest,
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'request_created',
    entityType: 'request',
    entityId: req.id,
    occurredAt: req.createdAt || new Date().toISOString(),
    actorId: actor?.id || req.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `req-created-${req.id}`,
    metadata: {
      drugNameRaw: req.freeTextName || req.genericName || req.brandName || null,
      genericName: req.genericName || null,
      brandName: req.brandName || null,
      strength: req.strength || null,
      quantity: req.quantity,
      unit: req.unit,
      governorate: actor?.governorate || null,
      urgency: req.urgency,
    },
  });
};

export const recordRequestEdited = (
  req: PharmaRequest,
  previousValues: Partial<PharmaRequest>,
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  const changedFields = Object.keys(previousValues);
  return recordMarketEvent({
    eventType: 'request_edited',
    entityType: 'request',
    entityId: req.id,
    actorId: actor?.id || req.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    metadata: {
      drugNameRaw: req.freeTextName || req.genericName || req.brandName || null,
      quantity: req.quantity,
      unit: req.unit,
      urgency: req.urgency,
      changedFields,
      previousValues,
    },
  });
};

export const recordRequestCancelled = (
  req: PharmaRequest,
  actor?: PharmaEntity,
  reason?: string
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'request_cancelled',
    entityType: 'request',
    entityId: req.id,
    actorId: actor?.id || req.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `req-cancelled-${req.id}-${Date.now()}`,
    metadata: {
      drugNameRaw: req.freeTextName || req.genericName || req.brandName || null,
      unmatchedReason: 'user_manual_closure',
      unmatchedReasonNotes: reason || 'إلغاء يدوي من قبل المنشأة المعلنة',
      quantity: req.quantity,
    },
  });
};

export const recordRequestExpired = (
  req: PharmaRequest
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'request_expired',
    entityType: 'request',
    entityId: req.id,
    actorId: 'system_cron',
    actorType: 'system_cron',
    source: 'background_worker',
    idempotencyKey: `req-expired-${req.id}`,
    metadata: {
      drugNameRaw: req.freeTextName || req.genericName || req.brandName || null,
      unmatchedReason: 'expired_after_7_days',
      unmatchedReasonNotes: 'انتهت صلاحية الإشارة تلقائياً بعد مرور 7 أيام دون مطابقة',
    },
  });
};

/**
 * Analyzes why an open request failed to find a match before closing
 */
export const diagnoseUnmatchedReason = (
  req: PharmaRequest,
  activeOffers: PharmaOffer[],
  catalog: PharmaCatalogDrug[]
): { reason: UnmatchedReasonCode; notes: string } => {
  const reqDrugName = (req.genericName || req.freeTextName || '').trim().toLowerCase();

  // 1. Check if ANY offer in the market exists for the same active ingredient
  const anyIngredientOffer = activeOffers.find((off) => {
    const offName = (off.genericName || off.freeTextName || '').trim().toLowerCase();
    return offName.includes(reqDrugName) || reqDrugName.includes(offName);
  });

  if (!anyIngredientOffer) {
    return {
      reason: 'no_supply_signal_in_market',
      notes: 'انعدام تام لإشارات العرض للمادة الفعالة في عموم السوق اليمني',
    };
  }

  // 2. An offer exists, test clinical compatibility
  const clinicalResult = evaluateClinicalDrugMatch(anyIngredientOffer, req, catalog);
  if (!clinicalResult) {
    return {
      reason: 'dosage_form_mismatch_only',
      notes: 'توجد عروض لنفس المادة لكن بهيئة دوائية أو مواصفات غير متوافقة سريرياً',
    };
  }

  if (clinicalResult.clinicalMatchKind === 'alt_strength') {
    return {
      reason: 'strength_mismatch_only',
      notes: `المادة متوفرة ولكن بتركيز بديل (${anyIngredientOffer.strength || 'مختلف'}) وليس بالتركيز المطلوب (${req.strength || 'محدد'})`,
    };
  }

  return {
    reason: 'geographic_gap',
    notes: 'توفر الصنف ولكن في نطاق جغرافي آخر دون تنسيق لوجستي فوري',
  };
};

export const recordRequestClosedUnmatched = (
  req: PharmaRequest,
  activeOffers: PharmaOffer[],
  catalog: PharmaCatalogDrug[],
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  const diagnosis = diagnoseUnmatchedReason(req, activeOffers, catalog);

  return recordMarketEvent({
    eventType: 'request_closed_unmatched',
    entityType: 'request',
    entityId: req.id,
    actorId: actor?.id || req.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `req-unmatched-${req.id}`,
    metadata: {
      drugNameRaw: req.freeTextName || req.genericName || req.brandName || null,
      genericName: req.genericName || null,
      unmatchedReason: diagnosis.reason,
      unmatchedReasonNotes: diagnosis.notes,
      quantity: req.quantity,
      unit: req.unit,
      urgency: req.urgency,
    },
  });
};

/* =========================================================================
   OFFER LIFECYCLE EVENT CAPTURE HELPERS
   ========================================================================= */

export const recordOfferCreated = (
  off: PharmaOffer,
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'offer_created',
    entityType: 'offer',
    entityId: off.id,
    occurredAt: off.createdAt || new Date().toISOString(),
    actorId: actor?.id || off.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `off-created-${off.id}`,
    metadata: {
      drugNameRaw: off.freeTextName || off.genericName || off.brandName || null,
      genericName: off.genericName || null,
      brandName: off.brandName || null,
      strength: off.strength || null,
      quantity: off.quantity,
      unit: off.unit,
      governorate: actor?.governorate || null,
    },
  });
};

export const recordOfferClosed = (
  off: PharmaOffer,
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'offer_closed',
    entityType: 'offer',
    entityId: off.id,
    actorId: actor?.id || off.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `off-closed-${off.id}-${Date.now()}`,
    metadata: {
      drugNameRaw: off.freeTextName || off.genericName || off.brandName || null,
      quantity: off.quantity,
    },
  });
};

export const recordOfferExpired = (
  off: PharmaOffer
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'offer_expired',
    entityType: 'offer',
    entityId: off.id,
    actorId: 'system_cron',
    actorType: 'system_cron',
    source: 'background_worker',
    idempotencyKey: `off-expired-${off.id}`,
    metadata: {
      drugNameRaw: off.freeTextName || off.genericName || off.brandName || null,
    },
  });
};

/* =========================================================================
   REPOST / SOCIAL BROADCAST EVENT HELPERS
   Guarantees: Repost is NOT a new request, attempt is separated from success
   ========================================================================= */

export const recordRepostAttempted = (
  item: PharmaRequest | PharmaOffer,
  platform: 'telegram' | 'facebook' | 'whatsapp' | 'instagram' | 'batch_digest',
  actor?: PharmaEntity
): { event: PharmaMarketEvent | null; attemptId: string } => {
  const attemptId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const event = recordMarketEvent({
    eventType: 'repost_attempted',
    entityType: 'broadcast',
    entityId: item.id,
    relatedRequestId: 'urgency' in item ? item.id : null,
    actorId: actor?.id || item.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    metadata: {
      broadcastPlatform: platform,
      repostAttemptId: attemptId,
      drugNameRaw: item.genericName || item.brandName || ('freeTextName' in item ? item.freeTextName : null) || null,
      quantity: item.quantity,
      unit: item.unit,
      governorate: actor?.governorate || null,
    },
  });

  return { event, attemptId };
};

export const recordRepostSucceeded = (
  attemptId: string,
  item: PharmaRequest | PharmaOffer,
  platform: 'telegram' | 'facebook' | 'whatsapp' | 'instagram' | 'batch_digest',
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  // Update incremental verified success counter
  let newCount = 1;
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(REPOST_SUCCESS_COUNTER_KEY);
      const counters: Record<string, number> = raw ? JSON.parse(raw) : {};
      counters[item.id] = (counters[item.id] || 0) + 1;
      newCount = counters[item.id];
      localStorage.setItem(REPOST_SUCCESS_COUNTER_KEY, JSON.stringify(counters));
    }
  } catch {
    // ignore
  }

  return recordMarketEvent({
    eventType: 'repost_succeeded',
    entityType: 'broadcast',
    entityId: item.id,
    relatedRequestId: 'urgency' in item ? item.id : null,
    actorId: actor?.id || item.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `repost-succ-${attemptId}`,
    metadata: {
      repostAttemptId: attemptId,
      broadcastPlatform: platform,
      repostSuccessCount: newCount,
      drugNameRaw: item.genericName || item.brandName || ('freeTextName' in item ? item.freeTextName : null) || null,
    },
  });
};

export const recordRepostFailed = (
  attemptId: string,
  item: PharmaRequest | PharmaOffer,
  platform: 'telegram' | 'facebook' | 'whatsapp' | 'instagram' | 'batch_digest',
  failureReason: string,
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'repost_failed',
    entityType: 'broadcast',
    entityId: item.id,
    relatedRequestId: 'urgency' in item ? item.id : null,
    actorId: actor?.id || item.entityId,
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `repost-fail-${attemptId}`,
    metadata: {
      repostAttemptId: attemptId,
      broadcastPlatform: platform,
      failureReason,
    },
  });
};

/* =========================================================================
   MATCH & COORDINATION EVENT HELPERS (With Time-to-Match calculation)
   ========================================================================= */

export const recordMatchProposed = (
  match: PharmaMatch
): PharmaMarketEvent | null => {
  return recordMarketEvent({
    eventType: 'match_proposed',
    entityType: 'match',
    entityId: match.id,
    relatedRequestId: match.requestId,
    idempotencyKey: `match-proposed-${match.offerId}-${match.requestId}`,
    metadata: {
      matchId: match.id,
      drugNameRaw: match.drugName,
      genericName: match.activeIngredient,
      clinicalMatchKind: match.clinicalMatchKind,
      offeringEntityId: match.offeringEntity,
      requestingEntityId: match.requestingEntity,
    },
  });
};

export const recordMatchConfirmed = (
  match: PharmaMatch,
  requestCreatedAt?: string,
  actor?: PharmaEntity
): PharmaMarketEvent | null => {
  // Calculate precise Time-to-Match in seconds
  let timeToMatchSeconds: number | null = null;
  if (requestCreatedAt) {
    const createdTime = new Date(requestCreatedAt).getTime();
    const matchTime = new Date().getTime();
    if (!isNaN(createdTime) && matchTime >= createdTime) {
      timeToMatchSeconds = Math.max(1, Math.round((matchTime - createdTime) / 1000));
    }
  }

  return recordMarketEvent({
    eventType: 'match_confirmed',
    entityType: 'match',
    entityId: match.id,
    relatedRequestId: match.requestId,
    actorId: actor?.id || 'actor-coordination',
    actorType: (actor?.type as EventActorType) || 'pharmacy',
    idempotencyKey: `match-confirmed-${match.id}`,
    metadata: {
      matchId: match.id,
      drugNameRaw: match.drugName,
      genericName: match.activeIngredient,
      clinicalMatchKind: match.clinicalMatchKind,
      timeToMatchSeconds,
      offeringEntityId: match.offeringEntity,
      requestingEntityId: match.requestingEntity,
    },
  });
};

/* =========================================================================
   ANALYTICAL EXTRACTION & REPORTING FUNCTIONS
   ========================================================================= */

/**
 * Calculates Time-to-Match statistics grouped by drug name
 */
export const calculateTimeToMatchStats = (events?: PharmaMarketEvent[]): TimeToMatchMetric[] => {
  const stream = events || loadPublicEvents();
  const confirmedMatches = stream.filter(
    (e) => e.eventType === 'match_confirmed' && typeof e.metadata.timeToMatchSeconds === 'number'
  );

  const grouped = new Map<string, number[]>();

  confirmedMatches.forEach((e) => {
    const name = e.metadata.drugNameRaw || e.metadata.genericName || 'أصناف عامة';
    const list = grouped.get(name) || [];
    list.push(e.metadata.timeToMatchSeconds as number);
    grouped.set(name, list);
  });

  const formatDuration = (secs: number): string => {
    if (secs < 60) return `${secs} ثانية`;
    if (secs < 3600) return `${Math.round(secs / 60)} دقيقة`;
    if (secs < 86400) return `${(secs / 3600).toFixed(1)} ساعة`;
    return `${(secs / 86400).toFixed(1)} يوم`;
  };

  const results: TimeToMatchMetric[] = [];

  grouped.forEach((durations, drugName) => {
    const total = durations.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / durations.length);
    const min = Math.min(...durations);
    const max = Math.max(...durations);

    results.push({
      drugName,
      matchesCount: durations.length,
      averageSeconds: avg,
      minSeconds: min,
      maxSeconds: max,
      fastestMatchFormatted: formatDuration(min),
      averageMatchFormatted: formatDuration(avg),
    });
  });

  return results.sort((a, b) => b.matchesCount - a.matchesCount);
};

/**
 * Analyzes reasons for unmatched and closed requests
 */
export const calculateUnmatchedAnalysis = (events?: PharmaMarketEvent[]): UnmatchedAnalysisReport => {
  const stream = events || loadPublicEvents();
  const unmatchedEvents = stream.filter(
    (e) => e.eventType === 'request_closed_unmatched' || e.eventType === 'request_expired'
  );

  const breakdown: Record<UnmatchedReasonCode, number> = {
    no_supply_signal_in_market: 0,
    strength_mismatch_only: 0,
    dosage_form_mismatch_only: 0,
    geographic_gap: 0,
    expired_after_7_days: 0,
    user_manual_closure: 0,
    unknown: 0,
  };

  const drugTally = new Map<string, { count: number; primaryReason: UnmatchedReasonCode }>();

  unmatchedEvents.forEach((e) => {
    const reason = e.metadata.unmatchedReason || (e.eventType === 'request_expired' ? 'expired_after_7_days' : 'unknown');
    breakdown[reason] = (breakdown[reason] || 0) + 1;

    const drug = e.metadata.drugNameRaw || 'صنف غير محدد';
    const entry = drugTally.get(drug) || { count: 0, primaryReason: reason };
    entry.count += 1;
    drugTally.set(drug, entry);
  });

  const topUnmatchedDrugs = Array.from(drugTally.entries())
    .map(([drugName, data]) => ({ drugName, count: data.count, primaryReason: data.primaryReason }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalClosedUnmatched: unmatchedEvents.length,
    reasonsBreakdown: breakdown,
    topUnmatchedDrugs,
  };
};

/**
 * Analyzes social media repost metrics and confirmed success rates
 */
export const calculateRepostMetrics = (events?: PharmaMarketEvent[]): RepostMetricsReport => {
  const stream = events || loadPublicEvents();
  const attempts = stream.filter((e) => e.eventType === 'repost_attempted');
  const successes = stream.filter((e) => e.eventType === 'repost_succeeded');
  const failures = stream.filter((e) => e.eventType === 'repost_failed');

  const platforms: Record<string, number> = {};
  attempts.forEach((e) => {
    const p = e.metadata.broadcastPlatform || 'other';
    platforms[p] = (platforms[p] || 0) + 1;
  });

  const totalAttempts = attempts.length;
  const successfulReposts = successes.length;
  const failedAttempts = failures.length;
  const successRatePercentage = totalAttempts > 0 
    ? Math.round((successfulReposts / totalAttempts) * 100) 
    : 0;

  return {
    totalAttempts,
    successfulReposts,
    failedAttempts,
    successRatePercentage,
    platformDistribution: platforms,
  };
};

/**
 * Comprehensive Summary Report for Administration & Intelligence
 */
export const generateMarketEventsSummaryReport = (): MarketEventsSummaryReport => {
  const stream = loadPublicEvents();
  
  const eventsByType: Record<PharmaMarketEventType, number> = {
    request_created: 0,
    request_edited: 0,
    repost_attempted: 0,
    repost_succeeded: 0,
    repost_failed: 0,
    match_proposed: 0,
    match_confirmed: 0,
    request_cancelled: 0,
    request_closed_unmatched: 0,
    request_expired: 0,
    offer_created: 0,
    offer_edited: 0,
    offer_closed: 0,
    offer_expired: 0,
  };

  stream.forEach((e) => {
    if (eventsByType[e.eventType] !== undefined) {
      eventsByType[e.eventType]++;
    }
  });

  return {
    totalEventsCount: stream.length,
    eventsByType,
    timeToMatch: calculateTimeToMatchStats(stream),
    unmatchedAnalysis: calculateUnmatchedAnalysis(stream),
    repostMetrics: calculateRepostMetrics(stream),
    oldestEventTimestamp: stream[0]?.occurredAt || null,
    latestEventTimestamp: stream[stream.length - 1]?.occurredAt || null,
  };
};

/**
 * Export Event Store to JSON string for backup & migration
 */
export const exportEventsToJSON = (): string => {
  const events = loadMarketEvents();
  return JSON.stringify(events, null, 2);
};

/**
 * Export Event Store to CSV format for Excel and Business Intelligence analysis
 */
export const exportEventsToCSV = (): string => {
  const events = loadMarketEvents();
  if (events.length === 0) return 'eventId,eventType,entityId,occurredAt,actorType,drugNameRaw,quantity,unit,governorate\n';

  const headers = [
    'eventId',
    'schemaVersion',
    'entityType',
    'entityId',
    'relatedRequestId',
    'eventType',
    'occurredAt',
    'recordedAt',
    'actorId',
    'actorType',
    'source',
    'drugNameRaw',
    'quantity',
    'unit',
    'governorate',
    'urgency',
    'timeToMatchSeconds',
    'unmatchedReason',
    'broadcastPlatform',
    'repostSuccessCount',
  ];

  const escapeCsv = (val: any): string => {
    if (val === null || val === undefined) return '';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = events.map((e) => [
    escapeCsv(e.eventId),
    escapeCsv(e.schemaVersion),
    escapeCsv(e.entityType),
    escapeCsv(e.entityId),
    escapeCsv(e.relatedRequestId),
    escapeCsv(e.eventType),
    escapeCsv(e.occurredAt),
    escapeCsv(e.recordedAt),
    escapeCsv(e.actorId),
    escapeCsv(e.actorType),
    escapeCsv(e.source),
    escapeCsv(e.metadata.drugNameRaw),
    escapeCsv(e.metadata.quantity),
    escapeCsv(e.metadata.unit),
    escapeCsv(e.metadata.governorate),
    escapeCsv(e.metadata.urgency),
    escapeCsv(e.metadata.timeToMatchSeconds),
    escapeCsv(e.metadata.unmatchedReason),
    escapeCsv(e.metadata.broadcastPlatform),
    escapeCsv(e.metadata.repostSuccessCount),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};
