import { ELDER_FUTHARK, runeBySlug, type Rune } from "./runes-data.ts";

const HOST = "https://oraclemirror.com";
const LASTMOD = "2026-09-05";

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] || char));
}

function layout(options: { title: string; description: string; canonical: string; body: string; jsonLd?: unknown[] }): string {
  const scripts = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(options.title)}</title>
<meta name="description" content="${esc(options.description)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${esc(options.canonical)}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<meta name="theme-color" content="#05030d">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Oracle Mirror">
<meta property="og:title" content="${esc(options.title)}">
<meta property="og:description" content="${esc(options.description)}">
<meta property="og:url" content="${esc(options.canonical)}">
<meta property="og:image" content="${HOST}/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="/styles.css">
<link rel="stylesheet" href="/runes.css">
${scripts}
</head>
<body class="rune-page-body">
<header class="rune-site-header"><nav class="rune-site-nav" aria-label="Rune page navigation"><a class="rune-brand" href="/">☼ Oracle Mirror</a><div><a href="/runes">Runes</a><a href="/tarot">Tarot</a><a href="/iching-oracle">I Ching</a><a href="/dream-interpreter">Dreams</a></div></nav></header>
${options.body}
<footer class="rune-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>Rune readings are symbolic entertainment and reflection prompts, not factual prediction.</p></footer>
</body></html>`;
}

function runeCard(rune: Rune): string {
  return `<a class="rune-index-card" href="/runes/${rune.slug}"><span class="rune-index-glyph" aria-hidden="true">${rune.glyph}</span><span><strong>${esc(rune.name)}</strong><small>${esc(rune.keywords.join(" · "))}</small></span></a>`;
}

export function isRuneRoute(pathname: string): boolean {
  return pathname === "/runes" || /^\/runes\/[a-z0-9-]+\/?$/.test(pathname);
}

export function runeSitemapUrls(): string[] {
  return ["/runes", ...ELDER_FUTHARK.map((rune) => `/runes/${rune.slug}`)];
}

export function augmentSitemapWithRunes(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`${HOST}/runes</loc>`)) return xml;
  const additions = runeSitemapUrls().map((path) => `  <url><loc>${HOST}${path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${path === "/runes" ? "monthly" : "yearly"}</changefreq><priority>${path === "/runes" ? "0.8" : "0.55"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${additions}\n</urlset>`);
}

export function injectRunesDiscovery(html: string): string {
  if (!html || html.includes('href="/runes"')) return html;
  let next = html;
  next = next.replace(
    '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a>',
    '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a>\n              <a href="/runes" class="dropdown-item">ᚠ Rune Casting</a>'
  );
  next = next.replace(
    '<a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">',
    '<a href="/runes" class="card card-runes" data-realm="runes"><div class="card-frame"><div class="card-icon">ᚠ</div><h3>Rune Casting</h3><p class="card-desc">Cast three Elder Futhark runes for a symbolic reflection</p></div></a>\n          <a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">'
  );
  next = next.replace(
    "palmistry, I Ching, and AI Soulmate Vision",
    "palmistry, I Ching, rune casting, and AI Soulmate Vision"
  );
  next = next.replace(
    '"I Ching coin toss divination"',
    '"I Ching coin toss divination",\n          "Elder Futhark rune casting"'
  );
  return next;
}

export function renderRuneHubPage(): Response {
  const title = "Free Rune Reading Online — Cast 3 Elder Futhark Runes | Oracle Mirror";
  const description = "Cast three Elder Futhark runes online for a free symbolic reading, then explore meanings for all 24 runes including Fehu, Ansuz, Algiz, Tiwaz, Laguz, and Othala.";
  const body = `<main class="rune-main rune-hub">
<section class="rune-hero"><p class="rune-kicker">Elder Futhark · 24 runes</p><div class="rune-hero-glyph" aria-hidden="true">ᚠᚢᚦᚨᚱᚲ</div><h1>Rune Casting</h1><p>Draw three distinct runes for a symbolic look at your <strong>Root</strong>, <strong>Present</strong>, and <strong>Path Ahead</strong>. No question is required and the cast runs entirely in your browser.</p></section>
<section class="rune-cast-shell" aria-labelledby="rune-cast-title"><div class="rune-cast-heading"><p class="rune-kicker">Three-rune reflection</p><h2 id="rune-cast-title">Cast the Futhark</h2><p>Take a moment, choose what you want to reflect on, then cast when ready.</p></div><button type="button" class="btn-gold rune-cast-button" data-rune-cast>Cast Three Runes</button><div class="rune-cast-results" data-rune-results aria-live="polite"></div><div class="rune-cast-actions" data-rune-actions hidden><button type="button" class="btn-ghost" data-rune-share>Share This Cast</button><button type="button" class="btn-ghost" data-rune-reset>Cast Again</button></div><p class="rune-private-note">No question or personal data is requested. The cast is generated locally in your browser.</p></section>
<section class="rune-guide" aria-labelledby="rune-guide-title"><p class="rune-kicker">Reference guide</p><h2 id="rune-guide-title">All 24 Elder Futhark Runes</h2><p>The rune names and sound values are historical labels; the reflection language on Oracle Mirror is a modern symbolic interpretation for entertainment, not a claim that ancient rune users practiced this exact divination system.</p><div class="rune-index-grid">${ELDER_FUTHARK.map(runeCard).join("")}</div></section>
<section class="rune-context"><h2>How to use a three-rune cast</h2><div class="rune-context-grid"><article><h3>1. Root</h3><p>The first rune frames the condition, influence, or pattern underneath the situation.</p></article><article><h3>2. Present</h3><p>The second rune highlights what deserves attention in the current moment.</p></article><article><h3>3. Path Ahead</h3><p>The third rune offers a symbolic lens for the next useful direction, not a guaranteed future event.</p></article></div></section>
<script type="module" src="/runes.js"></script>
</main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Mirror Rune Casting", url: `${HOST}/runes`, applicationCategory: "EntertainmentApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description },
    { "@context": "https://schema.org", "@type": "ItemList", name: "24 Elder Futhark rune meanings", itemListElement: ELDER_FUTHARK.map((rune, index) => ({ "@type": "ListItem", position: index + 1, name: rune.name, url: `${HOST}/runes/${rune.slug}` })) },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/runes`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=300" } });
}

export function renderRuneMeaningPage(slug: string): Response {
  const rune = runeBySlug(slug);
  if (!rune) return new Response("Rune not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
  const title = `${rune.name} Rune Meaning (${rune.glyph}) — Elder Futhark Guide | Oracle Mirror`;
  const description = `${rune.name} (${rune.glyph}) rune meaning: ${rune.keywords.join(", ")}. Explore its modern symbolic reading, constructive expression, challenge, and reflection question.`;
  const body = `<main class="rune-main rune-detail"><nav class="rune-breadcrumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/runes">Runes</a><span>›</span><span>${esc(rune.name)}</span></nav><article class="rune-article"><header class="rune-detail-hero"><p class="rune-kicker">Elder Futhark rune meaning</p><div class="rune-detail-glyph" aria-hidden="true">${rune.glyph}</div><h1>${esc(rune.name)} Rune Meaning</h1><p class="rune-pronunciation">Transliteration / sound value: <strong>${esc(rune.sound)}</strong></p><div class="rune-keywords">${rune.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><p class="rune-answer-first">${esc(rune.core)}</p></header><section><h2>What ${esc(rune.name)} can symbolize in a reading</h2><p>${esc(rune.light)}</p></section><section><h2>The challenge side of ${esc(rune.name)}</h2><p>${esc(rune.challenge)}</p></section><section class="rune-reflection-box"><h2>Reflection question</h2><p>${esc(rune.reflection)}</p></section><section><h2>Using ${esc(rune.name)} in a three-rune cast</h2><p>If ${esc(rune.name)} appears in the <strong>Root</strong> position, consider how its theme may describe the condition underneath your situation. In the <strong>Present</strong> position, use it as a prompt for what deserves attention now. In the <strong>Path Ahead</strong> position, treat it as a possible direction for reflection rather than a fixed prediction.</p></section><section class="rune-history-note"><h2>A note on history and modern divination</h2><p>The Elder Futhark is the earliest widely attested runic alphabet used by Germanic-speaking peoples in the first millennium CE. Modern rune divination systems combine historical rune names and later textual traditions with contemporary symbolic practice. Oracle Mirror labels these interpretations as modern reflections rather than claiming they reproduce one documented ancient fortune-telling method.</p></section><div class="rune-detail-actions"><a class="btn-gold" href="/runes">Cast Three Runes</a><a class="btn-ghost" href="/runes#rune-guide-title">Browse All Runes</a></div></article></main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${rune.name} Rune Meaning (${rune.glyph})`, description, mainEntityOfPage: `${HOST}/runes/${rune.slug}`, isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST }, about: ["Elder Futhark", rune.name, ...rune.keywords] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "Runes", item: `${HOST}/runes` }, { "@type": "ListItem", position: 3, name: rune.name, item: `${HOST}/runes/${rune.slug}` } ] },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/runes/${rune.slug}`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function handleRuneRoute(pathname: string): Response {
  if (pathname === "/runes" || pathname === "/runes/") return renderRuneHubPage();
  const match = pathname.match(/^\/runes\/([a-z0-9-]+)\/?$/);
  return match ? renderRuneMeaningPage(match[1]) : new Response("Not found", { status: 404 });
}
