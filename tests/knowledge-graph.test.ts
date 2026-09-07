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
import {
  KNOWLEDGE_TOPICS,
  augmentLlmsWithKnowledgeGraph,
  augmentSitemapWithKnowledgeGraph,
  injectKnowledgeGraph,
  injectKnowledgeGraphDiscovery,
  knowledgeTopicUrls,
  topicsForPath,
} from "../src/knowledge-graph.ts";
import { handleKnownKnowledgeTopicRoute, isKnownKnowledgeTopicRoute } from "../src/knowledge-graph-router.ts";

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
  return undefined;
}

function reEscape(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("knowledge graph contains ten complete unique themes", () => {
  assert.equal(KNOWLEDGE_TOPICS.length, 10);
  assert.equal(new Set(KNOWLEDGE_TOPICS.map((topic) => topic.slug)).size, 10);
  for (const topic of KNOWLEDGE_TOPICS) {
    assert.equal(topic.links.length, 8, topic.slug);
    assert.equal(new Set(topic.links.map((link) => link.path)).size, 8, topic.slug);
    assert.ok(topic.summary.length > 60, topic.slug);
    assert.ok(topic.prompt.endsWith("?"), topic.slug);
    for (const related of topic.related) {
      assert.ok(KNOWLEDGE_TOPICS.some((candidate) => candidate.slug === related), `${topic.slug} -> ${related}`);
      assert.notEqual(related, topic.slug);
    }
  }
});

test("every curated cross-system knowledge link resolves through a production route handler", () => {
  for (const topic of KNOWLEDGE_TOPICS) {
    for (const link of topic.links) {
      const response = resolveReference(link.path);
      assert.ok(response, `${topic.slug}: no route handler for ${link.path}`);
      assert.equal(response?.status, 200, `${topic.slug}: ${link.path}`);
      assert.match(response?.headers.get("content-type") || "", /text\/html/i, link.path);
    }
  }
});

test("topic hub and all ten topic pages are canonical indexable SSR pages with guarded 404s", async () => {
  const urls = knowledgeTopicUrls();
  assert.equal(urls.length, 11);
  assert.equal(new Set(urls).size, 11);
  for (const path of urls) {
    assert.equal(isKnownKnowledgeTopicRoute(path), true, path);
    const response = handleKnownKnowledgeTopicRoute(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/, path);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://oraclemirror\\.com${reEscape(path)}">`), path);
    assert.match(html, /application\/ld\+json/, path);
    assert.match(html, /knowledge-graph\.css/, path);
  }
  assert.equal(isKnownKnowledgeTopicRoute("/topics/not-a-real-theme"), false);
  assert.equal(handleKnownKnowledgeTopicRoute("/topics/not-a-real-theme").status, 404);
});

test("direct and family-level path mapping yields relevant bounded topic panels", () => {
  assert.deepEqual(topicsForPath("/tarot/cards/the-lovers").map((topic) => topic.slug), ["love-relationships", "decisions-crossroads", "intuition-inner-life"]);
  assert.ok(topicsForPath("/palmistry/lines/heart-line").some((topic) => topic.slug === "love-relationships"));
  assert.ok(topicsForPath("/dreams/themes/nightmares").some((topic) => topic.slug === "protection-boundaries"));
  assert.ok(topicsForPath("/divination/pendulum/how-to-use").some((topic) => topic.slug === "decisions-crossroads"));
  assert.equal(topicsForPath("/topics/love-relationships").length, 0);
  assert.equal(topicsForPath("/").length, 0);
});

test("knowledge panel injection is accessible, stylesheet-aware, before footer, and idempotent", () => {
  const source = '<!doctype html><html><head><title>X</title></head><body><main>Tarot</main><footer>Footer</footer></body></html>';
  const first = injectKnowledgeGraph(source, "/tarot/cards/the-star");
  assert.match(first, /knowledge-graph\.css/);
  assert.match(first, /class="knowledge-graph-panel"/);
  assert.match(first, /aria-labelledby="knowledge-graph-title"/);
  assert.ok(first.indexOf("knowledge-graph-panel") < first.indexOf("<footer"));
  assert.equal(injectKnowledgeGraph(first, "/tarot/cards/the-star"), first);
  assert.equal(injectKnowledgeGraph(source, "/topics/rest-renewal"), source);
});

test("sitemap, llms and app-shell discovery are complete and idempotent", () => {
  const baseXml = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const xml = augmentSitemapWithKnowledgeGraph(baseXml);
  for (const path of knowledgeTopicUrls()) assert.match(xml, new RegExp(`<loc>https://oraclemirror\\.com${reEscape(path)}</loc>`));
  assert.equal(augmentSitemapWithKnowledgeGraph(xml), xml);

  const llms = augmentLlmsWithKnowledgeGraph("# Oracle Mirror\n");
  assert.match(llms, /## Cross-System Mystical Themes/);
  assert.match(llms, /\/topics\/\{theme\}/);
  assert.equal(augmentLlmsWithKnowledgeGraph(llms), llms);

  const shell = '<a href="/divination" class="dropdown-item divination-library-link">✦ Divination Library</a><a href="/divination" class="card card-divination-library"><div>Divination</div></a>';
  const discovered = injectKnowledgeGraphDiscovery(shell);
  assert.match(discovered, /knowledge-topics-link/);
  assert.match(discovered, /card-knowledge-topics/);
  assert.equal(injectKnowledgeGraphDiscovery(discovered), discovered);
});

test("V2 routes topic pages and decorates mature standalone reference responses", () => {
  const source = readFileSync("src/v2-index.ts", "utf8");
  assert.match(source, /isKnownKnowledgeTopicRoute\(url\.pathname\)/);
  assert.match(source, /handleKnownKnowledgeTopicRoute\(url\.pathname\)/);
  assert.match(source, /decorateStandaloneKnowledge\(handleRuneRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleLenormandRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleAdvancedTarotRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleAdvancedNumerologyRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleAdvancedIChingRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleAstrologyRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleAdvancedPalmistryRoute/);
  assert.match(source, /decorateStandaloneKnowledge\(handleDivinationRoute/);
  assert.match(source, /augmentSitemapWithKnowledgeGraph/);
  assert.match(source, /augmentLlmsWithKnowledgeGraph/);
});

test("knowledge graph adds no AI, feature API, storage, tracking, or perpetual animation runtime", () => {
  const source = readFileSync("src/knowledge-graph.ts", "utf8");
  const router = readFileSync("src/knowledge-graph-router.ts", "utf8");
  const css = readFileSync("public/knowledge-graph.css", "utf8");
  assert.doesNotMatch(source + router, /env\.AI|\/api\/|fetch\(|localStorage|sessionStorage|dataLayer|requestAnimationFrame/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
