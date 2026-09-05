import { CORE_NUMBER_GUIDES, NUMEROLOGY_NUMBERS, coreNumberGuide, numerologyNumber } from "./numerology-data.ts";

const HOST = "https://oraclemirror.com";
const LASTMOD = "2026-09-05";

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function layout(options: { title: string; description: string; canonical: string; body: string; jsonLd?: unknown[]; client?: boolean }): string {
  const scripts = (options.jsonLd || []).map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(options.title)}</title><meta name="description" content="${esc(options.description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${esc(options.canonical)}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="theme-color" content="#08040f"><meta property="og:type" content="website"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="${esc(options.title)}"><meta property="og:description" content="${esc(options.description)}"><meta property="og:url" content="${esc(options.canonical)}"><meta property="og:image" content="${HOST}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/advanced-numerology.css">${scripts}</head><body class="advanced-numerology-body"><header class="advanced-numerology-header"><nav class="advanced-numerology-nav" aria-label="Numerology navigation"><a class="advanced-numerology-brand" href="/">☼ Oracle Mirror</a><div><a href="/numerology">Classic Numerology</a><a href="/numerology/advanced">Profile Calculator</a><a href="/numerology/numbers">Number Meanings</a><a href="/numerology/core-numbers">Core Numbers</a></div></nav></header>${options.body}<footer class="advanced-numerology-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>Numerology is a symbolic entertainment and reflection system, not a scientific personality test or factual prediction.</p></footer></body></html>`;
}

function numberCard(value: number): string {
  const item = numerologyNumber(value)!;
  return `<a class="numerology-number-card${item.master ? " master" : ""}" href="/numerology/numbers/${item.value}"><span class="numerology-number-value">${item.value}</span><span><strong>${esc(item.name)}</strong><small>${esc(item.keywords.join(" · "))}</small></span></a>`;
}

function clientNumberData(): string {
  return safeJson(NUMEROLOGY_NUMBERS.map((item) => ({ value: item.value, name: item.name, keywords: item.keywords, core: item.core, master: Boolean(item.master) })));
}

export function isAdvancedNumerologyRoute(pathname: string): boolean {
  return pathname === "/numerology/advanced" || pathname === "/numerology/advanced/" || pathname === "/numerology/numbers" || pathname === "/numerology/numbers/" || /^\/numerology\/numbers\/(?:[1-9]|11|22|33)\/?$/.test(pathname) || pathname === "/numerology/core-numbers" || pathname === "/numerology/core-numbers/" || /^\/numerology\/core-numbers\/[a-z0-9-]+\/?$/.test(pathname);
}

export function advancedNumerologySitemapUrls(): string[] {
  return [
    "/numerology/advanced",
    "/numerology/numbers",
    ...NUMEROLOGY_NUMBERS.map((item) => `/numerology/numbers/${item.value}`),
    "/numerology/core-numbers",
    ...CORE_NUMBER_GUIDES.map((guide) => `/numerology/core-numbers/${guide.slug}`),
  ];
}

export function augmentSitemapWithAdvancedNumerology(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`${HOST}/numerology/advanced</loc>`)) return xml;
  const additions = advancedNumerologySitemapUrls().map((path) => `  <url><loc>${HOST}${path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${path === "/numerology/advanced" ? "monthly" : "yearly"}</changefreq><priority>${path === "/numerology/advanced" ? "0.8" : "0.55"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${additions}\n</urlset>`);
}

export function augmentLlmsWithAdvancedNumerology(text: string): string {
  if (text.includes("## Advanced Numerology")) return text;
  return `${text.trimEnd()}\n\n## Advanced Numerology\n- ${HOST}/numerology/advanced — local six-number numerology profile calculator; name and birth date stay in the browser.\n- ${HOST}/numerology/numbers — meanings for 1–9 and master numbers 11, 22, and 33.\n- ${HOST}/numerology/core-numbers — guides to Life Path, Expression, Soul Urge, Personality, Birthday, and Personal Year numbers.\n- Oracle Mirror describes the familiar A–Z 1–9 chart as modern Pythagorean numerology rather than claiming Pythagoras authored this exact system.\n`;
}

export function injectAdvancedNumerologyDiscovery(html: string): string {
  if (!html || html.includes('href="/numerology/advanced"')) return html;
  let next = html;
  const classic = '<a href="/numerology" class="dropdown-item" data-nav="numerology">';
  if (next.includes(classic)) {
    next = next.replace(/(<a href="\/numerology" class="dropdown-item" data-nav="numerology"[^>]*>.*?<\/a>)/, '$1\n              <a href="/numerology/advanced" class="dropdown-item">◇ Advanced Numerology</a>');
  }
  next = next.replace("rune casting, Lenormand, and AI Soulmate Vision", "rune casting, Lenormand, advanced numerology, and AI Soulmate Vision");
  return next;
}

