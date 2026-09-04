import test from "node:test";
import assert from "node:assert/strict";
import {
  isRemovedWorldCupPath,
  rewriteHtmlFreshness,
  rewriteLlmsFreshness,
  rewriteSitemapFreshness,
} from "../src/seo-freshness.ts";

const homeHtml = `<!doctype html><html><head>
<title>Free Tarot, Horoscopes & Fortune Telling Online | Oracle Mirror</title>
<meta name="description" content="Get free tarot card readings, daily horoscopes, numerology, crystal ball answers, love compatibility, AI Soulmate Vision, and World Cup 2026 predictions — all inside Oracle Mirror." />
<meta name="robots" content="index,follow,max-image-preview:large" />
<meta property="og:title" content="Old title" />
<meta property="og:description" content="Old description" />
<meta name="twitter:title" content="Old title" />
<meta name="twitter:description" content="Old description" />
<script type="application/ld+json">{"@type":"WebSite","description":"Free interactive tarot readings, daily horoscopes, numerology, crystal ball answers, love compatibility, AI Soulmate Vision, and World Cup 2026 match predictions."}</script>
<script type="application/ld+json">{"@context":"https://schema.org","@type":"ItemList","name":"Oracle Mirror Reading Realms","itemListElement":[{"@type":"ListItem","position":1,"name":"Tarot","url":"https://oraclemirror.com/tarot"},{"@type":"ListItem","position":2,"name":"World Cup 2026 Predictions","url":"https://oraclemirror.com/oracle-of-olympus"},{"@type":"ListItem","position":3,"name":"Dream Interpreter","url":"https://oraclemirror.com/dream-interpreter"}]}</script>
</head><body>
<a href="/oracle-of-olympus" class="nav-link">World Cup Oracle</a>
<a href="/oracle-of-olympus" class="card"><div><h3>World Cup 2026 Predictions</h3></div></a>
<a href="/tarot">Tarot</a>
</body></html>`;

test("homepage freshness removes World Cup promotion and preserves evergreen realms", () => {
  const html = rewriteHtmlFreshness(homeHtml, "/");
  assert.match(html, /Free Tarot, Horoscopes & Mystical Readings \| Oracle Mirror/);
  assert.match(html, /dream interpretation/);
  assert.doesNotMatch(html, /href="\/oracle-of-olympus"/);
  assert.doesNotMatch(html, /World Cup Oracle/);
  assert.match(html, /href="\/tarot"/);
});

test("homepage ItemList removes Olympus and renumbers remaining items", () => {
  const html = rewriteHtmlFreshness(homeHtml, "/");
  assert.doesNotMatch(html, /https:\/\/oraclemirror\.com\/oracle-of-olympus/);
  assert.match(html, /"name":"Dream Interpreter","url":"https:\/\/oraclemirror\.com\/dream-interpreter","position":2/);
});

test("private archive is noindex,follow", () => {
  const archive = rewriteHtmlFreshness(homeHtml, "/archive");
  assert.match(archive, /name="robots" content="noindex,follow"/);
});

test("sitemap removes archive and every Olympus URL", () => {
  const xml = `<?xml version="1.0"?><urlset>
<url><loc>https://oraclemirror.com/</loc><lastmod>2026-07-09</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>
<url><loc>https://oraclemirror.com/archive</loc><lastmod>2026-07-09</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
<url><loc>https://oraclemirror.com/oracle-of-olympus</loc><lastmod>2026-09-04</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
<url><loc>https://oraclemirror.com/oracle-of-olympus/canada-vs-mexico</loc><lastmod>2026-09-04</lastmod><changefreq>daily</changefreq><priority>0.6</priority></url>
<url><loc>https://oraclemirror.com/tarot</loc><lastmod>2026-07-09</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
</urlset>`;
  const output = rewriteSitemapFreshness(xml);
  assert.doesNotMatch(output, /\/archive<\/loc>/);
  assert.doesNotMatch(output, /oracle-of-olympus/);
  assert.match(output, /https:\/\/oraclemirror\.com\/tarot/);
  assert.match(output, /<lastmod>2026-09-04<\/lastmod>/);
});

test("llms text removes World Cup feature, section, groups and links", () => {
  const text = `# Oracle Mirror
> Oracle Mirror is a site, and FIFA World Cup 2026 match predictions from the Oracle of Olympus.
## Readings
- [Tarot](https://oraclemirror.com/tarot): cards.
- [World Cup 2026 Predictions](https://oraclemirror.com/oracle-of-olympus): live predictions.
## World Cup 2026 Predictions (Oracle of Olympus)
Every group stage match has its own prediction page.
### Group A
- [A vs B](https://oraclemirror.com/oracle-of-olympus/a-vs-b): predicted 1-0.
## Key Facts
- All readings are free.`;
  const output = rewriteLlmsFreshness(text);
  assert.doesNotMatch(output, /World Cup 2026/);
  assert.doesNotMatch(output, /oracle-of-olympus/);
  assert.match(output, /\[Tarot\]/);
  assert.match(output, /## Key Facts/);
});

test("all removed World Cup public and API routes are recognized", () => {
  assert.equal(isRemovedWorldCupPath("/oracle-of-olympus"), true);
  assert.equal(isRemovedWorldCupPath("/oracle-of-olympus/canada-vs-mexico"), true);
  assert.equal(isRemovedWorldCupPath("/api/oracle-of-olympus/matches"), true);
  assert.equal(isRemovedWorldCupPath("/api/oracle-of-olympus/predict"), true);
  assert.equal(isRemovedWorldCupPath("/tarot"), false);
});
