import { CRYSTALS, DIVINATION_GUIDES, PENDULUM_GUIDES, SCRYING_METHODS, TEA_SYMBOLS, WAX_SYMBOLS } from "./divination-data.ts";

const BASE = "https://oraclemirror.com";
const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

type Entry = { slug: string; name: string; theme: string; note?: string; colour?: string };

function articleSchema(title: string, description: string, path: string) {
  return { "@context": "https://schema.org", "@type": "Article", headline: title, description, mainEntityOfPage: `${BASE}${path}`, isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: BASE } };
}

function breadcrumb(items: Array<{ name: string; path: string }>) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ name: "Oracle Mirror", path: "/" }, ...items].map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${BASE}${item.path}` })) };
}

function layout(title: string, description: string, path: string, body: string, schema: unknown[] = []) {
  const canonical = `${BASE}${path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="theme-color" content="#07050d"><meta property="og:type" content="website"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${BASE}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/divination.css">${schema.map((item) => `<script type="application/ld+json">${json(item)}</script>`).join("")}</head><body class="divination-body"><header class="divination-header"><nav class="divination-nav" aria-label="Divination library navigation"><a class="divination-brand" href="/">✦ Oracle Mirror</a><div><a href="/divination">Library</a><a href="/divination/crystals">Crystals</a><a href="/divination/pendulum">Pendulum</a><a href="/divination/scrying">Scrying</a><a href="/divination/tea-leaves">Tea Leaves</a><a href="/divination/candle-wax">Candle & Wax</a></div></nav></header><main class="divination-main">${body}</main><footer class="divination-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>These guides document symbolic and divinatory traditions for reflection and entertainment. They do not establish supernatural causation, medical effects, or guaranteed predictions.</p></footer></body></html>`;
}

function cards(items: readonly Entry[], base: string, kind: string) {
  return `<div class="divination-grid">${items.map((item) => `<a class="divination-card" href="${base}/${item.slug}"><span class="divination-glyph" aria-hidden="true">${kind === "crystal" ? "◇" : kind === "tea" ? "☕" : kind === "wax" ? "🕯" : kind === "scry" ? "◉" : kind === "guide" ? "✦" : "⌁"}</span><h2>${esc(item.name)}</h2><p>${esc(item.theme)}</p></a>`).join("")}</div>`;
}

function collection(title: string, description: string, path: string, intro: string, items: readonly Entry[], kind: string, note: string) {
  return layout(`${title} | Oracle Mirror`, description, path, `<section class="divination-hero"><span class="divination-kicker">Oracle Mirror Reference Library</span><h1>${title}</h1><p>${intro}</p></section>${cards(items, path, kind)}<section class="divination-note"><h2>How to use this library</h2><p>${note}</p></section>`, [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: title, url: `${BASE}${path}`, description },
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: `${BASE}${path}/${item.slug}` })) },
  ]);
}

function crystalDetail(entry: Entry) {
  const path = `/divination/crystals/${entry.slug}`;
  const title = `${entry.name} Crystal Meaning & Symbolism | Oracle Mirror`;
  const description = `Explore ${entry.name} symbolism, reflective uses, colour associations and grounded limits without medical or supernatural claims.`;
  return layout(title, description, path, `<nav class="divination-crumb"><a href="/divination">Divination</a><span>›</span><a href="/divination/crystals">Crystals</a><span>›</span><span>${esc(entry.name)}</span></nav><article class="divination-article"><header><span class="divination-orb" aria-hidden="true">◇</span><p class="divination-kicker">Crystal Symbolism</p><h1>${esc(entry.name)}</h1><p class="divination-answer">In modern crystal spirituality, ${esc(entry.name)} is commonly used as a symbol for ${esc(entry.theme)}.</p></header><section><h2>Symbolic association</h2><p>The colour and visual character of ${esc(entry.name)}—often described here as ${esc(entry.colour || "distinctive")}—can make it a useful physical cue for reflection. Oracle Mirror treats that association as ritual language rather than a measurable force.</p></section><section><h2>Reflection prompt</h2><p>If ${esc(entry.theme)} is the theme you want to explore, hold or look at the stone and ask: <em>what concrete choice, boundary, conversation, or habit would express this quality in ordinary life?</em></p></section><section class="divination-caveat"><h2>What not to claim</h2><p>Crystals are not presented here as treatments, diagnostic tools, protective technology, or substitutes for medical or mental-health care. A symbolic association can be personally meaningful without proving healing energy or supernatural effects.</p></section><div class="divination-actions"><a class="btn-gold" href="/crystal-ball">Try the Crystal Ball</a><a class="btn-ghost" href="/divination/crystals">Browse Crystals</a></div></article>`, [articleSchema(title, description, path), breadcrumb([{ name: "Divination", path: "/divination" }, { name: "Crystals", path: "/divination/crystals" }, { name: entry.name, path }])]);
}

function teaDetail(entry: Entry) {
  const path = `/divination/tea-leaves/${entry.slug}`;
  const title = `${entry.name} in Tea Leaf Reading — Symbol Meaning | Oracle Mirror`;
  const description = `What can an ${entry.name} shape suggest in tea leaf reading? Explore traditional-style symbolism and personal reflection without literal prediction claims.`;
  return layout(title, description, path, `<nav class="divination-crumb"><a href="/divination">Divination</a><span>›</span><a href="/divination/tea-leaves">Tea Leaves</a><span>›</span><span>${esc(entry.name)}</span></nav><article class="divination-article"><header><span class="divination-orb" aria-hidden="true">☕</span><p class="divination-kicker">Tea Leaf Symbol</p><h1>${esc(entry.name)}</h1><p class="divination-answer">In a reflective tea-leaf reading, an ${esc(entry.name)}-like shape can invite themes of ${esc(entry.theme)}.</p></header><section><h2>Traditional-style reading</h2><p>Tasseography-style reading works by noticing suggestive shapes among leaves and stains, then combining the image with the reader's associations and the question being explored. The same shape can mean different things to different people.</p></section><section><h2>Ask before assigning a meaning</h2><p>What did the ${esc(entry.name)} remind you of immediately? Was the image clear or ambiguous, near the rim or deeper in the cup, isolated or surrounded by other forms? Those observations are more useful for reflection than pretending the symbol has one universal code.</p></section><section class="divination-caveat"><h2>Pattern, not proof</h2><p>Humans naturally perceive familiar forms in ambiguous visual material. Oracle Mirror uses that pattern recognition creatively; it does not treat tea leaves as evidence of future events, hidden crimes, illness, pregnancy, or another person's private intentions.</p></section><div class="divination-actions"><a class="btn-gold" href="/divination/guides/pareidolia">Learn About Pattern Recognition</a><a class="btn-ghost" href="/divination/tea-leaves">Tea Symbol Library</a></div></article>`, [articleSchema(title, description, path), breadcrumb([{ name: "Divination", path: "/divination" }, { name: "Tea Leaves", path: "/divination/tea-leaves" }, { name: entry.name, path }])]);
}

function waxDetail(entry: Entry) {
  const path = `/divination/candle-wax/${entry.slug}`;
  const title = `${entry.name} Candle Wax Meaning — Wax Reading Symbol | Oracle Mirror`;
  const description = `Explore ${entry.name} symbolism in candle-wax reading with grounded interpretation, fire safety and no deterministic omen claims.`;
  return layout(title, description, path, `<nav class="divination-crumb"><a href="/divination">Divination</a><span>›</span><a href="/divination/candle-wax">Candle & Wax</a><span>›</span><span>${esc(entry.name)}</span></nav><article class="divination-article"><header><span class="divination-orb" aria-hidden="true">🕯</span><p class="divination-kicker">Wax Reading Symbol</p><h1>${esc(entry.name)}</h1><p class="divination-answer">A wax form resembling ${esc(entry.name)} can be used as a prompt around ${esc(entry.theme)}.</p></header><section><h2>Read the shape as metaphor</h2><p>Cooling wax forms irregular shapes because of heat, gravity, surface angle, wax composition and chance. A symbolic reading begins after the shape appears: notice what it resembles and what that image brings to mind for you.</p></section><section><h2>Reflection prompt</h2><p>If this ${esc(entry.name)} shape represented one part of your current situation, what would it describe: a feeling, an obstacle, a relationship dynamic, or a next step? Use the answer to generate questions, not certainty.</p></section><section class="divination-caveat"><h2>Fire safety before symbolism</h2><p>Never leave candles unattended, keep flames away from children, pets and flammable material, and use a stable heat-safe surface. Flame, soot and wax behaviour are not medical tests, danger detectors, or reliable forecasts.</p></section><div class="divination-actions"><a class="btn-gold" href="/divination/scrying/flame-gazing">Explore Flame Gazing</a><a class="btn-ghost" href="/divination/candle-wax">Wax Symbol Library</a></div></article>`, [articleSchema(title, description, path), breadcrumb([{ name: "Divination", path: "/divination" }, { name: "Candle & Wax", path: "/divination/candle-wax" }, { name: entry.name, path }])]);
}

function methodDetail(entry: Entry, section: "Scrying" | "Pendulum", base: string) {
  const path = `${base}/${entry.slug}`;
  const title = `${entry.name} Guide | Oracle Mirror`;
  const description = `Learn ${entry.name.toLowerCase()} as a reflective divination practice, with clear limits, practical safety and no guaranteed prediction claims.`;
  const isPendulum = section === "Pendulum";
  return layout(title, description, path, `<nav class="divination-crumb"><a href="/divination">Divination</a><span>›</span><a href="${base}">${section}</a><span>›</span><span>${esc(entry.name)}</span></nav><article class="divination-article"><header><span class="divination-orb" aria-hidden="true">${isPendulum ? "⌁" : "◉"}</span><p class="divination-kicker">${section} Guide</p><h1>${esc(entry.name)}</h1><p class="divination-answer">${esc(entry.name)} is presented here as ${esc(entry.theme)}.</p></header><section><h2>A grounded way to practise</h2><p>${esc(entry.note || "Use the method as a structured attention exercise and record your own associations rather than assuming an external message.")}</p></section>${isPendulum ? `<section><h2>Why the pendulum moves</h2><p>Pendulum motion can be influenced by tiny involuntary muscle movements, often discussed as the ideomotor effect. That makes the tool especially interesting as a way to notice expectation and reaction, but not as an independent source of factual knowledge.</p></section>` : `<section><h2>What you are actually observing</h2><p>Scrying uses ambiguous visual material—reflections, clouds, smoke, flame or a dark surface—to encourage imagery and free association. Perceiving meaningful forms in ambiguity is normal human pattern recognition, not proof that the form came from an outside intelligence.</p></section>`}<section class="divination-caveat"><h2>Keep high-stakes decisions outside the ritual</h2><p>Do not use this method to diagnose health conditions, identify criminals, determine whether someone is lying, predict death or disaster, or replace medical, legal, financial, safety, or mental-health expertise.</p></section><div class="divination-actions">${isPendulum ? `<a class="btn-gold" href="/#interactive-oracles">Try the Mirror Lab Pendulum</a>` : `<a class="btn-gold" href="/crystal-ball">Try Oracle Mirror's Crystal Ball</a>`}<a class="btn-ghost" href="${base}">Back to ${section}</a></div></article>`, [articleSchema(title, description, path), breadcrumb([{ name: "Divination", path: "/divination" }, { name: section, path: base }, { name: entry.name, path }])]);
}

function generalGuide(entry: Entry) {
  const path = `/divination/guides/${entry.slug}`;
  const title = `${entry.name} — Divination Reference Guide | Oracle Mirror`;
  const description = `A grounded guide to ${entry.theme}, separating symbolic tradition from scientific, medical and predictive claims.`;
  return layout(title, description, path, `<nav class="divination-crumb"><a href="/divination">Divination</a><span>›</span><a href="/divination/guides">Guides</a><span>›</span><span>${esc(entry.name)}</span></nav><article class="divination-article"><header><span class="divination-orb" aria-hidden="true">✦</span><p class="divination-kicker">Grounded Divination</p><h1>${esc(entry.name)}</h1><p class="divination-answer">This guide focuses on ${esc(entry.theme)}.</p></header><section><h2>The useful distinction</h2><p>${esc(entry.note || "Use symbolic systems as reflective language rather than as proof of supernatural causation or guaranteed prediction.")}</p></section><section><h2>A practical rule</h2><p>Separate three layers: what you directly observed, what the tradition says it can symbolize, and what the image personally evokes for you. Keeping those layers distinct reduces overclaiming while preserving the imaginative value of the ritual.</p></section><section class="divination-caveat"><h2>Agency stays with the reader</h2><p>A reading should widen reflection, not coerce a decision. Frightening certainty, medical diagnosis, accusations, fatalistic predictions and claims of guaranteed spiritual protection are outside Oracle Mirror's reference standard.</p></section><div class="divination-actions"><a class="btn-gold" href="/divination">Divination Library</a><a class="btn-ghost" href="/divination/guides">All Grounding Guides</a></div></article>`, [articleSchema(title, description, path), breadcrumb([{ name: "Divination", path: "/divination" }, { name: "Guides", path: "/divination/guides" }, { name: entry.name, path }])]);
}

