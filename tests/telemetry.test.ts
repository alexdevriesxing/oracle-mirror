import test from "node:test";
import assert from "node:assert/strict";
import { handleTelemetry } from "../src/telemetry.ts";

function telemetryRequest(body: unknown, origin = "https://oraclemirror.com") {
  return new Request("https://oraclemirror.com/api/telemetry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
    },
    body: JSON.stringify(body),
  });
}

test("telemetry writes sanitized Analytics Engine points", async () => {
  const points: unknown[] = [];
  const env = {
    ANALYTICS: {
      writeDataPoint(point: unknown) {
        points.push(point);
      },
    },
    CF_VERSION_METADATA: { id: "version-123", tag: "v2-pass-4" },
  } as any;

  const response = await handleTelemetry(telemetryRequest({
    session_id: "session-12345678",
    events: [{
      event: "ad_slot_filled",
      timestamp: "2026-09-04T18:00:00.000Z",
      slot_id: "oracle-result-slot",
      realm: "tarot",
      zone_id: "zone-1",
      question: "private user question must never be stored",
    }],
  }), env);

  assert.equal(response.status, 204);
  assert.equal(points.length, 1);
  const serialized = JSON.stringify(points[0]);
  assert.match(serialized, /ad_slot_filled/);
  assert.match(serialized, /oracle-result-slot/);
  assert.match(serialized, /version-123/);
  assert.doesNotMatch(serialized, /private user question/);
});

test("daily ritual telemetry retains coarse product metrics and drops arbitrary content", async () => {
  const points: unknown[] = [];
  const env = {
    ANALYTICS: {
      writeDataPoint(point: unknown) {
        points.push(point);
      },
    },
  } as any;

  const response = await handleTelemetry(telemetryRequest({
    session_id: "session-ritual-12345",
    events: [{
      event: "daily_ritual_revealed",
      ritual_card: "The Star",
      recommendation: "tarot",
      badge: "Seven-Day Seer",
      streak: 7,
      best_streak: 8,
      total_days: 12,
      mood_score: 81,
      love_score: 73,
      money_score: 66,
      private_note: "this must never be stored",
    }],
  }), env);

  assert.equal(response.status, 204);
  assert.equal(points.length, 1);
  const serialized = JSON.stringify(points[0]);
  assert.match(serialized, /daily_ritual_revealed/);
  assert.match(serialized, /The Star/);
  assert.match(serialized, /Seven-Day Seer/);
  assert.match(serialized, /tarot/);
  assert.match(serialized, /81/);
  assert.doesNotMatch(serialized, /this must never be stored/);
});

test("telemetry rejects cross-origin submissions", async () => {
  const response = await handleTelemetry(telemetryRequest({
    session_id: "session-12345678",
    events: [{ event: "realm_open" }],
  }, "https://evil.example"), {});

  assert.equal(response.status, 403);
});

test("telemetry rejects malformed sessions and non-POST requests", async () => {
  const malformed = await handleTelemetry(telemetryRequest({ session_id: "x", events: [] }), {});
  assert.equal(malformed.status, 400);

  const get = await handleTelemetry(new Request("https://oraclemirror.com/api/telemetry"), {});
  assert.equal(get.status, 405);
});
