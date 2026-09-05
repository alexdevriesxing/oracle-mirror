import { HEXAGRAMS, TRIGRAMS, hexagram, hexagramBySlug, hexagramPath, trigram, type Hexagram, type Trigram } from "./iching-data.ts";

const HOST = "https://oraclemirror.com";
const LASTMOD = "2026-09-05";

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function layout(options: { title: string; description: string; canonical: string; body: string; jsonLd?: unknown[] }): string {
  const scripts = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(options.title)}</title><meta name="description" content="${esc(options.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(options.canonical)}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="theme-color" content="#07050d"><meta property="og:type" content="website"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="${esc(options.title)}"><meta property="og:description" content="${esc(options.description)}"><meta property="og:url" content="${esc(options.canonical)}"><meta property="og:image" content="${HOST}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/advanced-iching.css">${scripts}</head><body class="advanced-iching-body"><header class="advanced-iching-header"><nav class="advanced-iching-nav" aria-label="I Ching navigation"><a class="advanced-iching-brand" href="/">☼ Oracle Mirror</a><div><a href="/iching-oracle">Classic I Ching</a><a href="/iching">Three-Coin Cast</a><a href="/iching/hexagrams">64 Hexagrams</a><a href="/iching/trigrams">Eight Trigrams</a></div></nav></header>${options.body}<footer class="advanced-iching-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>I Ching readings here are symbolic entertainment and reflection, not guaranteed prediction or professional advice.</p></footer></body></html>`;
}

function hexCard(item: Hexagram): string {
  return `<a class="iching-hex-card" href="${hexagramPath(item)}"><span class="iching-hex-symbol" aria-hidden="true">${item.symbol}</span><span><small>Hexagram ${item.number}</small><strong>${esc(item.name)}</strong><em>${esc(item.chinese)} · ${esc(item.pinyin)}</em></span></a>`;
}

function trigramCard(item: Trigram): string {
  return `<a class="iching-trigram-card" href="/iching/trigrams/${item.slug}"><span class="iching-trigram-symbol" aria-hidden="true">${item.glyph}</span><span><strong>${esc(item.name)} · ${esc(item.chinese)}</strong><small>${esc(item.pinyin)} · ${esc(item.quality)}</small></span></a>`;
}

function clientHexagramData(): string {
  return safeJson(HEXAGRAMS.map((item) => ({ number: item.number, slug: item.slug, name: item.name, symbol: item.symbol, summary: item.summary, guidance: item.guidance, path: hexagramPath(item) })));
}

export function isAdvancedIChingRoute(pathname: string): boolean {
  return pathname === "/iching" || pathname === "/iching/" || pathname === "/iching/hexagrams" || pathname === "/iching/hexagrams/" || /^\/iching\/hexagrams\/(?:[1-9]|[1-5][0-9]|6[0-4])(?:-[a-z0-9-]+)?\/?$/.test(pathname) || pathname === "/iching/trigrams" || pathname === "/iching/trigrams/" || /^\/iching\/trigrams\/[a-z]+\/?$/.test(pathname) || pathname === "/iching/coin-method" || pathname === "/iching/coin-method/";
}

export function advancedIChingSitemapUrls(): string[] {
  return [
    "/iching",
    "/iching/hexagrams",
    ...HEXAGRAMS.map(hexagramPath),
    "/iching/trigrams",
    ...TRIGRAMS.map((item) => `/iching/trigrams/${item.slug}`),
    "/iching/coin-method",
  ];
}

export function augmentSitemapWithAdvancedIChing(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`${HOST}/iching</loc>`)) return xml;
  const additions = advancedIChingSitemapUrls().map((path) => `  <url><loc>${HOST}${path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${path === "/iching" ? "monthly" : "yearly"}</changefreq><priority>${path === "/iching" ? "0.8" : "0.55"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${additions}\n</urlset>`);
}

export function augmentLlmsWithAdvancedIChing(text: string): string {
  if (text.includes("## Advanced I Ching")) return text;
  return `${text.trimEnd()}\n\n## Advanced I Ching\n- ${HOST}/iching — local three-coin I Ching casting with changing lines and transformed hexagrams; no question or private input is required.\n- ${HOST}/iching/hexagrams — all 64 hexagrams in the received King Wen sequence with upper/lower trigram structure.\n- ${HOST}/iching/trigrams — the eight trigrams: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, and Earth.\n- ${HOST}/iching/coin-method — explanation of the later three-coin method and line values 6, 7, 8, and 9.\n`;
}