export function renderAdvancedNumerologyPage(): Response {
  const title = "Free Advanced Numerology Calculator — 6 Core Numbers | Oracle Mirror";
  const description = "Calculate Life Path, Expression, Soul Urge, Personality, Birthday, and Personal Year numbers locally in your browser, including master numbers 11, 22, and 33.";
  const body = `<main class="advanced-numerology-main"><section class="advanced-numerology-hero"><p class="advanced-numerology-kicker">Six-number profile · local calculation</p><div class="advanced-numerology-glyph" aria-hidden="true">1 · 2 · 3 · 11 · 22 · 33</div><h1>Advanced Numerology Profile</h1><p>Build a six-number profile from your name and date of birth. The calculation happens entirely in this browser: your name and birth date are not posted to Oracle Mirror.</p></section><section class="advanced-numerology-calculator" aria-labelledby="advanced-numerology-form-title"><div><p class="advanced-numerology-kicker">Private by design</p><h2 id="advanced-numerology-form-title">Calculate Your Profile</h2><p>Use the full name you want this reading to analyze. Modern numerology traditions vary on naming conventions, so consistency matters more than pretending there is one historically mandatory form.</p></div><form data-numerology-form><label>Full name<input type="text" name="name" autocomplete="name" minlength="2" maxlength="120" required></label><label>Date of birth<input type="date" name="birthDate" required></label><button class="btn-gold" type="submit">Calculate Six Numbers</button></form><p class="advanced-numerology-private-note">Your inputs remain in this page. They are not sent to a feature API and are not included in the share card.</p><div class="advanced-numerology-results" data-numerology-results aria-live="polite"></div><div class="advanced-numerology-actions" data-numerology-actions hidden><button class="btn-ghost" type="button" data-numerology-share>Share Derived Numbers</button><button class="btn-ghost" type="button" data-numerology-reset>Clear Profile</button></div></section><section class="advanced-numerology-guide"><p class="advanced-numerology-kicker">What is calculated</p><h2>Six Core Numbers</h2><div class="advanced-numerology-guide-grid">${CORE_NUMBER_GUIDES.map((guide) => `<a href="/numerology/core-numbers/${guide.slug}"><strong>${esc(guide.name)}</strong><span>${esc(guide.source)}</span><p>${esc(guide.meaning)}</p></a>`).join("")}</div></section><section class="advanced-numerology-number-strip"><h2>Number meanings</h2><div class="numerology-number-grid">${NUMEROLOGY_NUMBERS.map((item) => numberCard(item.value)).join("")}</div></section><section class="advanced-numerology-history"><h2>Why Oracle Mirror calls this “modern Pythagorean numerology”</h2><p>Pythagorean philosophy genuinely gave number an unusually important place in accounts of reality and harmony. The familiar modern numerology chart that cycles Latin letters through values 1–9, however, is not documented as a method authored by Pythagoras himself. Oracle Mirror uses the conventional modern label while keeping that distinction explicit.</p><p>Different numerology schools also disagree about details such as Y, compound numbers, and when master numbers should be preserved. This calculator uses one transparent rule set: A–Z repeats 1–9, Y is treated as a consonant, and 11, 22, and 33 are preserved when they occur as the final reduction.</p></section><script id="advanced-numerology-number-data" type="application/json">${clientNumberData()}</script><script type="module" src="/advanced-numerology.js"></script></main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Mirror Advanced Numerology Calculator", url: `${HOST}/numerology/advanced`, applicationCategory: "EntertainmentApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description },
    { "@context": "https://schema.org", "@type": "ItemList", name: "Six core numerology calculations", numberOfItems: CORE_NUMBER_GUIDES.length, itemListElement: CORE_NUMBER_GUIDES.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.name, url: `${HOST}/numerology/core-numbers/${guide.slug}` })) },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/numerology/advanced`, body, jsonLd, client: true }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=300" } });
}

