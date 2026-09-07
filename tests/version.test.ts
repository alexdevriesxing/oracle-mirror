import test from "node:test";
import assert from "node:assert/strict";
import worker from "../src/v2-index.ts";

test("/api/version returns version metadata and commit", async () => {
  const env: any = {
    CF_VERSION_METADATA: { id: "test-version-id-123", tag: "v2-test" },
    ASSETS: { fetch: async () => new Response("ok") },
  };
  const ctx: any = { waitUntil: () => {}, passThroughOnException: () => {} };

  const request = new Request("https://oraclemirror.com/api/version", { method: "GET" });
  const response = await worker.fetch(request, env, ctx);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=UTF-8");
  assert.equal(response.headers.get("X-Oracle-Version-Id"), "test-version-id-123");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");

  const body = (await response.json()) as { status: string; versionId: string; versionTag: string; commit: string };
  assert.equal(body.status, "ok");
  assert.equal(body.versionId, "test-version-id-123");
  assert.equal(body.versionTag, "v2-test");
  assert.ok(typeof body.commit === "string");
});
