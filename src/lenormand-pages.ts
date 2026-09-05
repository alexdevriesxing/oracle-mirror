import { LENORMAND_CARDS, lenormandBySlug, type LenormandCard } from "./lenormand-data.ts";

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

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function layout(options: { title: string; description: string; canonical: string; body: string; jsonLd?: unknown[]; client?: boolean }): string {
  const scripts = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`).join("\n");
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
<link rel="stylesheet" href="/lenormand.css">
${scripts}
</head>
<body class="lenormand-page-body">
<header class="lenormand-site-header"><nav class="lenormand-site-nav" aria-label="Lenormand page navigation"><a class="lenormand-brand" href="/">☼ Oracle Mirror</a><div><a href="/lenormand">Lenormand</a><a href="/runes">Runes</a><a href="/tarot">Tarot</a><a href="/iching-oracle">I Ching</a></div></nav></header>
${options.body}
<footer class="lenormand-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>Lenormand readings are symbolic entertainment and reflection prompts, not factual prediction.</p></footer>
</body></html>`;
}

function indexCard(card: LenormandCard): string {
  return `<a class="lenormand-index-card lenormand-${card.polarity}" href="/lenormand/${card.slug}"><span class="lenormand-number">${card.number}</span><span class="lenormand-index-symbol" aria-hidden="true">${card.symbol}</span><span><strong>${esc(card.name)}</strong><small>${esc(card.keywords.join(" · "))}</small></span></a>`;
}

function clientDeckData(): string {
  return safeJson(LENORMAND_CARDS.map((card) => ({
    number: card.number,
    slug: card.slug,
    name: card.name,
    symbol: card.symbol,
    polarity: card.polarity,
    keywords: card.keywords,
    core: card.core,
    light: card.light,
    challenge: card.challenge,
    reflection: card.reflection,
  })));
}

export function isLenormandRoute(pathname: string): boolean {
  return pathname === "/lenormand" || pathname === "/lenormand/" || /^\/lenormand\/[a-z0-9-]+\/?$/.test(pathname);
}

export function lenormandSitemapUrls(): string[] {
  return ["/lenormand", ...LENORMAND_CARDS.map((card) => `/lenormand/${card.slug}`)];
}

export function augmentSitemapWithLenormand(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`${HOST}/lenormand</loc>`)) return xml;
  const additions = lenormandSitemapUrls().map((path) => `  <url><loc>${HOST}${path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${path === "/lenormand" ? "monthly" : "yearly"}</changefreq><priority>${path === "/lenormand" ? "0.8" : "0.55"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${additions}\n</urlset>`);
}

export function augmentLlmsWithLenormand(text: string): string {
  if (text.includes(`${HOST}/lenormand`)) return text;
  return `${text.trimEnd()}\n\n## Lenormand\n- Three-card Lenormand reading: ${HOST}/lenormand\n- 36-card meaning library: ${HOST}/lenormand/rider through ${HOST}/lenormand/cross\n- Oracle Mirror presents modern symbolic Lenormand readings while distinguishing them from the deck's historical Game of Hope origins.\n`;
}

export function injectLenormandDiscovery(html: string): string {
  if (!html || html.includes('href="/lenormand"')) return html;
  let next = html;
  if (next.includes('href="/runes" class="dropdown-item"')) {
    next = next.replace(/(<a href="\/runes" class="dropdown-item"[^>]*>.*?<\/a>)/, '$1\n              <a href="/lenormand" class="dropdown-item">🗝 Lenormand</a>');
  } else {
    next = next.replace(
      '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a>',
      '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a>\n              <a href="/lenormand" class="dropdown-item">🗝 Lenormand</a>'
    );
  }
  const dreamCard = '<a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">';
  if (next.includes(dreamCard)) {
    next = next.replace(
      dreamCard,
      '<a href="/lenormand" class="card card-lenormand"><div class="card-frame"><div class="card-icon">🗝</div><h3>Lenormand</h3><p class="card-desc">Read three cards from the classic 36-symbol system</p></div></a>\n          ' + dreamCard
    );
  }
  next = next.replace("rune casting, and AI Soulmate Vision", "rune casting, Lenormand, and AI Soulmate Vision");
  next = next.replace('"Elder Futhark rune casting"', '"Elder Futhark rune casting",\n          "Lenormand three-card readings"');
  return next;
}

