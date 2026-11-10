/**
 * PharmaYemen Event Collection Engine - Types & Schema Specifications
 * Compliant with Cloudflare Worker & Append-Only Event Store Standards
 */

export type PharmaMarketEventType =
  // Request Lifecycle
  | 'request_created'
  | 'request_edited'
  | 'repost_attempted'
  | 'repost_succeeded'
  | 'repost_failed'
  | 'match_proposed'
  | 'match_confirmed'
  | 'request_cancelled'
  | 'request_closed_unmatched'
  | 'request_expired'
  // Offer Lifecycle
  | 'offer_created'
  | 'offer_edited'
  | 'offer_closed'
  | 'offer_expired';

export type EventActorType =
  | 'pharmacy'
  | 'hospital'
  | 'distributor'
  | 'wholesaler'
  | 'individual_supplier'
  | 'system_cron'
  | 'admin'
  | 'visitor';

export type UnmatchedReasonCode =
  | 'no_supply_signal_in_market'         // انعدام المعروض من المادة الفعالة
  | 'strength_mismatch_only'             // توفر المادة الفعالة لكن بتركيز غير مطابق
  | 'dosage_form_mismatch_only'          // توفر المادة الفعالة بهيئة دوائية مختلفة
  | 'geographic_gap'                     // توفر الصنف في محافظة أخرى مع تعذر التوصيل
  | 'expired_after_7_days'               // انقضاء المهلة (7 أيام) دون ظهور عرض متطابق
  | 'user_manual_closure'                // إغلاق يدوي من قبل المنشأة المعلنة
  | 'unknown';

export interface PharmaMarketEvent {
  /** Unique Event Identifier (UUID / Nanoid) */
  eventId: string;

  /** Schema Version for Forward/Backward Migration Compatibility */
  schemaVersion: number;

  /** Entity Domain Category */
  entityType: 'request' | 'offer' | 'match' | 'ticket' | 'broadcast';

  /** Primary Entity ID (e.g., req-123 or off-456) */
  entityId: string;

  /** Related Request ID for match and fulfillment tracking */
  relatedRequestId?: string | null;

  /** Event Type Identifier */
  eventType: PharmaMarketEventType;

  /** ISO-8601 UTC timestamp of when the real-world action occurred */
  occurredAt: string;

  /** ISO-8601 UTC timestamp of when this event was recorded into the store */
  recordedAt: string;

  /** Actor Information */
  actorId: string;
  actorType: EventActorType;

  /** Execution Source Context */
  source: 'web_client' | 'cloudflare_worker' | 'background_worker' | 'admin_action';

  /** Idempotency key to guarantee at-most-once event registration across retries */
  idempotencyKey: string;

  /** Domain-Specific Non-PII Metadata */
  metadata: {
    /** Raw, unnormalized drug name as typed by user */
    drugNameRaw?: string | null;
    genericName?: string | null;
    brandName?: string | null;
    strength?: string | null;
    quantity?: number | null;
    unit?: string | null;
    governorate?: string | null;
    urgency?: string | null;
    
    // Repost tracking
    broadcastPlatform?: 'telegram' | 'facebook' | 'whatsapp' | 'instagram' | 'batch_digest' | null;
    repostAttemptId?: string | null;
    failureReason?: string | null;
    repostSuccessCount?: number | null;

    // Match metrics
    matchId?: string | null;
    offeringEntityId?: string | null;
    offeringEntityType?: EventActorType | null;
    requestingEntityId?: string | null;
    requestingEntityType?: EventActorType | null;
    clinicalMatchKind?: string | null;
    timeToMatchSeconds?: number | null; // Seconds elapsed from request creation to match

    // Unmatched analysis
    unmatchedReason?: UnmatchedReasonCode | null;
    unmatchedReasonNotes?: string | null;

    // Change detection for edit events
    changedFields?: string[] | null;
    previousValues?: Record<string, any> | null;
  };
}

/** Ingestion Payload for API and Client Invocation */
export interface IngestEventPayload {
  eventType: PharmaMarketEventType;
  entityType: 'request' | 'offer' | 'match' | 'ticket' | 'broadcast';
  entityId: string;
  relatedRequestId?: string | null;
  actorId?: string;
  actorType?: EventActorType;
  source?: 'web_client' | 'cloudflare_worker' | 'background_worker' | 'admin_action';
  idempotencyKey?: string;
  occurredAt?: string;
  metadata?: PharmaMarketEvent['metadata'];
}

/** Aggregated Historical Analytics Report Types */
export interface TimeToMatchMetric {
  drugName: string;
  matchesCount: number;
  averageSeconds: number;
  minSeconds: number;
  maxSeconds: number;
  fastestMatchFormatted: string;
  averageMatchFormatted: string;
}

export interface UnmatchedAnalysisReport {
  totalClosedUnmatched: number;
  reasonsBreakdown: Record<UnmatchedReasonCode, number>;
  topUnmatchedDrugs: { drugName: string; count: number; primaryReason: UnmatchedReasonCode }[];
}

export interface RepostMetricsReport {
  totalAttempts: number;
  successfulReposts: number;
  failedAttempts: number;
  successRatePercentage: number;
  platformDistribution: Record<string, number>;
}

export interface MarketEventsSummaryReport {
  totalEventsCount: number;
  eventsByType: Record<PharmaMarketEventType, number>;
  timeToMatch: TimeToMatchMetric[];
  unmatchedAnalysis: UnmatchedAnalysisReport;
  repostMetrics: RepostMetricsReport;
  oldestEventTimestamp: string | null;
  latestEventTimestamp: string | null;
}
