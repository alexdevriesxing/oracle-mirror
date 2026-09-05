import { TAROT_CARDS, tarotBySlug, type TarotCard } from "./tarot-data.ts";

const HOST = "https://oraclemirror.com";
const LASTMOD = "2026-09-05";

export const TAROT_SPREAD_GUIDES = [
  { slug: "three-card", name: "Past · Present · Future", count: 3, summary: "A concise line for what shaped the situation, what is active now, and the direction of the current pattern.", positions: ["Past", "Present", "Future"] },
  { slug: "love", name: "Love & Connection", count: 5, summary: "A five-card relationship spread covering each person, the connection, its challenge, and its likely direction if current dynamics continue.", positions: ["You", "Them", "Connection", "Challenge", "Direction"] },
  { slug: "career", name: "Career Compass", count: 5, summary: "A work-focused spread for your current position, strongest asset, obstacle, opportunity, and practical next step.", positions: ["Current Position", "Strength", "Obstacle", "Opportunity", "Next Step"] },
  { slug: "decision", name: "Decision Mirror", count: 4, summary: "A four-card spread for comparing two options while surfacing a hidden factor and a practical piece of advice.", positions: ["Option A", "Option B", "Hidden Factor", "Advice"] },
  { slug: "horseshoe", name: "Horseshoe", count: 7, summary: "A broad seven-card overview of past and present conditions, hidden influences, obstacles, environment, advice, and direction.", positions: ["Past", "Present", "Hidden Influence", "Obstacle", "Environment", "Advice", "Direction"] },
  { slug: "celtic-cross", name: "Celtic Cross", count: 10, summary: "A detailed ten-card spread covering the present, challenge, foundation, past, possibility, near future, self, environment, hopes and fears, and direction.", positions: ["Present", "Challenge", "Foundation", "Recent Past", "Possibility", "Near Future", "Self", "Environment", "Hopes & Fears", "Direction"] },
  { slug: "year-ahead", name: "Year Ahead", count: 12, summary: "A twelve-card reflective map that assigns one card to each upcoming month rather than treating the year as a fixed prediction.", positions: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"] },
] as const;

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));
}
function safeJson(value: unknown): string { return JSON.stringify(value).replace(/</g, "\\u003c"); }
function layout(options: { title: string; description: string; canonical: string; body: string; jsonLd?: unknown[] }): string {
  const scripts = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(options.title)}</title><meta name="description" content="${esc(options.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(options.canonical)}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="theme-color" content="#08040f"><meta property="og:type" content="website"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="${esc(options.title)}"><meta property="og:description" content="${esc(options.description)}"><meta property="og:url" content="${esc(options.canonical)}"><meta property="og:image" content="${HOST}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/advanced-tarot.css">${scripts}</head><body class="advanced-tarot-body"><header class="advanced-tarot-header"><nav class="advanced-tarot-nav" aria-label="Tarot navigation"><a class="advanced-tarot-brand" href="/">☼ Oracle Mirror</a><div><a href="/tarot">Classic Tarot</a><a href="/tarot/advanced">Advanced Reader</a><a href="/tarot/cards">78 Cards</a><a href="/tarot/spreads">Spreads</a></div></nav></header>${options.body}<footer class="advanced-tarot-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>Tarot readings are symbolic entertainment and reflection prompts, not factual prediction.</p></footer></body></html>`;
}

function deckData(): string {
  return safeJson(TAROT_CARDS.map((card) => ({ slug: card.slug, name: card.name, glyph: card.glyph, upright: card.upright, reversed: card.reversed })));
}
function cardTile(card: TarotCard): string {
  return `<a class="advanced-tarot-index-card" href="/tarot/cards/${card.slug}"><span class="advanced-tarot-index-glyph" aria-hidden="true">${esc(card.glyph)}</span><span><strong>${esc(card.name)}</strong><small>${esc(card.keywords.join(" · "))}</small></span></a>`;
}