export function renderLenormandHubPage(): Response {
  const title = "Free Lenormand Reading Online — Draw 3 Cards | Oracle Mirror";
  const description = "Draw a free three-card Lenormand reading online using the complete 36-card Petit Lenormand system, then explore every card meaning from Rider to Cross.";
  const body = `<main class="lenormand-main lenormand-hub">
<section class="lenormand-hero"><p class="lenormand-kicker">Petit Lenormand · 36 cards</p><div class="lenormand-hero-symbols" aria-hidden="true">🐎 🍀 ⛵ ❤️ 🔑 ⚓</div><h1>Lenormand Card Reading</h1><p>Draw three distinct cards for a concise look at your <strong>Context</strong>, <strong>Focus</strong>, and <strong>Direction</strong>. Lenormand works especially well by reading cards in combination rather than treating each symbol in isolation.</p></section>
<section class="lenormand-cast-shell" aria-labelledby="lenormand-cast-title"><div class="lenormand-cast-heading"><p class="lenormand-kicker">Three-card line</p><h2 id="lenormand-cast-title">Draw Three Cards</h2><p>Hold a situation in mind if you wish, but do not enter it anywhere. Your cards are drawn entirely in this browser.</p></div><button type="button" class="btn-gold lenormand-draw-button" data-lenormand-draw>Draw Three Cards</button><div class="lenormand-results" data-lenormand-results aria-live="polite"></div><div class="lenormand-combinations" data-lenormand-combinations></div><div class="lenormand-actions" data-lenormand-actions hidden><button type="button" class="btn-ghost" data-lenormand-share>Share This Line</button><button type="button" class="btn-ghost" data-lenormand-reset>Draw Again</button></div><p class="lenormand-private-note">No question, name, birth date, or personal data is requested or transmitted.</p></section>
<section class="lenormand-guide" aria-labelledby="lenormand-guide-title"><p class="lenormand-kicker">Card library</p><h2 id="lenormand-guide-title">All 36 Lenormand Cards</h2><p>Each card has a fixed traditional number and symbol. Oracle Mirror's explanatory text is a modern reading guide designed for reflection and entertainment.</p><div class="lenormand-index-grid">${LENORMAND_CARDS.map(indexCard).join("")}</div></section>
<section class="lenormand-context"><h2>How this three-card line works</h2><div class="lenormand-context-grid"><article><h3>1. Context</h3><p>The first card frames the conditions or influence surrounding the situation.</p></article><article><h3>2. Focus</h3><p>The middle card becomes the center of gravity and modifies how the first card is understood.</p></article><article><h3>3. Direction</h3><p>The final card suggests the direction of the pattern if current conditions continue—not a guaranteed future.</p></article></div></section>
<section class="lenormand-history"><h2>Why it is called Lenormand</h2><p>The familiar 36-card Petit Lenormand sequence developed from Johann Kaspar Hechtel's late-18th-century <em>Game of Hope</em>. Decks using these symbols were later marketed under the name of celebrated French cartomancer Marie Anne Lenormand after her death. Oracle Mirror therefore does not claim that Mlle Lenormand designed or personally used this exact deck.</p></section>
<script id="lenormand-deck-data" type="application/json">${clientDeckData()}</script><script type="module" src="/lenormand.js"></script>
</main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Mirror Lenormand Reading", url: `${HOST}/lenormand`, applicationCategory: "EntertainmentApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description },
    { "@context": "https://schema.org", "@type": "ItemList", name: "36 Lenormand card meanings", numberOfItems: 36, itemListElement: LENORMAND_CARDS.map((card) => ({ "@type": "ListItem", position: card.number, name: card.name, url: `${HOST}/lenormand/${card.slug}` })) },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/lenormand`, body, jsonLd, client: true }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=300" } });
}

