import { mobileAdSurfaceVariant } from "./monetization.js";

const SESSION_KEY = "oracle-telemetry-session-v2";
const ENDPOINT = "/api/telemetry";
const MAX_BATCH = 20;
const FLUSH_INTERVAL_MS = 10000;
const startedAt = Date.now();

const SAFE_KEYS = new Set([
  "event", "site_name", "timestamp", "slot_id", "ad_instance_id", "placement",
  "format", "zone_id", "screen", "screen_type", "realm", "realm_type",
  "reason", "error_reason", "trigger", "page_path", "answer_length", "eligible",
  "refresh_enabled", "consent_state", "ad_mode", "blocked", "device", "source",
  "state", "ads", "analytics", "consent_required", "refresh_eligible", "enabled",
  "attempt", "next_attempt", "result_kind", "engaged_seconds", "readings_completed",
  "ads_filled", "ads_viewable_1s", "shares",
  "ritual_card", "badge", "recommendation", "streak", "best_streak", "total_days",
  "mood_score", "love_score", "money_score",
]);

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID?.() || `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

const sessionId = getSessionId();
const queue = [];
const counters = {
  readings_completed: 0,
  ads_filled: 0,
  ads_viewable_1s: 0,
  shares: 0,
};
let flushTimer = null;
let sessionSummaryQueued = false;

function primitive(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function sanitizeEvent(input) {
  if (!input || typeof input !== "object" || typeof input.event !== "string") return null;
  const output = {};
  for (const [key, value] of Object.entries(input)) {
    if (!SAFE_KEYS.has(key) || !primitive(value)) continue;
    output[key] = typeof value === "string" ? value.slice(0, 240) : value;
  }
  return output;
}

function updateCounters(event) {
  if (event.event === "result_rendered") counters.readings_completed += 1;
  if (event.event === "ad_slot_filled") counters.ads_filled += 1;
  if (event.event === "ad_slot_viewable_1s") counters.ads_viewable_1s += 1;
  if (event.event === "share_complete" || event.event === "share_completed") counters.shares += 1;
}

async function postPayload(payload, preferBeacon = false) {
  const body = JSON.stringify(payload);
  if (preferBeacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    if (navigator.sendBeacon(ENDPOINT, blob)) return;
  }

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      credentials: "same-origin",
    });
  } catch {
    // Telemetry must never affect the reading experience.
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
}

function flush(preferBeacon = false) {
  if (!queue.length) return;
  const events = queue.splice(0, MAX_BATCH);
  postPayload({ session_id: sessionId, events }, preferBeacon);
  if (queue.length) scheduleFlush();
}

function capture(item) {
  const event = sanitizeEvent(item);
  if (!event) return;
  updateCounters(event);
  queue.push(event);
  if (queue.length >= MAX_BATCH) flush();
  else scheduleFlush();
}

window.dataLayer = window.dataLayer || [];
const originalPush = window.dataLayer.push.bind(window.dataLayer);
window.dataLayer.push = (...items) => {
  for (const item of items) capture(item);
  return originalPush(...items);
};

window.dataLayer.push({
  event: "experiment_assignment",
  site_name: "Oracle Mirror",
  timestamp: new Date().toISOString(),
  source: "v2",
  result_kind: "mobile_ad_surface_v1",
  state: mobileAdSurfaceVariant,
});

function queueSessionSummary() {
  if (sessionSummaryQueued) return;
  sessionSummaryQueued = true;
  queue.push({
    event: "session_summary",
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    engaged_seconds: Math.round((Date.now() - startedAt) / 1000),
    readings_completed: counters.readings_completed,
    ads_filled: counters.ads_filled,
    ads_viewable_1s: counters.ads_viewable_1s,
    shares: counters.shares,
    result_kind: "mobile_ad_surface_v1",
    state: mobileAdSurfaceVariant,
  });
}

window.addEventListener("pagehide", () => {
  queueSessionSummary();
  flush(true);
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") flush(true);
});

window.oracleTelemetry = {
  flush: () => flush(false),
  sessionId,
  counters,
};