export function isAdvancedTarotRoute(pathname: string): boolean {
  return pathname === "/tarot/advanced" || pathname === "/tarot/advanced/" || pathname === "/tarot/cards" || pathname === "/tarot/cards/" || pathname === "/tarot/spreads" || pathname === "/tarot/spreads/" || /^\/tarot\/cards\/[a-z0-9-]+\/?$/.test(pathname) || /^\/tarot\/spreads\/[a-z0-9-]+\/?$/.test(pathname);
}
export function advancedTarotSitemapUrls(): string[] {
  return ["/tarot/advanced", "/tarot/cards", ...TAROT_CARDS.map((card) => `/tarot/cards/${card.slug}`), "/tarot/spreads", ...TAROT_SPREAD_GUIDES.map((spread) => `/tarot/spreads/${spread.slug}`)];
}
export function augmentSitemapWithAdvancedTarot(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`${HOST}/tarot/advanced</loc>`)) return xml;
  const additions = advancedTarotSitemapUrls().map((path) => `  <url><loc>${HOST}${path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${path === "/tarot/advanced" ? "monthly" : "yearly"}</changefreq><priority>${path === "/tarot/advanced" ? "0.85" : path === "/tarot/cards" || path === "/tarot/spreads" ? "0.75" : "0.55"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${additions}\n</urlset>`);
}
export function augmentLlmsWithAdvancedTarot(text: string): string {
  if (text.includes(`${HOST}/tarot/advanced`)) return text;
  return `${text.trimEnd()}\n\n## Advanced Tarot\n- Full 78-card local reader: ${HOST}/tarot/advanced\n- 78-card meaning library: ${HOST}/tarot/cards\n- Spread guides: ${HOST}/tarot/spreads\n- Individual card pages include upright/reversed, love, work, and reflection interpretations.\n`;
}
export function injectAdvancedTarotDiscovery(html: string): string {
  if (!html || html.includes('href="/tarot/advanced"')) return html;
  let next = html;
  next = next.replace(/(<a href="\/tarot" class="dropdown-item"[^>]*>.*?<\/a>)/, '$1\n              <a href="/tarot/advanced" class="dropdown-item">✦ Advanced Tarot</a>');
  next = next.replace("rune casting, Lenormand, and AI Soulmate Vision", "rune casting, Lenormand, advanced 78-card Tarot, and AI Soulmate Vision");
  next = next.replace('"Lenormand three-card readings"', '"Lenormand three-card readings",\n          "Advanced 78-card Tarot readings"');
  return next;
}