export function renderLenormandCardPage(slug: string): Response {
  const card = lenormandBySlug(slug);
  if (!card) return new Response("Lenormand card not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
  const previous = LENORMAND_CARDS[(card.number + LENORMAND_CARDS.length - 2) % LENORMAND_CARDS.length];
  const next = LENORMAND_CARDS[card.number % LENORMAND_CARDS.length];
  const title = `${card.name} Lenormand Card Meaning (#${card.number}) | Oracle Mirror`;
  const description = `${card.name} Lenormand meaning: ${card.keywords.join(", ")}. Learn the card's core message, love and work interpretations, challenge side, and reflection prompt.`;
  const body = `<main class="lenormand-main lenormand-detail"><nav class="lenormand-breadcrumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/lenormand">Lenormand</a><span>›</span><span>${esc(card.name)}</span></nav><article class="lenormand-article"><header class="lenormand-detail-hero"><p class="lenormand-kicker">Lenormand card ${card.number} · ${esc(card.playingCard)}</p><div class="lenormand-detail-symbol" aria-hidden="true">${card.symbol}</div><h1>${esc(card.name)} Lenormand Card Meaning</h1><div class="lenormand-keywords">${card.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><p class="lenormand-answer-first">${esc(card.core)}</p></header><section><h2>${esc(card.name)} in a constructive expression</h2><p>${esc(card.light)}</p></section><section><h2>The challenge side of ${esc(card.name)}</h2><p>${esc(card.challenge)}</p></section><div class="lenormand-meaning-grid"><section><h2>${esc(card.name)} in love and relationships</h2><p>${esc(card.love)}</p></section><section><h2>${esc(card.name)} in work and money</h2><p>${esc(card.work)}</p></section></div><section class="lenormand-reflection-box"><h2>Reflection question</h2><p>${esc(card.reflection)}</p></section><section><h2>Reading ${esc(card.name)} in combinations</h2><p>Lenormand is normally read relationally. In a three-card line, look at the card immediately before and after ${esc(card.name)}. A neighboring card can specify <em>what kind</em> of ${esc(card.keywords[0])} is involved, who or what carries it, or whether the theme becomes easier or more difficult to navigate.</p><p>Use the full <a href="/lenormand">three-card Lenormand reader</a> to see ${esc(card.name)} in context rather than treating it as an isolated verdict.</p></section><section class="lenormand-history-note"><h2>Historical note</h2><p>The 36-card sequence used by modern Petit Lenormand descends from Johann Kaspar Hechtel's <em>Game of Hope</em>, published around 1799. The famous cartomancer Marie Anne Lenormand did not create this specific deck; her name became attached to later cartomancy decks after her death.</p></section><nav class="lenormand-neighbor-nav" aria-label="Adjacent Lenormand cards"><a href="/lenormand/${previous.slug}">← #${previous.number} ${esc(previous.name)}</a><a href="/lenormand/${next.slug}">#${next.number} ${esc(next.name)} →</a></nav><div class="lenormand-detail-actions"><a class="btn-gold" href="/lenormand">Draw Three Cards</a><a class="btn-ghost" href="/lenormand#lenormand-guide-title">Browse All 36</a></div></article></main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: `${card.name} Lenormand Card Meaning (#${card.number})`, description, mainEntityOfPage: `${HOST}/lenormand/${card.slug}`, isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST }, about: ["Petit Lenormand", card.name, ...card.keywords] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "Lenormand", item: `${HOST}/lenormand` }, { "@type": "ListItem", position: 3, name: card.name, item: `${HOST}/lenormand/${card.slug}` } ] },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/lenormand/${card.slug}`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function handleLenormandRoute(pathname: string): Response {
  if (pathname === "/lenormand" || pathname === "/lenormand/") return renderLenormandHubPage();
  const match = pathname.match(/^\/lenormand\/([a-z0-9-]+)\/?$/);
  return match ? renderLenormandCardPage(match[1]) : new Response("Not found", { status: 404 });
}
