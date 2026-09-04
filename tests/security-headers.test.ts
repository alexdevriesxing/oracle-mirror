import test from "node:test";
import assert from "node:assert/strict";
import { REPORT_ONLY_CSP, withSecurityHeaders } from "../src/security-headers.ts";

test("security headers are applied to HTML responses", async () => {
  const response = withSecurityHeaders(new Response("<html></html>", {
    status: 200,
    headers: { "Content-Type": "text/html; charset=UTF-8" },
  }));

  assert.equal(response.headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("X-Frame-Options"), "SAMEORIGIN");
  assert.equal(response.headers.get("Strict-Transport-Security"), "max-age=31536000");
  assert.match(response.headers.get("Permissions-Policy") || "", /camera=\(\)/);
  assert.equal(response.headers.get("Content-Security-Policy-Report-Only"), REPORT_ONLY_CSP);
  assert.equal(await response.text(), "<html></html>");
});

test("CSP stays HTML-only while baseline headers cover APIs", () => {
  const response = withSecurityHeaders(new Response("{}", {
    status: 200,
    headers: { "Content-Type": "application/json" },
  }));

  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Content-Security-Policy-Report-Only"), null);
});

test("report-only CSP blocks plugins and restricts framing without enforcing yet", () => {
  assert.match(REPORT_ONLY_CSP, /object-src 'none'/);
  assert.match(REPORT_ONLY_CSP, /frame-ancestors 'self'/);
  assert.match(REPORT_ONLY_CSP, /base-uri 'self'/);
  assert.match(REPORT_ONLY_CSP, /form-action 'self'/);
});
