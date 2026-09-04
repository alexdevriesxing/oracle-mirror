export type TelemetryEnv = {
  ANALYTICS?: AnalyticsEngineDataset;
  CF_VERSION_METADATA?: {
    id?: string;
    tag?: string;
    timestamp?: string;
  };
};

const MAX_BODY_BYTES = 32_768;
const MAX_EVENTS = 25;
const EVENT_NAME = /^[a-z0-9_:-]{1,80}$/i;

const SAFE_STRING_FIELDS = [
  "site_name", "slot_id", "ad_instance_id", "placement", "format", "zone_id",
  "screen", "screen_type", "realm", "realm_type", "reason", "error_reason",
  "trigger", "page_path", "consent_state", "ad_mode", "device", "source",
  "state", "result_kind",
] as const;

const SAFE_NUMBER_FIELDS = [
  "answer_length", "attempt", "next_attempt", "engaged_seconds", "readings_completed",
  "ads_filled", "ads_viewable_1s", "shares",
] as const;

const SAFE_BOOLEAN_FIELDS = [
  "eligible", "refresh_enabled", "blocked", "ads", "analytics", "consent_required",
  "refresh_eligible", "enabled",
] as const;

type SafeEvent = {
  event: string;
  timestamp?: string;
  strings: Record<string, string>;
  numbers: Record<string, number>;
  booleans: Record<string, boolean>;
};

function safeString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  return value.slice(0, 240);
}

function parseEvent(value: unknown): SafeEvent | null {
  if (!value || typeof value !== "object") return null;
  const input = value as Record<string, unknown>;
  const event = safeString(input.event);
  if (!event || !EVENT_NAME.test(event)) return null;

  const strings: Record<string, string> = {};
  const numbers: Record<string, number> = {};
  const booleans: Record<string, boolean> = {};

  for (const key of SAFE_STRING_FIELDS) {
    const parsed = safeString(input[key]);
    if (parsed !== null) strings[key] = parsed;
  }
  for (const key of SAFE_NUMBER_FIELDS) {
    const parsed = input[key];
    if (typeof parsed === "number" && Number.isFinite(parsed)) numbers[key] = parsed;
  }
  for (const key of SAFE_BOOLEAN_FIELDS) {
    if (typeof input[key] === "boolean") booleans[key] = input[key] as boolean;
  }

  return {
    event,
    timestamp: safeString(input.timestamp) || undefined,
    strings,
    numbers,
    booleans,
  };
}

function analyticsPoint(sessionId: string, event: SafeEvent, versionId: string, versionTag: string) {
  const s = event.strings;
  const n = event.numbers;
  const b = event.booleans;
  return {
    indexes: [sessionId],
    blobs: [
      event.event,
      s.realm || s.realm_type || "",
      s.screen || s.screen_type || "",
      s.slot_id || "",
      s.placement || "",
      s.format || "",
      s.zone_id || "",
      s.reason || s.error_reason || "",
      s.page_path || "",
      s.result_kind || "",
      s.state || "",
      versionId,
      versionTag,
    ],
    doubles: [
      Date.parse(event.timestamp || "") || Date.now(),
      n.answer_length || 0,
      n.engaged_seconds || 0,
      n.readings_completed || 0,
      n.ads_filled || 0,
      n.ads_viewable_1s || 0,
      n.shares || 0,
      n.attempt || 0,
      n.next_attempt || 0,
      b.eligible ? 1 : 0,
      b.blocked ? 1 : 0,
    ],
  };
}

export async function handleTelemetry(request: Request, env: TelemetryEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== "https://oraclemirror.com" && origin !== "https://www.oraclemirror.com") {
    return new Response("Forbidden", { status: 403 });
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_BODY_BYTES) return new Response("Payload Too Large", { status: 413 });

  let raw = "";
  try {
    raw = await request.text();
  } catch {
    return new Response("Bad Request", { status: 400 });
  }
  if (raw.length > MAX_BODY_BYTES) return new Response("Payload Too Large", { status: 413 });

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  const sessionId = safeString(payload.session_id);
  if (!sessionId || sessionId.length < 8) return new Response("Bad Request", { status: 400 });

  const rawEvents = Array.isArray(payload.events) ? payload.events.slice(0, MAX_EVENTS) : [];
  const events = rawEvents.map(parseEvent).filter((event): event is SafeEvent => Boolean(event));
  if (!events.length) return new Response(null, { status: 204 });

  const versionId = env.CF_VERSION_METADATA?.id || "unknown";
  const versionTag = env.CF_VERSION_METADATA?.tag || "";

  if (env.ANALYTICS) {
    for (const event of events) {
      env.ANALYTICS.writeDataPoint(analyticsPoint(sessionId, event, versionId, versionTag));
    }
  } else {
    console.log(JSON.stringify({ type: "oracle_telemetry", session_id: sessionId, events: events.length }));
  }

  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin || "https://oraclemirror.com",
      "Vary": "Origin",
    },
  });
}
