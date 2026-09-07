import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { handleRuneRoute } from "../src/runes-pages.ts";
import { handleLenormandRoute } from "../src/lenormand-pages.ts";
import { handleAdvancedTarotRoute } from "../src/tarot-pages.ts";
import { handleAdvancedNumerologyRoute } from "../src/numerology-pages.ts";
import { handleAdvancedIChingRoute } from "../src/iching-pages.ts";
import { handleAstrologyRoute } from "../src/astrology-pages.ts";
import { handleAdvancedPalmistryRoute } from "../src/palmistry-pages.ts";
import { handleDivinationRoute } from "../src/divination-pages.ts";
import { handleDreamLibraryRoute } from "../src/dream-pages-v2.ts";
import { handleKnownKnowledgeTopicRoute } from "../src/knowledge-graph-router.ts";
import {
  augmentLlmsWithReferenceSearch,
  augmentSitemapWithReferenceSearch,
  handleReferenceSearchRoute,
  injectReferenceSearchDiscovery,
  referenceSearchIndex,
  referenceSearchSystems,
  referenceSearchThemeOptions,
} from "../src/reference-search.ts";
import { searchReferenceEntries } from "../public/reference-search-core.js";

const EXPECTED_COUNTS = new Map([
  ["Runes", 25],
  ["Lenormand", 37],
  ["Tarot", 88],
  ["Numerology", 21],
  ["I Ching", 76],
  ["Astrology", 43],
  ["Palmistry", 45],
  ["Dreams", 277],
  ["Divination", 122],
  ["Themes", 11],
]);

function resolveReference(path: string): Response | undefined {
  if (path.startsWith("/runes")) return handleRuneRoute(path);
  if (path.startsWith("/lenormand")) return handleLenormandRoute(path);
  if (path.startsWith("/tarot")) return handleAdvancedTarotRoute(path);
  if (path.startsWith("/numerology")) return handleAdvancedNumerologyRoute(path);
  if (path.startsWith("/iching")) return handleAdvancedIChingRoute(path);
  if (path.startsWith("/astrology")) return handleAstrologyRoute(path);
  if (path.startsWith("/palmistry")) return handleAdvancedPalmistryRoute(path);
  if (path.startsWith("/divination")) return handleDivinationRoute(path);
  if (path.startsWith("/dreams")) return handleDreamLibraryRoute(path);
  if (path.startsWith("/topics")) return handleKnownKnowledgeTopicRoute(path);
  return undefined;
}