export function renderAdvancedTarotReader(): Response {
  const title = "Free 78-Card Tarot Reader — Advanced Spreads | Oracle Mirror";
  const description = "Draw from the complete 78-card Tarot deck with upright and reversed meanings using seven spreads including Celtic Cross, Love, Career, Horseshoe and Year Ahead.";
  const spreadOptions = TAROT_SPREAD_GUIDES.map((spread) => `<option value="${spread.slug}">${esc(spread.name)} · ${spread.count} cards</option>`).join("");
  const body = `<main class="advanced-tarot-main"><section class="advanced-tarot-hero"><p class="advanced-tarot-kicker">78 cards · 7 spreads · local draw</p><div class="advanced-tarot-hero-symbol" aria-hidden="true">✦</div><h1>Advanced Tarot Reader</h1><p>Choose a spread, hold your situation in mind, and draw from all 78 Tarot cards. No question is typed or transmitted; the reading is generated entirely in this browser.</p></section><section class="advanced-tarot-reader" aria-labelledby="advanced-tarot-reader-title"><div><p class="advanced-tarot-kicker">Choose your layout</p><h2 id="advanced-tarot-reader-title">Draw a Tarot Spread</h2><label for="advanced-tarot-spread">Spread</label><select id="advanced-tarot-spread" data-tarot-spread>${spreadOptions}</select><button type="button" class="btn-gold" data-tarot-draw>Draw This Spread</button></div><div class="advanced-tarot-results" data-tarot-results aria-live="polite"></div><div class="advanced-tarot-actions" data-tarot-actions hidden><button type="button" class="btn-ghost" data-tarot-share>Create Share Card</button><button type="button" class="btn-ghost" data-tarot-reset>Clear Reading</button></div><p class="advanced-tarot-private-note">No question, name, birthday, or personal note is requested or sent to Oracle Mirror.</p></section><section class="advanced-tarot-callouts"><article><h2>Explore all 78 cards</h2><p>Browse the Major Arcana and all four Minor Arcana suits with upright, reversed, love, and work meanings.</p><a class="btn-ghost" href="/tarot/cards">Open the 78-card library</a></article><article><h2>Learn the spreads</h2><p>Understand what each position means before using a Celtic Cross, Horseshoe, Career, Love, Decision, or Year Ahead layout.</p><a class="btn-ghost" href="/tarot/spreads">Browse spread guides</a></article></section><section class="advanced-tarot-history"><h2>Tarot before fortune-telling</h2><p>Tarot developed in fifteenth-century Italy as a trick-taking card game. The familiar 78-card structure combines 56 suited cards with 21 trumps and the Fool. Modern occult and divinatory associations came much later. Oracle Mirror uses contemporary symbolic reading conventions while keeping that historical distinction clear.</p><p><a href="https://www.metmuseum.org/pt/perspectives/tarot-2" rel="noopener noreferrer">Read the Metropolitan Museum of Art overview of early Tarot history.</a></p></section><script id="advanced-tarot-deck-data" type="application/json">${deckData()}</script><script type="module" src="/advanced-tarot.js"></script></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Mirror Advanced Tarot Reader", url: `${HOST}/tarot/advanced`, applicationCategory: "EntertainmentApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description }];
  return new Response(layout({ title, description, canonical: `${HOST}/tarot/advanced`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=300" } });
}

export function renderTarotLibrary(): Response {
  const title = "All 78 Tarot Card Meanings — Major & Minor Arcana | Oracle Mirror";
  const description = "Browse all 78 Tarot card meanings with upright and reversed interpretations plus love, relationship, work, money, and reflection guidance.";
  const majors = TAROT_CARDS.filter((card) => card.arcana === "major");
  const suits = ["Wands", "Cups", "Swords", "Pentacles"] as const;
  const body = `<main class="advanced-tarot-main"><section class="advanced-tarot-hero"><p class="advanced-tarot-kicker">Complete card library</p><h1>All 78 Tarot Card Meanings</h1><p>Explore the 22 Major Arcana and 56 Minor Arcana cards. Each page separates upright and reversed interpretations and adds practical love and work lenses without treating the cards as guaranteed prediction.</p></section><section class="advanced-tarot-library"><h2>Major Arcana</h2><div class="advanced-tarot-index-grid">${majors.map(cardTile).join("")}</div>${suits.map((suit) => `<h2>${suit}</h2><div class="advanced-tarot-index-grid">${TAROT_CARDS.filter((card) => card.suit === suit).map(cardTile).join("")}</div>`).join("")}</section></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "ItemList", name: "78 Tarot card meanings", numberOfItems: 78, itemListElement: TAROT_CARDS.map((card, index) => ({ "@type": "ListItem", position: index + 1, name: card.name, url: `${HOST}/tarot/cards/${card.slug}` })) }];
  return new Response(layout({ title, description, canonical: `${HOST}/tarot/cards`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderTarotCardPage(slug: string): Response {
  const card = tarotBySlug(slug);
  if (!card) return new Response("Tarot card not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
  const index = TAROT_CARDS.indexOf(card);
  const previous = TAROT_CARDS[(index + TAROT_CARDS.length - 1) % TAROT_CARDS.length];
  const next = TAROT_CARDS[(index + 1) % TAROT_CARDS.length];
  const title = `${card.name} Tarot Meaning — Upright & Reversed | Oracle Mirror`;
  const description = `${card.name} Tarot meaning: ${card.keywords.join(", ")}. Explore upright, reversed, love, relationship, work, money, and reflection interpretations.`;
  const body = `<main class="advanced-tarot-main"><nav class="advanced-tarot-breadcrumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/tarot/cards">Tarot Cards</a><span>›</span><span>${esc(card.name)}</span></nav><article class="advanced-tarot-article"><header class="advanced-tarot-card-hero"><p class="advanced-tarot-kicker">${card.arcana === "major" ? `Major Arcana ${esc(card.rank)}` : `${esc(card.rank)} · ${esc(card.suit || "")}`}</p><div class="advanced-tarot-detail-glyph" aria-hidden="true">${esc(card.glyph)}</div><h1>${esc(card.name)} Tarot Card Meaning</h1><div class="advanced-tarot-keywords">${card.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><p class="advanced-tarot-answer-first">${esc(card.upright)}</p></header><section><h2>${esc(card.name)} upright meaning</h2><p>${esc(card.upright)}</p></section><section><h2>${esc(card.name)} reversed meaning</h2><p>${esc(card.reversed)}</p></section><div class="advanced-tarot-meaning-grid"><section><h2>Love and relationships</h2><p>${esc(card.love)}</p></section><section><h2>Work and money</h2><p>${esc(card.work)}</p></section></div><section class="advanced-tarot-reflection"><h2>Reflection question</h2><p>${esc(card.reflection)}</p></section><section><h2>Reading this card in context</h2><p>Orientation is only one layer. Read ${esc(card.name)} alongside its spread position and neighboring cards. A reversed card does not automatically mean “bad”; it can point to delay, internalization, imbalance, resistance, or a need to reconsider how the upright theme is being expressed.</p></section><nav class="advanced-tarot-neighbors" aria-label="Adjacent Tarot cards"><a href="/tarot/cards/${previous.slug}">← ${esc(previous.name)}</a><a href="/tarot/cards/${next.slug}">${esc(next.name)} →</a></nav><div class="advanced-tarot-detail-actions"><a class="btn-gold" href="/tarot/advanced">Draw a Spread</a><a class="btn-ghost" href="/tarot/cards">Browse All 78</a></div></article></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "Article", headline: `${card.name} Tarot Card Meaning`, description, mainEntityOfPage: `${HOST}/tarot/cards/${card.slug}`, isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST }, about: ["Tarot", card.name, ...card.keywords] }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "Tarot Cards", item: `${HOST}/tarot/cards` }, { "@type": "ListItem", position: 3, name: card.name, item: `${HOST}/tarot/cards/${card.slug}` }] }];
  return new Response(layout({ title, description, canonical: `${HOST}/tarot/cards/${card.slug}`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=86400" } });
}

export function renderTarotSpreadHub(): Response {
  const title = "Tarot Spread Guide — 3 Card, Celtic Cross, Love & More | Oracle Mirror";
  const description = "Learn seven Tarot spreads from a simple three-card line to Celtic Cross, Horseshoe, Love, Career, Decision, and Year Ahead layouts.";
  const body = `<main class="advanced-tarot-main"><section class="advanced-tarot-hero"><p class="advanced-tarot-kicker">Seven layouts</p><h1>Tarot Spread Guide</h1><p>A spread gives each card a job. Choose the smallest layout that can answer the kind of reflection you want; more cards do not automatically produce a better reading.</p></section><section class="advanced-tarot-spread-grid">${TAROT_SPREAD_GUIDES.map((spread) => `<article><p class="advanced-tarot-kicker">${spread.count} cards</p><h2>${esc(spread.name)}</h2><p>${esc(spread.summary)}</p><a href="/tarot/spreads/${spread.slug}">Learn this spread</a></article>`).join("")}</section></main>`;
  return new Response(layout({ title, description, canonical: `${HOST}/tarot/spreads`, body }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderTarotSpreadPage(slug: string): Response {
  const spread = TAROT_SPREAD_GUIDES.find((item) => item.slug === slug);
  if (!spread) return new Response("Tarot spread not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
  const title = `${spread.name} Tarot Spread — Positions & How to Read It | Oracle Mirror`;
  const description = `${spread.name} Tarot spread guide: learn all ${spread.count} positions, how to read the layout, and use it in Oracle Mirror's free 78-card reader.`;
  const body = `<main class="advanced-tarot-main"><nav class="advanced-tarot-breadcrumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/tarot/spreads">Tarot Spreads</a><span>›</span><span>${esc(spread.name)}</span></nav><article class="advanced-tarot-article"><header><p class="advanced-tarot-kicker">${spread.count}-card layout</p><h1>${esc(spread.name)} Tarot Spread</h1><p class="advanced-tarot-answer-first">${esc(spread.summary)}</p></header><section><h2>Card positions</h2><ol class="advanced-tarot-position-list">${spread.positions.map((position, index) => `<li><strong>${index + 1}. ${esc(position)}</strong><span>Read this card through the question implied by the position, then compare it with the cards immediately around it.</span></li>`).join("")}</ol></section><section><h2>How to read this spread</h2><p>Read the positions in order once, then look for repeated suits, Major Arcana concentration, contradictions, and cards that seem to answer one another. Reversals are best treated as modified expressions rather than automatic negatives.</p></section><div class="advanced-tarot-detail-actions"><a class="btn-gold" href="/tarot/advanced">Use ${esc(spread.name)}</a><a class="btn-ghost" href="/tarot/spreads">All Spread Guides</a></div></article></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "Article", headline: `${spread.name} Tarot Spread`, description, mainEntityOfPage: `${HOST}/tarot/spreads/${spread.slug}` }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "Tarot Spreads", item: `${HOST}/tarot/spreads` }, { "@type": "ListItem", position: 3, name: spread.name, item: `${HOST}/tarot/spreads/${spread.slug}` }] }];
  return new Response(layout({ title, description, canonical: `${HOST}/tarot/spreads/${spread.slug}`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=86400" } });
}

export function handleAdvancedTarotRoute(pathname: string): Response {
  const clean = pathname.replace(/\/+$/, "") || "/";
  if (clean === "/tarot/advanced") return renderAdvancedTarotReader();
  if (clean === "/tarot/cards") return renderTarotLibrary();
  if (clean === "/tarot/spreads") return renderTarotSpreadHub();
  const cardMatch = clean.match(/^\/tarot\/cards\/([a-z0-9-]+)$/);
  if (cardMatch) return renderTarotCardPage(cardMatch[1]);
  const spreadMatch = clean.match(/^\/tarot\/spreads\/([a-z0-9-]+)$/);
  if (spreadMatch) return renderTarotSpreadPage(spreadMatch[1]);
  return new Response("Tarot page not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
}