export function renderNumerologyNumbersHub(): Response {
  const title = "Numerology Number Meanings 1–9, 11, 22 & 33 | Oracle Mirror";
  const description = "Explore modern numerology meanings for numbers 1 through 9 and master numbers 11, 22, and 33, with strengths, challenges, love, work, and reflection prompts.";
  const body = `<main class="advanced-numerology-main"><nav class="advanced-numerology-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><span>Numerology Numbers</span></nav><section class="advanced-numerology-hero"><p class="advanced-numerology-kicker">Meaning library</p><h1>Numerology Number Meanings</h1><p>Browse the core symbolic themes assigned to 1–9 and the modern master numbers 11, 22, and 33. These are interpretive traditions, not scientifically validated personality categories.</p></section><div class="numerology-number-grid numerology-number-library">${NUMEROLOGY_NUMBERS.map((item) => numberCard(item.value)).join("")}</div><div class="advanced-numerology-detail-actions"><a class="btn-gold" href="/numerology/advanced">Calculate My Profile</a><a class="btn-ghost" href="/numerology/core-numbers">Learn the Six Core Numbers</a></div></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "ItemList", name: "Numerology number meanings", numberOfItems: NUMEROLOGY_NUMBERS.length, itemListElement: NUMEROLOGY_NUMBERS.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: `Number ${item.value}: ${item.name}`, url: `${HOST}/numerology/numbers/${item.value}` })) }];
  return new Response(layout({ title, description, canonical: `${HOST}/numerology/numbers`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderNumerologyNumberPage(value: number): Response {
  const item = numerologyNumber(value);
  if (!item) return new Response("Numerology number not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
  const title = `Numerology Number ${item.value} Meaning — ${item.name} | Oracle Mirror`;
  const description = `Numerology ${item.value} meaning: ${item.keywords.join(", ")}. Explore strengths, challenges, love, work, and a reflection prompt${item.master ? " for this modern master number" : ""}.`;
  const body = `<main class="advanced-numerology-main"><nav class="advanced-numerology-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/numerology/numbers">Numbers</a><span>›</span><span>${item.value}</span></nav><article class="advanced-numerology-article"><header class="advanced-numerology-number-hero"><p class="advanced-numerology-kicker">${item.master ? "Master number" : "Core number"}</p><div class="advanced-numerology-big-number">${item.value}</div><h1>Numerology Number ${item.value}: ${esc(item.name)}</h1><div class="advanced-numerology-keywords">${item.keywords.map((keyword) => `<span>${esc(keyword)}</span>`).join("")}</div><p class="advanced-numerology-answer-first">${esc(item.core)}</p></header><section><h2>Strength of ${item.value}</h2><p>${esc(item.strength)}</p></section><section><h2>Challenge of ${item.value}</h2><p>${esc(item.challenge)}</p></section><div class="advanced-numerology-meaning-grid"><section><h2>Number ${item.value} in love</h2><p>${esc(item.love)}</p></section><section><h2>Number ${item.value} in work and money</h2><p>${esc(item.work)}</p></section></div><section class="advanced-numerology-reflection"><h2>Reflection question</h2><p>${esc(item.reflection)}</p></section>${item.master ? `<section><h2>About master number ${item.value}</h2><p>Oracle Mirror preserves ${item.value} when it appears as a final reduction because 11, 22, and 33 are commonly treated as master numbers in modern Western numerology. That convention is part of the modern interpretive system, not an established scientific or ancient Pythagorean rule.</p></section>` : ""}<div class="advanced-numerology-detail-actions"><a class="btn-gold" href="/numerology/advanced">Calculate My Profile</a><a class="btn-ghost" href="/numerology/numbers">All Number Meanings</a></div></article></main>`;
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Article", headline: `Numerology Number ${item.value} Meaning — ${item.name}`, description, mainEntityOfPage: `${HOST}/numerology/numbers/${item.value}`, isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST }, about: ["Numerology", `Number ${item.value}`, ...item.keywords] },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "Numerology Numbers", item: `${HOST}/numerology/numbers` }, { "@type": "ListItem", position: 3, name: `Number ${item.value}`, item: `${HOST}/numerology/numbers/${item.value}` }] },
  ];
  return new Response(layout({ title, description, canonical: `${HOST}/numerology/numbers/${item.value}`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderCoreNumbersHub(): Response {
  const title = "Six Core Numerology Numbers Explained | Oracle Mirror";
  const description = "Learn how Life Path, Expression, Soul Urge, Personality, Birthday, and Personal Year numbers are calculated and interpreted in modern numerology.";
  const body = `<main class="advanced-numerology-main"><nav class="advanced-numerology-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><span>Core Numbers</span></nav><section class="advanced-numerology-hero"><p class="advanced-numerology-kicker">Calculation guide</p><h1>The Six Core Numerology Numbers</h1><p>A numerology profile is more useful when each number has a clearly defined source. These six guides show exactly what Oracle Mirror calculates and which input contributes to each result.</p></section><div class="advanced-numerology-guide-grid advanced-numerology-guide-library">${CORE_NUMBER_GUIDES.map((guide) => `<a href="/numerology/core-numbers/${guide.slug}"><strong>${esc(guide.name)}</strong><span>${esc(guide.source)}</span><p>${esc(guide.meaning)}</p></a>`).join("")}</div><div class="advanced-numerology-detail-actions"><a class="btn-gold" href="/numerology/advanced">Calculate All Six</a><a class="btn-ghost" href="/numerology/numbers">Browse Number Meanings</a></div></main>`;
  return new Response(layout({ title, description, canonical: `${HOST}/numerology/core-numbers`, body, jsonLd: [{ "@context": "https://schema.org", "@type": "ItemList", name: "Six core numerology numbers", numberOfItems: 6, itemListElement: CORE_NUMBER_GUIDES.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.name, url: `${HOST}/numerology/core-numbers/${guide.slug}` })) }] }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function renderCoreNumberPage(slug: string): Response {
  const guide = coreNumberGuide(slug);
  if (!guide) return new Response("Core numerology guide not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
  const title = `${guide.name} — Meaning & How to Calculate | Oracle Mirror`;
  const description = `${guide.name}: what it represents in modern numerology, what input it uses, and the transparent calculation method used by Oracle Mirror.`;
  const body = `<main class="advanced-numerology-main"><nav class="advanced-numerology-breadcrumb"><a href="/">Oracle Mirror</a><span>›</span><a href="/numerology/core-numbers">Core Numbers</a><span>›</span><span>${esc(guide.shortName)}</span></nav><article class="advanced-numerology-article"><header><p class="advanced-numerology-kicker">${esc(guide.source)}</p><h1>${esc(guide.name)}</h1><p class="advanced-numerology-answer-first">${esc(guide.meaning)}</p></header><section><h2>How Oracle Mirror calculates the ${esc(guide.shortName)}</h2><p>${esc(guide.method)}</p></section><section><h2>How to use this number</h2><p>Treat the result as a structured reflection prompt rather than a diagnosis or prediction. Compare the theme with lived experience, notice where it fits and where it does not, and avoid making high-stakes decisions solely because a numerology number appears to favor one direction.</p></section><section><h2>Master numbers and reduction</h2><p>Oracle Mirror reduces totals by repeatedly adding their digits, while preserving 11, 22, and 33 when one of those values appears as the final unreduced total. This is a conventional modern numerology choice and is kept explicit so the calculation can be reproduced.</p></section><div class="advanced-numerology-detail-actions"><a class="btn-gold" href="/numerology/advanced">Calculate My Profile</a><a class="btn-ghost" href="/numerology/core-numbers">All Six Core Numbers</a></div></article></main>`;
  const jsonLd = [{ "@context": "https://schema.org", "@type": "Article", headline: guide.name, description, mainEntityOfPage: `${HOST}/numerology/core-numbers/${guide.slug}`, about: ["Numerology", guide.name] }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Oracle Mirror", item: HOST }, { "@type": "ListItem", position: 2, name: "Core Numerology Numbers", item: `${HOST}/numerology/core-numbers` }, { "@type": "ListItem", position: 3, name: guide.name, item: `${HOST}/numerology/core-numbers/${guide.slug}` }] }];
  return new Response(layout({ title, description, canonical: `${HOST}/numerology/core-numbers/${guide.slug}`, body, jsonLd }), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function handleAdvancedNumerologyRoute(pathname: string): Response {
  const clean = pathname.replace(/\/$/, "");
  if (clean === "/numerology/advanced") return renderAdvancedNumerologyPage();
  if (clean === "/numerology/numbers") return renderNumerologyNumbersHub();
  if (clean === "/numerology/core-numbers") return renderCoreNumbersHub();
  const numberMatch = /^\/numerology\/numbers\/(\d+)$/.exec(clean);
  if (numberMatch) return renderNumerologyNumberPage(Number(numberMatch[1]));
  const guideMatch = /^\/numerology\/core-numbers\/([a-z0-9-]+)$/.exec(clean);
  if (guideMatch) return renderCoreNumberPage(guideMatch[1]);
  return new Response("Numerology page not found", { status: 404, headers: { "Content-Type": "text/plain; charset=UTF-8" } });
}
