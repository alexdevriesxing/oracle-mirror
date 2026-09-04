import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const monetization = await readFile(new URL("../public/monetization.js", import.meta.url), "utf8");
const telemetry = await readFile(new URL("../public/telemetry.js", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");
const deployWorkflow = await readFile(new URL("../.github/workflows/deploy-cloudflare.yml", import.meta.url), "utf8");

test("M2 policy reduces refresh pressure and retires the dream interruption", () => {
  assert.match(monetization, /minIntervalMs = 45000/);
  assert.match(monetization, /maxRefreshesPerSession = 8/);
  assert.match(monetization, /oracle-dream-interstitial/);
  assert.match(monetization, /slot\.enabled = false/);
});

test("mobile monetization assigns exactly one sticky surface per session", () => {
  assert.match(monetization, /mobile_ad_surface_v1/);
  assert.match(monetization, /social_bar/);
  assert.match(monetization, /anchor/);
  assert.match(monetization, /mobileAnchor\.enabled = false/);
  assert.match(monetization, /socialBar\.enabled = false/);
});

test("telemetry is initialized before the legacy ad/application module", () => {
  assert.match(hardening, /^import "\.\/telemetry\.js";/);
  assert.match(telemetry, /window\.dataLayer\.push =/);
  assert.match(telemetry, /\/api\/telemetry/);
  assert.match(telemetry, /session_summary/);
  assert.doesNotMatch(telemetry, /question/);
});

test("production deploy waits for green master CI and verifies the live site", () => {
  assert.match(deployWorkflow, /workflow_run:/);
  assert.match(deployWorkflow, /Oracle Mirror V2 CI/);
  assert.match(deployWorkflow, /workflow_run\.conclusion == 'success'/);
  assert.match(deployWorkflow, /workflow_run\.head_branch == 'master'/);
  assert.match(deployWorkflow, /npx --yes wrangler@4 deploy/);
  assert.match(deployWorkflow, /oracle-of-olympus/);
  assert.match(deployWorkflow, /removed_status.*410/s);
});