test("reference index covers exactly the complete 745-page reference surface", () => {
  const entries = referenceSearchIndex();
  assert.equal(entries.length, 745);
  assert.equal(new Set(entries.map((entry) => entry.path)).size, 745);
  assert.deepEqual(referenceSearchSystems(), [...EXPECTED_COUNTS.keys()]);
  assert.equal(referenceSearchThemeOptions().length, 10);

  for (const [system, expected] of EXPECTED_COUNTS) {
    assert.equal(entries.filter((entry) => entry.system === system).length, expected, system);
  }

  for (const entry of entries) {
    assert.match(entry.path, /^\//, entry.path);
    assert.ok(entry.title.length >= 2, entry.path);
    assert.ok(entry.system.length >= 2, entry.path);
    assert.ok(entry.summary.length >= 15, entry.path);
    assert.ok(Array.isArray(entry.keywords), entry.path);
    assert.ok(Array.isArray(entry.themes), entry.path);
  }
});

test("every indexed reference path resolves through its production route handler", () => {
  for (const entry of referenceSearchIndex()) {
    const response = resolveReference(entry.path);
    assert.ok(response, `No production route handler for ${entry.path}`);
    assert.equal(response?.status, 200, entry.path);
    assert.match(response?.headers.get("content-type") || "", /text\/html/i, entry.path);
  }
});

test("local ranking finds exact concepts and respects system/theme filters", () => {
  const entries = referenceSearchIndex();

  const lovers = searchReferenceEntries(entries, "the lovers", { limit: 10 });
  assert.equal(lovers[0]?.path, "/tarot/cards/the-lovers");

  const mercury = searchReferenceEntries(entries, "mercury retrograde", { limit: 10 });
  assert.equal(mercury[0]?.path, "/astrology/retrogrades/mercury");

  const teeth = searchReferenceEntries(entries, "teeth", { limit: 20 });
  assert.ok(teeth.some((entry) => entry.path === "/dreams/teeth-falling-out"));

  const protectedRunes = searchReferenceEntries(entries, "protection", { system: "Runes", limit: 20 });
  assert.ok(protectedRunes.some((entry) => entry.path === "/runes/algiz"));
  assert.ok(protectedRunes.every((entry) => entry.system === "Runes"));

  const loveOnly = searchReferenceEntries(entries, "", { theme: "love-relationships", limit: 200 });
  assert.ok(loveOnly.length > 0);
  assert.ok(loveOnly.every((entry) => entry.themes.includes("love-relationships")));

  assert.deepEqual(searchReferenceEntries(entries, "", { system: "all", theme: "all" }), []);
});

test("search normalization is case-insensitive and diacritic tolerant", () => {
  const entries = [
    { path: "/x", title: "Café Oracle", system: "Test", glyph: "✦", summary: "A résumé-style example.", keywords: ["déjà vu"], themes: [] },
  ];
  assert.equal(searchReferenceEntries(entries, "CAFE")[0]?.path, "/x");
  assert.equal(searchReferenceEntries(entries, "deja vu")[0]?.path, "/x");
});

test("search page is canonical SSR and embeds only a local static index", async () => {
  const response = handleReferenceSearchRoute();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/oraclemirror\.com\/search">/);
  assert.match(html, /<script id="reference-search-data" type="application\/json">/);
  assert.match(html, /745 pages · local search · no query telemetry/);
  assert.match(html, /URL fragment after <code>#<\/code>/);
  assert.match(html, /WebApplication/);
  assert.match(html, /reference-search\.js/);
  assert.doesNotMatch(html, /name="q"/);
});

test("search sitemap, llms, app discovery and launcher are idempotent", () => {
  const baseXml = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const xml = augmentSitemapWithReferenceSearch(baseXml);
  assert.match(xml, /<loc>https:\/\/oraclemirror\.com\/search<\/loc>/);
  assert.equal(augmentSitemapWithReferenceSearch(xml), xml);

  const llms = augmentLlmsWithReferenceSearch("# Oracle Mirror\n");
  assert.match(llms, /## Universal Reference Search/);
  assert.match(llms, /local browser search across 745 Oracle Mirror reference pages/);
  assert.equal(augmentLlmsWithReferenceSearch(llms), llms);

  const shell = '<html><head></head><body><a href="/topics" class="dropdown-item knowledge-topics-link">◎ Mystical Themes</a><a href="/topics" class="card card-knowledge-topics"><div>Topics</div></a></body></html>';
  const discovered = injectReferenceSearchDiscovery(shell, "/");
  assert.match(discovered, /reference-search\.css/);
  assert.match(discovered, /reference-search-shortcut\.js/);
  assert.match(discovered, /class="reference-search-launcher"/);
  assert.match(discovered, /reference-search-link/);
  assert.match(discovered, /card-reference-search/);
  assert.equal(injectReferenceSearchDiscovery(discovered, "/"), discovered);

  const onSearch = injectReferenceSearchDiscovery('<html><head></head><body></body></html>', "/search");
  assert.doesNotMatch(onSearch, /class="reference-search-launcher"/);
});

test("reference search client has no network search, persistence or raw-query telemetry", () => {
  const pageClient = readFileSync("public/reference-search.js", "utf8");
  const shortcutClient = readFileSync("public/reference-search-shortcut.js", "utf8");
  const core = readFileSync("public/reference-search-core.js", "utf8");
  const combined = `${pageClient}\n${shortcutClient}\n${core}`;

  assert.doesNotMatch(combined, /\bfetch\s*\(/);
  assert.doesNotMatch(combined, /\/api\//);
  assert.doesNotMatch(combined, /dataLayer|sendBeacon|telemetry/i);
  assert.doesNotMatch(combined, /localStorage|sessionStorage|indexedDB/);
  assert.doesNotMatch(pageClient, /location\.search|window\.location\.search/);
  assert.match(pageClient, /window\.location\.hash/);
  assert.match(pageClient, /history\.replaceState/);
  assert.match(shortcutClient, /Control\+K|SEARCH_PATH|metaKey/);
});

test("search styles and V2 integration cover accessibility and discovery", () => {
  const css = readFileSync("public/reference-search.css", "utf8");
  const v2 = readFileSync("src/v2-index.ts", "utf8");
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.match(css, /focus-visible/);
  assert.match(v2, /isReferenceSearchRoute\(url\.pathname\)/);
  assert.match(v2, /handleReferenceSearchRoute\(\)/);
  assert.match(v2, /augmentSitemapWithReferenceSearch/);
  assert.match(v2, /augmentLlmsWithReferenceSearch/);
  assert.match(v2, /injectReferenceSearchDiscovery/);
  assert.match(v2, /decorateStandaloneKnowledge\(handleKnownKnowledgeTopicRoute/);
});
