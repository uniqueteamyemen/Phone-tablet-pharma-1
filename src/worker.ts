/**
 * PharmaYemen Cloudflare Worker Edge Handler
 * Handles edge event collection, telemetry ingestion, and passes all other traffic
 * through to Cloudflare Static Assets (dist).
 */

export interface Env {
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
  PHARMA_EVENTS_KV?: any;
  PHARMA_ANALYTICS?: any;
}

interface IngestedEvent {
  eventId: string;
  eventType: string;
  entityId: string;
  occurredAt: string;
  recordedAt: string;
  idempotencyKey?: string;
  metadata?: Record<string, any>;
}

// In-Worker memory cache for deduplication & telemetry buffer
const edgeIdempotencySet = new Set<string>();
const edgeEventsBuffer: IngestedEvent[] = [];
const MAX_EDGE_BUFFER = 500;

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Pharma-Idempotency-Key, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. CORS Pre-flight handler
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      });
    }

    // 2. Health check endpoint
    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          worker: 'phone-tablet-pharma-1',
          edgeTimestamp: new Date().toISOString(),
          edgeEventsBuffered: edgeEventsBuffer.length,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(),
          },
        }
      );
    }

    // 3. Events Ingestion & Telemetry API
    if (url.pathname === '/api/events' || url.pathname.startsWith('/api/events')) {
      // POST: Ingest single or batch event
      if (request.method === 'POST') {
        try {
          const body: IngestedEvent = await request.json();
          const idempotencyKey = request.headers.get('X-Pharma-Idempotency-Key') || body.idempotencyKey;

          if (idempotencyKey && edgeIdempotencySet.has(idempotencyKey)) {
            return new Response(
              JSON.stringify({
                status: 'idempotent_duplicate_ignored',
                eventId: body.eventId,
                message: 'Event was already recorded on edge.',
              }),
              {
                status: 200,
                headers: {
                  'Content-Type': 'application/json',
                  ...corsHeaders(),
                },
              }
            );
          }

          if (idempotencyKey) {
            edgeIdempotencySet.add(idempotencyKey);
            if (edgeIdempotencySet.size > 5000) {
              // Simple prune
              const first = edgeIdempotencySet.values().next().value;
              if (first) edgeIdempotencySet.delete(first);
            }
          }

          // Buffer in edge memory
          edgeEventsBuffer.unshift({
            ...body,
            recordedAt: new Date().toISOString(),
          });
          if (edgeEventsBuffer.length > MAX_EDGE_BUFFER) {
            edgeEventsBuffer.pop();
          }

          // Write to Cloudflare Analytics Engine if binding is provided in Cloudflare Dashboard
          if (env.PHARMA_ANALYTICS && typeof env.PHARMA_ANALYTICS.writeDataPoint === 'function') {
            try {
              env.PHARMA_ANALYTICS.writeDataPoint({
                blobs: [
                  body.eventType,
                  body.entityId,
                  body.metadata?.drugNameRaw || '',
                  body.metadata?.governorate || '',
                ],
                doubles: [
                  body.metadata?.quantity || 1,
                  body.metadata?.timeToMatchSeconds || 0,
                ],
                indexes: [body.eventType],
              });
            } catch (err) {
              console.error('[CloudflareWorker] Analytics Engine write error:', err);
            }
          }

          return new Response(
            JSON.stringify({
              status: 'recorded',
              eventId: body.eventId,
              recordedAt: new Date().toISOString(),
            }),
            {
              status: 201,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(),
              },
            }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({
              status: 'error',
              error: err?.message || 'Invalid JSON event payload',
            }),
            {
              status: 400,
              headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(),
              },
            }
          );
        }
      }

      // GET: Retrieve edge telemetry stats
      if (request.method === 'GET') {
        return new Response(
          JSON.stringify({
            worker: 'phone-tablet-pharma-1',
            edgeBufferedCount: edgeEventsBuffer.length,
            recentEvents: edgeEventsBuffer.slice(0, 50),
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              ...corsHeaders(),
            },
          }
        );
      }
    }

    // 4. Default: Forward all non-API traffic to Cloudflare Workers Static Assets
    if (env.ASSETS && typeof env.ASSETS.fetch === 'function') {
      return env.ASSETS.fetch(request);
    }

    // Fallback response if ASSETS binding is absent in direct invocation
    return new Response('PharmaYemen Cloudflare Worker Active', { status: 200 });
  },
};
