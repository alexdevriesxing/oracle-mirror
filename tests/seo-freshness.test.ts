import test from "node:test";
import assert from "node:assert/strict";
import {
  isRetiredEventPath,
  rewriteHtmlFreshness,
  rewriteSitemapFreshness,
} from "../src/seo-freshness.ts";

const evergreenHome = `<!doctype html><html><head>
<title>Old title</title>
<meta name="description" content="Old description" />
<meta name="robots" content="index,follow,max-image-preview:large" />
<meta property="og:title" content="Old title" />
<meta property="og:description" content="Old description" />
<meta name="twitter:title" content="Old title" />
<meta name="twitter:description" content="Old description" />
</head><body><a href="/tarot">Tarot</a></body></html>`;

test("homepage freshness uses evergreen mystical positioning", () => {
  const html = rewriteHtmlFreshness(evergreenHome, "/");
  assert.match(html, /Free Tarot, Horoscopes & Mystical Readings \| Oracle Mirror/);
  assert.match(html, /dream interpretation/);
  assert.match(html, /birth charts/);
});

test("private archive is noindex,follow", () => {
  const html = rewriteHtmlFreshness(evergreenHome, "/archive");
  assert.match(html, /name="robots" content="noindex,follow"/);
});

test("sitemap omits private archive and defensive tombstone URLs", () => {
  const xml = `<urlset>
<url><loc>https://oraclemirror.com/</loc><lastmod>2026-07-09</lastmod></url>
<url><loc>https://oraclemirror.com/archive</loc><lastmod>2026-07-09</lastmod></url>
<url><loc>https://oraclemirror.com/oracle-of-olympus</loc><lastmod>2026-07-09</lastmod></url>
<url><loc>https://oraclemirror.com/tarot</loc><lastmod>2026-07-09</lastmod></url>
</urlset>`;
  const output = rewriteSitemapFreshness(xml);
  assert.match(output, /<lastmod>2026-09-04<\/lastmod>/);
  assert.match(output, /\/tarot/);
  assert.doesNotMatch(output, /\/archive/);
  assert.doesNotMatch(output, /oracle-of-olympus/);
});

test("historical event URLs remain explicit 410 tombstones", () => {
  assert.equal(isRetiredEventPath("/oracle-of-olympus"), true);
  assert.equal(isRetiredEventPath("/oracle-of-olympus/old-match"), true);
  assert.equal(isRetiredEventPath("/api/oracle-of-olympus/matches"), true);
  assert.equal(isRetiredEventPath("/api/oracle-of-olympus/predict"), true);
  assert.equal(isRetiredEventPath("/tarot"), false);
});