function hub() {
  const title = "Divination Library — Crystals, Pendulum, Scrying, Tea Leaves & Wax | Oracle Mirror";
  const description = "Explore 100+ grounded divination reference pages covering crystal symbolism, pendulum reflection, scrying, tea-leaf symbols, candle wax and pattern recognition.";
  const groups = [
    ["Crystal Symbolism", "/divination/crystals", "36 popular stones with reflective associations and explicit health-claim limits.", "◇"],
    ["Pendulum Guide", "/divination/pendulum", "How pendulum reflection works, including the ideomotor effect and better-question ethics.", "⌁"],
    ["Scrying Methods", "/divination/scrying", "Crystal ball, black mirror, water, flame, smoke and cloud-gazing methods.", "◉"],
    ["Tea Leaf Symbols", "/divination/tea-leaves", "40 common shapes interpreted as flexible metaphors rather than fixed forecasts.", "☕"],
    ["Candle & Wax Symbols", "/divination/candle-wax", "24 wax shapes with fire-safety-first reflective meanings.", "🕯"],
    ["Grounded Guides", "/divination/guides", "Pattern recognition, journaling, ritual safety, history and tradition-versus-evidence.", "✦"],
  ];
  return layout(title, description, "/divination", `<section class="divination-hero"><span class="divination-kicker">Oracle Mirror Reference Library</span><h1>Divination, Without Pretending Certainty</h1><p>Symbolic practices can be atmospheric, culturally interesting and useful for reflection without being treated as science. This library connects Oracle Mirror's playful experiences to deeper guides that distinguish observation, tradition, personal association and evidence.</p><div class="divination-actions"><a class="btn-gold" href="/divination/guides/tradition-vs-evidence">Start With the Ground Rules</a><a class="btn-ghost" href="/#interactive-oracles">Visit the Mirror Lab</a></div></section><div class="divination-grid">${groups.map(([name, path, copy, glyph]) => `<a class="divination-card" href="${path}"><span class="divination-glyph" aria-hidden="true">${glyph}</span><h2>${name}</h2><p>${copy}</p></a>`).join("")}</div><section class="divination-note"><h2>Reflection is the product, certainty is not</h2><p>Oracle Mirror does not use crystal, tea, wax, pendulum or scrying imagery to diagnose health, prove supernatural attack, expose another person's private thoughts, or guarantee future events. The strongest use of these systems is to notice what an image makes you think and feel, then bring that insight back to ordinary choices.</p></section>`, [{ "@context": "https://schema.org", "@type": "CollectionPage", name: "Oracle Mirror Divination Library", url: `${BASE}/divination`, description }]);
}