export function injectAdvancedIChingDiscovery(html: string): string {
  if (!html || html.includes('href="/iching" class="dropdown-item"')) return html;
  let next = html;
  next = next.replace(
    '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a>',
    '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; Classic I Ching</a>\n              <a href="/iching" class="dropdown-item">☯ Advanced I Ching</a>'
  );
  next = next.replace(
    '<a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">',
    '<a href="/iching" class="card card-advanced-iching"><div class="card-frame"><div class="card-icon">☯</div><h3>Advanced I Ching</h3><p class="card-desc">Cast six coin lines, reveal changing lines, and explore all 64 hexagrams</p></div></a>\n          <a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">'
  );
  next = next.replace("palmistry, I Ching,", "palmistry, Classic I Ching, Advanced I Ching,");
  return next;
}

export function renderAdvancedIChingPage(): Response {
  const title = "Free I Ching Reading — 3-Coin Hexagram Cast | Oracle Mirror";
  const description = "Cast an I Ching hexagram locally with the three-coin method. See six lines, changing lines, the transformed hexagram, trigrams, and all 64 King Wen hexagram meanings.";
  const body = `<main class="advanced-iching-main"><section class="advanced-iching-hero"><p class="advanced-iching-kicker">64 hexagrams · six lines · local casting</p><div class="advanced-iching-hero-symbol" aria-hidden="true">☯</div><h1>Advanced I Ching Reading</h1><p>Hold a situation in mind if you wish, then cast six lines from bottom to top. Oracle Mirror does not ask you to type the question: the complete three-coin cast happens in your browser.</p></section><section class="advanced-iching-caster" aria-labelledby="iching-cast-title"><div><p class="advanced-iching-kicker">Three-coin method</p><h2 id="iching-cast-title">Cast the Six Lines</h2><p>Each line comes from three virtual coins. Values 6 and 9 are changing lines; 7 and 8 are stable. A changed line flips yin ↔ yang to form a transformed hexagram.</p></div><button class="btn-gold" type="button" data-iching-cast>Cast Six Lines</button><div class="advanced-iching-results" data-iching-results aria-live="polite"></div><div class="advanced-iching-actions" data-iching-actions hidden><button class="btn-ghost" type="button" data-iching-share>Share Generated Hexagrams</button><button class="btn-ghost" type="button" data-iching-reset>Cast Again</button></div><p class="advanced-iching-private-note">No question, name, birth date, or notes are collected by this reader. The generated cast is the only information eligible for sharing.</p></section><section class="advanced-iching-guide"><p class="advanced-iching-kicker">Reference library</p><h2>Explore the Book of Changes</h2><div class="advanced-iching-guide-grid"><a href="/iching/hexagrams"><strong>64 Hexagrams</strong><span>Browse the received King Wen sequence and each upper/lower trigram pairing.</span></a><a href="/iching/trigrams"><strong>Eight Trigrams</strong><span>Learn the three-line figures that combine to form every hexagram.</span></a><a href="/iching/coin-method"><strong>Three-Coin Method</strong><span>Understand 6, 7, 8, 9, changing lines, and transformed hexagrams.</span></a><a href="/iching-oracle"><strong>Classic AI I Ching</strong><span>Use the original Oracle Mirror I Ching experience when you want an AI interpretation.</span></a></div></section><section class="advanced-iching-history"><h2>History without collapsing the timeline</h2><p>The I Ching developed through a long textual and interpretive history. The received sequence of 64 hexagrams is conventionally called the King Wen sequence, while coin casting is a later divination technique that appeared long after earlier yarrow-stalk practice.</p><p>Oracle Mirror therefore uses the three-coin method as a modern practical interface, not as a claim that coins were the earliest way the Zhouyi was consulted. The short meanings here are original reflection summaries and do not reproduce a copyrighted modern translation.</p></section><script id="advanced-iching-data" type="application/json">${clientHexagramData()}</script><script type="module" src="/advanced-iching.js"></script></main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Mirror Advanced I Ching", url: `${HOST}/iching`, applicationCategory: "EntertainmentApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description },
    { "@context": "https://schema.org", "@type": "ItemList", name: "64 I Ching hexagrams", numberOfItems: 64, itemListElement: HEXAGRAMS.map((item) => ({ "@type": "ListItem", position: item.number, name: `Hexagram ${item.number}: ${item.name}`, url: `${HOST}${hexagramPath(item)}` })) },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/iching`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=300" } });
}