export function divinationSitemapUrls(): string[] {
  return [
    "/divination",
    "/divination/crystals", ...CRYSTALS.map((item) => `/divination/crystals/${item.slug}`),
    "/divination/tea-leaves", ...TEA_SYMBOLS.map((item) => `/divination/tea-leaves/${item.slug}`),
    "/divination/candle-wax", ...WAX_SYMBOLS.map((item) => `/divination/candle-wax/${item.slug}`),
    "/divination/scrying", ...SCRYING_METHODS.map((item) => `/divination/scrying/${item.slug}`),
    "/divination/pendulum", ...PENDULUM_GUIDES.map((item) => `/divination/pendulum/${item.slug}`),
    "/divination/guides", ...DIVINATION_GUIDES.map((item) => `/divination/guides/${item.slug}`),
  ];
}

export function isDivinationRoute(path: string) { return path === "/divination" || path === "/divination/" || path.startsWith("/divination/"); }

export function handleDivinationRoute(path: string): Response {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  let html: string | null = null;
  if (normalized === "/divination") html = hub();
  else if (normalized === "/divination/crystals") html = collection("Crystal Meanings & Symbolism", "Explore 36 popular crystals as symbolic reflection tools, with modern spiritual associations clearly separated from medical or scientific claims.", normalized, "Crystal traditions often assign stones themes such as calm, confidence, boundaries or transition. Oracle Mirror presents those themes as symbolic prompts, not measurable healing properties.", CRYSTALS, "crystal", "Choose a stone because its appearance or traditional association gives you a useful theme to reflect on. Avoid claims that a crystal can diagnose, cure, detoxify, protect against objective danger, or replace professional care.");
  else if (normalized.startsWith("/divination/crystals/")) { const item = CRYSTALS.find((x) => x.slug === normalized.split("/").pop()); html = item ? crystalDetail(item) : null; }
  else if (normalized === "/divination/tea-leaves") html = collection("Tea Leaf Symbols & Meanings", "Browse 40 common tea-leaf reading shapes with flexible, reflection-first meanings and clear pattern-recognition framing.", normalized, "Tea-leaf reading turns accidental shapes into metaphors. The image matters, but so do placement, surrounding forms, emotion and the reader's personal associations.", TEA_SYMBOLS, "tea", "Use the entries as prompts, not a decoding key. If a shape looks like several things, write down the alternatives rather than forcing one interpretation.");
  else if (normalized.startsWith("/divination/tea-leaves/")) { const item = TEA_SYMBOLS.find((x) => x.slug === normalized.split("/").pop()); html = item ? teaDetail(item) : null; }
  else if (normalized === "/divination/candle-wax") html = collection("Candle Wax Symbols & Meanings", "Browse 24 candle-wax shapes as metaphorical reflection prompts with fire safety and non-predictive framing.", normalized, "Wax reading looks for suggestive forms after melted wax cools. Physical causes create the shape; symbolism is assigned afterward as an imaginative reflection exercise.", WAX_SYMBOLS, "wax", "Never sacrifice fire safety for ritual atmosphere. Keep wax readings away from flammable material and treat soot, flame height, dripping and shapes as physical events first, symbolic prompts second.");
  else if (normalized.startsWith("/divination/candle-wax/")) { const item = WAX_SYMBOLS.find((x) => x.slug === normalized.split("/").pop()); html = item ? waxDetail(item) : null; }
  else if (normalized === "/divination/scrying") html = collection("Scrying Methods", "A grounded guide to six scrying methods including crystal ball, black mirror, water, flame, smoke and cloud gazing.", normalized, "Scrying directs attention toward ambiguous visual material so memories, images and associations can emerge. Oracle Mirror treats the process as imagination-led reflection, not remote viewing or supernatural proof.", SCRYING_METHODS, "scry", "Keep sessions short, comfortable and physically safe. If a practice causes eye strain, dissociation, panic or distress, stop and return to ordinary surroundings.");
  else if (normalized.startsWith("/divination/scrying/")) { const item = SCRYING_METHODS.find((x) => x.slug === normalized.split("/").pop()); html = item ? methodDetail(item, "Scrying", "/divination/scrying") : null; }
  else if (normalized === "/divination/pendulum") html = collection("Pendulum Reflection Guide", "Learn pendulum reflection, yes-no-maybe patterns, the ideomotor effect and ethical limits without treating motion as factual prediction.", normalized, "A pendulum can feel surprisingly responsive. Tiny involuntary muscle movements can influence its swing, which makes it useful for noticing expectation and reaction but not for discovering hidden facts.", PENDULUM_GUIDES, "pendulum", "Define possible outcomes before asking, keep questions low-stakes, and pay attention to your emotional response to the result. That response is often more informative than the swing itself.");
  else if (normalized.startsWith("/divination/pendulum/")) { const item = PENDULUM_GUIDES.find((x) => x.slug === normalized.split("/").pop()); html = item ? methodDetail(item, "Pendulum", "/divination/pendulum") : null; }
  else if (normalized === "/divination/guides") html = collection("Grounded Divination Guides", "Learn pattern recognition, symbol journaling, ritual safety and the distinction between tradition and evidence.", normalized, "These guides explain how to preserve the imaginative value of divination while keeping claims proportional to the evidence.", DIVINATION_GUIDES, "guide", "A useful reading distinguishes observation, inherited symbolism, personal association and factual evidence instead of blending them into one claim.");
  else if (normalized.startsWith("/divination/guides/")) { const item = DIVINATION_GUIDES.find((x) => x.slug === normalized.split("/").pop()); html = item ? generalGuide(item) : null; }
  return html ? new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } }) : new Response("Not found", { status: 404 });
}

export function augmentSitemapWithDivination(xml: string) {
  if (xml.includes(`<loc>${BASE}/divination</loc>`)) return xml;
  const block = divinationSitemapUrls().map((path) => `  <url><loc>${BASE}${path}</loc><changefreq>monthly</changefreq><priority>${path === "/divination" ? "0.8" : "0.6"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${block}\n</urlset>`);
}

export function augmentLlmsWithDivination(text: string) {
  if (text.includes("## Divination Reference Library")) return text;
  return `${text.trimEnd()}\n\n## Divination Reference Library\n- ${BASE}/divination — grounded reference hub for crystal symbolism, pendulum reflection, scrying, tea-leaf symbols, candle/wax reading, pattern recognition and ritual safety.\n- ${BASE}/divination/crystals — 36 crystal symbolism guides that explicitly avoid medical and supernatural-effect claims.\n- ${BASE}/divination/tea-leaves — 40 tea-leaf symbol guides using flexible, personal-association-first interpretation.\n- ${BASE}/divination/candle-wax — 24 wax-symbol guides with fire-safety-first framing.\n- ${BASE}/divination/scrying — six scrying-method guides explaining pattern recognition and practical limits.\n- ${BASE}/divination/pendulum — pendulum practice, the ideomotor effect and ethical low-stakes use.\n`;
}

export function injectDivinationDiscovery(html: string) {
  if (html.includes('class="dropdown-item divination-library-link"')) return html;
  let next = html.replace(
    '<a href="/dreams" class="dropdown-item dream-library-link">📖 Dream Library</a>',
    '<a href="/dreams" class="dropdown-item dream-library-link">📖 Dream Library</a>\n              <a href="/divination" class="dropdown-item divination-library-link">✦ Divination Library</a>'
  );
  const crystalCard = '<a href="/crystal-ball" class="card card-crystal" data-realm="crystal-ball">';
  if (next.includes(crystalCard) && !next.includes('class="card card-divination-library"')) {
    next = next.replace(crystalCard, '<a href="/divination" class="card card-divination-library"><div class="card-frame"><div class="card-icon">✦</div><h3>Divination Library</h3><p class="card-desc">Crystals, pendulum, scrying, tea leaves and wax symbolism — grounded, indexable guides</p></div></a>\n          ' + crystalCard);
  }
  return next;
}