export function renderHexagramHub(): Response {
  const title = "I Ching Hexagrams 1–64 — King Wen Sequence Meanings | Oracle Mirror";
  const description = "Browse all 64 I Ching hexagrams in the received King Wen sequence with names, Chinese characters, upper and lower trigrams, keywords, and concise reflection meanings.";
  const body = `<main class="advanced-iching-main"><nav class="advanced-iching-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/iching">I Ching</a><span>›</span><span>64 Hexagrams</span></nav><section class="advanced-iching-hero"><p class="advanced-iching-kicker">Received sequence</p><h1>All 64 I Ching Hexagrams</h1><p>The hexagrams below follow the received King Wen sequence. Each figure combines a lower trigram (lines 1–3) and an upper trigram (lines 4–6).</p></section><div class="iching-hex-grid">${HEXAGRAMS.map(hexCard).join("")}</div><div class="advanced-iching-detail-actions"><a class="btn-gold" href="/iching">Cast a Hexagram</a><a class="btn-ghost" href="/iching/trigrams">Explore the Trigrams</a></div></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "ItemList", name: "64 I Ching hexagrams", numberOfItems: 64, itemListElement: HEXAGRAMS.map((item) => ({ "@type": "ListItem", position: item.number, name: `Hexagram ${item.number}: ${item.name}`, url: `${HOST}${hexagramPath(item)}` })) }];
  return new Response(layout({ title, description, canonical: `${HOST}/iching/hexagrams`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderHexagramPage(item: Hexagram): Response {
  const lower = trigram(item.lower)!;
  const upper = trigram(item.upper)!;
  const title = `I Ching Hexagram ${item.number}: ${item.name} (${item.chinese}) Meaning | Oracle Mirror`;
  const description = `Hexagram ${item.number}, ${item.name} (${item.chinese}, ${item.pinyin}): ${item.keywords.join(", ")}. Upper trigram ${upper.name}, lower trigram ${lower.name}.`;
  const body = `<main class="advanced-iching-main"><nav class="advanced-iching-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/iching">I Ching</a><span>›</span><a href="/iching/hexagrams">Hexagrams</a><span>›</span><span>${item.number}</span></nav><article class="advanced-iching-article"><header class="advanced-iching-hex-hero"><p class="advanced-iching-kicker">Hexagram ${item.number} · King Wen sequence</p><div class="advanced-iching-big-symbol" aria-hidden="true">${item.symbol}</div><h1>Hexagram ${item.number}: ${esc(item.name)}</h1><p class="advanced-iching-chinese">${esc(item.chinese)} · ${esc(item.pinyin)}</p><div class="advanced-iching-keywords">${item.keywords.map((word) => `<span>${esc(word)}</span>`).join("")}</div><p class="advanced-iching-answer-first">${esc(item.summary)}</p></header><section class="iching-composition"><h2>Upper and lower trigrams</h2><div><a href="/iching/trigrams/${upper.slug}"><span aria-hidden="true">${upper.glyph}</span><strong>Upper: ${esc(upper.name)}</strong><small>${esc(upper.chinese)} · ${esc(upper.pinyin)} · ${esc(upper.quality)}</small></a><a href="/iching/trigrams/${lower.slug}"><span aria-hidden="true">${lower.glyph}</span><strong>Lower: ${esc(lower.name)}</strong><small>${esc(lower.chinese)} · ${esc(lower.pinyin)} · ${esc(lower.quality)}</small></a></div></section><section><h2>Reflection meaning</h2><p>${esc(item.summary)}</p><p>${esc(item.guidance)}</p></section><section><h2>If this hexagram appears in a changing reading</h2><p>Changing lines mark the parts of the six-line figure that move from yin to yang or yang to yin. Those changes generate a second hexagram. Oracle Mirror presents the first hexagram as the current symbolic pattern and the transformed hexagram as a second lens on the direction of change; it does not treat the second figure as a guaranteed future event.</p></section><section class="advanced-iching-history"><h2>About this page</h2><p>This page gives an original concise reflection rather than reproducing a modern translation of the classic Judgment or line texts. Serious study benefits from comparing reputable scholarly translations and commentaries because terminology, textual history, and interpretive traditions differ.</p></section><div class="advanced-iching-detail-actions"><a class="btn-gold" href="/iching">Cast the I Ching</a><a class="btn-ghost" href="/iching/hexagrams">All 64 Hexagrams</a></div></article></main>`;
  const canonical = `${HOST}${hexagramPath(item)}`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: `I Ching Hexagram ${item.number}: ${item.name}`, description, mainEntityOfPage: canonical, isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST }, about: ["I Ching", "Book of Changes", `Hexagram ${item.number}`, upper.name, lower.name, ...item.keywords] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "I Ching", item: `${HOST}/iching` }, { "@type": "ListItem", position: 3, name: "64 Hexagrams", item: `${HOST}/iching/hexagrams` }, { "@type": "ListItem", position: 4, name: `Hexagram ${item.number}: ${item.name}`, item: canonical }] },
  ];
  return new Response(layout({ title, description, canonical, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderTrigramHub(): Response {
  const title = "Eight I Ching Trigrams — Bagua Meanings & Hexagram Structure | Oracle Mirror";
  const description = "Explore the eight I Ching trigrams: Heaven, Lake, Fire, Thunder, Wind, Water, Mountain, and Earth, with line patterns, Chinese names, and symbolic qualities.";
  const body = `<main class="advanced-iching-main"><nav class="advanced-iching-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/iching">I Ching</a><span>›</span><span>Eight Trigrams</span></nav><section class="advanced-iching-hero"><p class="advanced-iching-kicker">Bagua · three-line figures</p><h1>The Eight Trigrams</h1><p>Every I Ching hexagram is built from two trigrams. The lower trigram is formed by lines 1–3; the upper trigram by lines 4–6.</p></section><div class="iching-trigram-grid">${TRIGRAMS.map(trigramCard).join("")}</div><div class="advanced-iching-detail-actions"><a class="btn-gold" href="/iching">Cast a Hexagram</a><a class="btn-ghost" href="/iching/hexagrams">Browse 64 Hexagrams</a></div></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "ItemList", name: "Eight I Ching trigrams", numberOfItems: 8, itemListElement: TRIGRAMS.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: `${item.name} (${item.chinese})`, url: `${HOST}/iching/trigrams/${item.slug}` })) }];
  return new Response(layout({ title, description, canonical: `${HOST}/iching/trigrams`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderTrigramPage(item: Trigram): Response {
  const related = HEXAGRAMS.filter((hex) => hex.lower === item.slug || hex.upper === item.slug);
  const title = `${item.name} Trigram ${item.glyph} (${item.chinese} ${item.pinyin}) Meaning | Oracle Mirror`;
  const description = `${item.name} trigram ${item.glyph} (${item.chinese}, ${item.pinyin}) in the I Ching: ${item.quality}. Explore its three-line pattern and related hexagrams.`;
  const body = `<main class="advanced-iching-main"><nav class="advanced-iching-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/iching">I Ching</a><span>›</span><a href="/iching/trigrams">Trigrams</a><span>›</span><span>${esc(item.name)}</span></nav><article class="advanced-iching-article"><header class="advanced-iching-trigram-hero"><p class="advanced-iching-kicker">Three-line trigram</p><div class="advanced-iching-big-trigram" aria-hidden="true">${item.glyph}</div><h1>${esc(item.name)} Trigram</h1><p>${esc(item.chinese)} · ${esc(item.pinyin)}</p><p class="advanced-iching-answer-first">${esc(item.name)} is associated here with ${esc(item.quality)} and the image of ${esc(item.image)}. Its bottom-to-top binary line pattern is ${esc(item.bits)} where 1 represents yang and 0 represents yin.</p></header><section><h2>${esc(item.name)} as a lower or upper trigram</h2><p>As the lower trigram, ${esc(item.name)} describes the inner or initiating three lines of a hexagram. As the upper trigram, it forms the outer or completing three lines. The meaning of a full hexagram comes from the complete six-line figure and textual tradition, not from simply adding two trigram keywords together.</p></section><section><h2>Hexagrams containing ${esc(item.name)}</h2><div class="iching-hex-grid iching-related-grid">${related.map(hexCard).join("")}</div></section><div class="advanced-iching-detail-actions"><a class="btn-gold" href="/iching">Cast the I Ching</a><a class="btn-ghost" href="/iching/trigrams">All Eight Trigrams</a></div></article></main>`;
  const canonical = `${HOST}/iching/trigrams/${item.slug}`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "Article", headline: `${item.name} Trigram (${item.chinese} ${item.pinyin})`, description, mainEntityOfPage: canonical, about: ["I Ching", "Bagua", item.name, item.quality] }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "I Ching", item: `${HOST}/iching` }, { "@type": "ListItem", position: 3, name: "Eight Trigrams", item: `${HOST}/iching/trigrams` }, { "@type": "ListItem", position: 4, name: item.name, item: canonical }] }];
  return new Response(layout({ title, description, canonical, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderCoinMethodPage(): Response {
  const title = "I Ching Three-Coin Method — 6, 7, 8 & 9 Explained | Oracle Mirror";
  const description = "Learn the I Ching three-coin casting method: six throws from bottom to top, line values 6–9, changing yin and yang lines, and transformed hexagrams.";
  const body = `<main class="advanced-iching-main"><nav class="advanced-iching-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/iching">I Ching</a><span>›</span><span>Three-Coin Method</span></nav><article class="advanced-iching-article"><header><p class="advanced-iching-kicker">Casting guide</p><h1>The I Ching Three-Coin Method</h1><p class="advanced-iching-answer-first">Throw three coins six times and build the hexagram from the bottom line upward. Give one coin face a value of 2 and the other 3; each throw therefore totals 6, 7, 8, or 9.</p></header><div class="iching-value-grid"><article><strong>6</strong><h2>Old Yin</h2><p>Broken yin line that changes to yang.</p></article><article><strong>7</strong><h2>Young Yang</h2><p>Solid yang line that remains stable.</p></article><article><strong>8</strong><h2>Young Yin</h2><p>Broken yin line that remains stable.</p></article><article><strong>9</strong><h2>Old Yang</h2><p>Solid yang line that changes to yin.</p></article></div><section><h2>Why changing lines matter</h2><p>The first six-line figure is the primary hexagram. Any 6 or 9 is treated as moving: flipping those lines creates a transformed hexagram. Oracle Mirror shows both figures and the positions of all moving lines, while leaving detailed classical line-text study to dedicated translations and commentaries.</p></section><section><h2>Coins are not the earliest attested method</h2><p>The three-coin method became a convenient later technique and does not have the same outcome probabilities as the older yarrow-stalk procedure. Oracle Mirror uses coins because the method is transparent and easy to reproduce in a browser, while keeping that historical distinction visible.</p></section><div class="advanced-iching-detail-actions"><a class="btn-gold" href="/iching">Try the Three-Coin Cast</a><a class="btn-ghost" href="/iching/hexagrams">Explore the 64 Hexagrams</a></div></article></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "Article", headline: "I Ching Three-Coin Method — 6, 7, 8 and 9 Explained", description, mainEntityOfPage: `${HOST}/iching/coin-method`, about: ["I Ching", "three-coin method", "changing lines", "hexagrams"] }];
  return new Response(layout({ title, description, canonical: `${HOST}/iching/coin-method`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function handleAdvancedIChingRoute(pathname: string): Response {
  if (pathname === "/iching" || pathname === "/iching/") return renderAdvancedIChingPage();
  if (pathname === "/iching/hexagrams" || pathname === "/iching/hexagrams/") return renderHexagramHub();
  if (pathname === "/iching/trigrams" || pathname === "/iching/trigrams/") return renderTrigramHub();
  if (pathname === "/iching/coin-method" || pathname === "/iching/coin-method/") return renderCoinMethodPage();
  const hexMatch = pathname.match(/^\/iching\/hexagrams\/((?:[1-9]|[1-5][0-9]|6[0-4])(?:-[a-z0-9-]+)?)\/?$/);
  if (hexMatch) {
    const token = hexMatch[1];
    const number = Number(token.split("-")[0]);
    const item = token.includes("-") ? hexagramBySlug(token) : hexagram(number);
    if (!item) return new Response("Hexagram not found", { status: 404 });
    if (!token.includes("-")) return new Response(null, { status: 301, headers: { Location: hexagramPath(item) } });
    return renderHexagramPage(item);
  }
  const trigramMatch = pathname.match(/^\/iching\/trigrams\/([a-z]+)\/?$/);
  if (trigramMatch) {
    const item = trigram(trigramMatch[1]);
    return item ? renderTrigramPage(item) : new Response("Trigram not found", { status: 404 });
  }
  return new Response("Not found", { status: 404 });
}
