import { ELDER_FUTHARK } from "./runes-data.ts";
import { LENORMAND_CARDS } from "./lenormand-data.ts";
import { TAROT_CARDS } from "./tarot-data.ts";
import { TAROT_SPREAD_GUIDES } from "./tarot-pages.ts";
import { NUMEROLOGY_NUMBERS, CORE_NUMBER_GUIDES } from "./numerology-data.ts";
import { HEXAGRAMS, TRIGRAMS } from "./iching-data.ts";
import { MOON_PHASES, PLANETS, RETROGRADE_PLANETS, ZODIAC_SIGNS } from "./astrology-data.ts";
import { HAND_SHAPES, PALM_DIGITS, PALM_GUIDES, PALM_LINES, PALM_MARKINGS, PALM_MOUNTS } from "./palmistry-data.ts";
import { DREAM_SYMBOLS, dreamThemes } from "./dream-library.ts";
import { dreamLibraryGuidePath } from "./dream-pages-v2.ts";
import { CRYSTALS, DIVINATION_GUIDES, PENDULUM_GUIDES, SCRYING_METHODS, TEA_SYMBOLS, WAX_SYMBOLS } from "./divination-data.ts";
import { KNOWLEDGE_TOPICS, topicsForPath } from "./knowledge-graph.ts";

const HOST = "https://oraclemirror.com";

export type ReferenceSearchEntry = {
  path: string;
  title: string;
  system: string;
  glyph: string;
  summary: string;
  keywords: string[];
  themes: string[];
};

let cachedIndex: ReferenceSearchEntry[] | null = null;

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[char] || char));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function themesFor(path: string, explicit: string[] = []): string[] {
  return unique([...explicit, ...topicsForPath(path, 10).map((topic) => topic.slug)]);
}

function add(
  entries: ReferenceSearchEntry[],
  data: Omit<ReferenceSearchEntry, "themes"> & { themes?: string[] },
): void {
  entries.push({ ...data, themes: themesFor(data.path, data.themes || []) });
}

function buildIndex(): ReferenceSearchEntry[] {
  const entries: ReferenceSearchEntry[] = [];

  add(entries, { path: "/runes", title: "Rune Casting & Elder Futhark Guide", system: "Runes", glyph: "ᚠ", summary: "Cast three Elder Futhark runes and explore all 24 rune meanings with grounded historical context.", keywords: ["runes", "elder futhark", "three rune cast", "norse", "symbols"] });
  for (const rune of ELDER_FUTHARK) add(entries, { path: `/runes/${rune.slug}`, title: `${rune.name} Rune Meaning`, system: "Runes", glyph: rune.glyph, summary: rune.core, keywords: [...rune.keywords, rune.sound, "elder futhark", "rune"] });

  add(entries, { path: "/lenormand", title: "Petit Lenormand Three-Card Reading", system: "Lenormand", glyph: "♣", summary: "Read three cards from the traditional 36-card Petit Lenormand sequence and explore concise card combinations.", keywords: ["lenormand", "36 cards", "card reading", "petit lenormand"] });
  for (const card of LENORMAND_CARDS) add(entries, { path: `/lenormand/${card.slug}`, title: `${card.name} Lenormand Card`, system: "Lenormand", glyph: card.symbol, summary: card.core, keywords: [...card.keywords, card.playingCard, card.polarity, "lenormand"] });

  add(entries, { path: "/tarot/advanced", title: "Advanced 78-Card Tarot Reader", system: "Tarot", glyph: "✦", summary: "Draw locally from all 78 Tarot cards with optional reversals and seven spreads.", keywords: ["tarot", "78 cards", "reader", "reversed", "spreads"] });
  add(entries, { path: "/tarot/cards", title: "All 78 Tarot Cards", system: "Tarot", glyph: "🃏", summary: "Browse the complete Major and Minor Arcana with upright, reversed, love and work meanings.", keywords: ["tarot cards", "major arcana", "minor arcana", "upright", "reversed"] });
  for (const card of TAROT_CARDS) add(entries, { path: `/tarot/cards/${card.slug}`, title: `${card.name} Tarot Card`, system: "Tarot", glyph: card.glyph, summary: card.upright, keywords: [...card.keywords, card.arcana, card.suit || "major arcana", card.rank, "tarot"] });
  add(entries, { path: "/tarot/spreads", title: "Tarot Spread Guides", system: "Tarot", glyph: "⌘", summary: "Learn seven Tarot layouts including Celtic Cross, Love, Career, Decision, Horseshoe and Year Ahead.", keywords: ["tarot spreads", "celtic cross", "love spread", "career spread", "year ahead"] });
  for (const spread of TAROT_SPREAD_GUIDES) add(entries, { path: `/tarot/spreads/${spread.slug}`, title: `${spread.name} Tarot Spread`, system: "Tarot", glyph: "⌘", summary: spread.summary, keywords: ["tarot spread", `${spread.count} cards`, ...spread.positions] });

  add(entries, { path: "/numerology/advanced", title: "Advanced Numerology Profile", system: "Numerology", glyph: "№", summary: "Calculate six modern numerology numbers locally: Life Path, Expression, Soul Urge, Personality, Birthday and Personal Year.", keywords: ["numerology", "life path", "expression", "soul urge", "personality", "personal year"] });
  add(entries, { path: "/numerology/numbers", title: "Numerology Number Meanings", system: "Numerology", glyph: "#", summary: "Explore meanings for numbers 1–9 and master numbers 11, 22 and 33.", keywords: ["number meanings", "master numbers", "11", "22", "33", "numerology"] });
  for (const number of NUMEROLOGY_NUMBERS) add(entries, { path: `/numerology/numbers/${number.value}`, title: `Number ${number.value} — ${number.name}`, system: "Numerology", glyph: String(number.value), summary: number.core, keywords: [...number.keywords, number.master ? "master number" : "number meaning", "numerology"] });
  add(entries, { path: "/numerology/core-numbers", title: "Six Core Numerology Numbers", system: "Numerology", glyph: "∑", summary: "Learn how Life Path, Expression, Soul Urge, Personality, Birthday and Personal Year numbers are calculated.", keywords: ["core numbers", "life path", "destiny", "soul urge", "birthday", "personal year"] });
  for (const guide of CORE_NUMBER_GUIDES) add(entries, { path: `/numerology/core-numbers/${guide.slug}`, title: guide.name, system: "Numerology", glyph: "∑", summary: guide.meaning, keywords: [guide.shortName, guide.source, guide.method, "numerology calculation"] });

  add(entries, { path: "/iching", title: "Advanced I Ching Three-Coin Casting", system: "I Ching", glyph: "☯", summary: "Cast six lines locally with the three-coin method, identify changing lines, and derive a transformed hexagram.", keywords: ["i ching", "yi jing", "three coin", "hexagram", "changing lines"] });
  add(entries, { path: "/iching/hexagrams", title: "All 64 I Ching Hexagrams", system: "I Ching", glyph: "䷀", summary: "Browse all 64 hexagrams in the received King Wen sequence with trigrams, keywords and reflection meanings.", keywords: ["64 hexagrams", "king wen", "i ching", "yi jing"] });
  for (const hex of HEXAGRAMS) add(entries, { path: `/iching/hexagrams/${hex.slug}`, title: `Hexagram ${hex.number} — ${hex.name}`, system: "I Ching", glyph: hex.symbol, summary: hex.summary, keywords: [...hex.keywords, hex.chinese, hex.pinyin, hex.lower, hex.upper, "i ching"] });
  add(entries, { path: "/iching/trigrams", title: "Eight I Ching Trigrams", system: "I Ching", glyph: "☰", summary: "Explore the eight trigrams that combine to form the I Ching's 64 hexagrams.", keywords: ["trigrams", "bagua", "i ching", "heaven", "earth", "water", "fire"] });
  for (const trigram of TRIGRAMS) add(entries, { path: `/iching/trigrams/${trigram.slug}`, title: `${trigram.name} Trigram — ${trigram.pinyin}`, system: "I Ching", glyph: trigram.glyph, summary: `${trigram.name} (${trigram.chinese}) represents ${trigram.quality} and carries the image of ${trigram.image}.`, keywords: [trigram.chinese, trigram.pinyin, trigram.bits, trigram.quality, trigram.image, "trigram", "i ching"] });
  add(entries, { path: "/iching/coin-method", title: "I Ching Three-Coin Method", system: "I Ching", glyph: "●", summary: "Learn how six three-coin throws create lines from bottom to top, including changing lines 6 and 9.", keywords: ["three coin method", "changing lines", "6 7 8 9", "i ching casting"] });

  add(entries, { path: "/astrology", title: "Astrology & Lunar Guide", system: "Astrology", glyph: "☉", summary: "Explore Moon phases, zodiac signs, planetary symbolism, retrogrades, transits and birth-chart concepts with astronomy and astrology clearly separated.", keywords: ["astrology", "moon", "zodiac", "planets", "retrogrades", "birth chart"] });
  add(entries, { path: "/astrology/moon", title: "Moon Phase Calculator & Lunar Calendar", system: "Astrology", glyph: "☽", summary: "Calculate an approximate Moon phase, lunar age and illuminated fraction locally for any date.", keywords: ["moon phase", "lunar calendar", "illumination", "synodic month"] });
  add(entries, { path: "/astrology/moon/phases", title: "Eight Moon Phases", system: "Astrology", glyph: "🌗", summary: "Learn the eight common lunar phase labels with astronomy separated from symbolic interpretation.", keywords: ["moon phases", "new moon", "full moon", "waxing", "waning"] });
  for (const phase of MOON_PHASES) add(entries, { path: `/astrology/moon/phases/${phase.slug}`, title: `${phase.name} Meaning`, system: "Astrology", glyph: phase.glyph, summary: phase.astronomy, keywords: [phase.name, "moon phase", phase.reflection] });
  add(entries, { path: "/astrology/zodiac", title: "12 Tropical Zodiac Signs", system: "Astrology", glyph: "♈", summary: "Browse all 12 tropical zodiac signs with approximate dates, elements, modalities, rulers, strengths and challenges.", keywords: ["zodiac", "12 signs", "tropical astrology", "elements", "modalities"] });
  for (const sign of ZODIAC_SIGNS) add(entries, { path: `/astrology/zodiac/${sign.slug}`, title: `${sign.name} Zodiac Sign`, system: "Astrology", glyph: sign.glyph, summary: sign.summary, keywords: [...sign.keywords, sign.element, sign.modality, sign.ruler, sign.dates, "zodiac"] });
  add(entries, { path: "/astrology/planets", title: "Planets in Astrology", system: "Astrology", glyph: "☿", summary: "Compare basic astronomical facts with the traditional astrological symbolism assigned to ten celestial bodies.", keywords: ["planets", "astrology", "sun", "moon", "mercury", "venus", "mars"] });
  for (const planet of PLANETS) add(entries, { path: `/astrology/planets/${planet.slug}`, title: `${planet.name} in Astrology`, system: "Astrology", glyph: planet.glyph, summary: planet.astrology, keywords: [...planet.keywords, planet.astronomy, "planet", "astrology"] });
  add(entries, { path: "/astrology/retrogrades", title: "Planetary Retrogrades Explained", system: "Astrology", glyph: "℞", summary: "Learn what apparent retrograde motion is astronomically and how modern astrology interprets it symbolically.", keywords: ["retrograde", "apparent motion", "mercury retrograde", "astrology"] });
  for (const planet of RETROGRADE_PLANETS) add(entries, { path: `/astrology/retrogrades/${planet.slug}`, title: `${planet.name} Retrograde`, system: "Astrology", glyph: "℞", summary: `${planet.name} does not reverse its orbit; retrograde is an apparent motion viewed from Earth. Modern astrology adds symbolic interpretations around ${planet.keywords.join(", ")}.`, keywords: [...planet.keywords, `${planet.name} retrograde`, "apparent motion"] });
  add(entries, { path: "/astrology/transits", title: "Astrology Transits Explained", system: "Astrology", glyph: "↝", summary: "Learn what astrologers mean by a transit and why real transit claims require actual planetary positions rather than generic cosmic-weather copy.", keywords: ["transits", "planetary positions", "ephemeris", "astrology"] });
  add(entries, { path: "/astrology/birth-chart", title: "Birth Chart Basics", system: "Astrology", glyph: "◎", summary: "Learn the roles of planets, signs, houses and aspects, plus why exact birth time and location matter for chart angles and houses.", keywords: ["birth chart", "natal chart", "houses", "aspects", "rising sign", "ascendant"] });

  add(entries, { path: "/palmistry", title: "Advanced Palmistry Guide", system: "Palmistry", glyph: "✋", summary: "Explore palm lines, hand shapes, mounts, fingers, markings, history, ethics and science-aware interpretation.", keywords: ["palmistry", "chiromancy", "palm lines", "hand shapes", "mounts"] });
  add(entries, { path: "/palmistry/lines", title: "Palm Lines", system: "Palmistry", glyph: "〰", summary: "Browse the major and secondary palm lines used in traditional palmistry.", keywords: ["heart line", "head line", "life line", "fate line", "palm lines"] });
  for (const item of PALM_LINES) add(entries, { path: `/palmistry/lines/${item.slug}`, title: item.name, system: "Palmistry", glyph: item.icon, summary: item.summary, keywords: [item.tradition, item.reflection, "palm line", "palmistry"] });
  add(entries, { path: "/palmistry/hand-shapes", title: "Palmistry Hand Shapes & Elements", system: "Palmistry", glyph: "◇", summary: "Explore Earth, Air, Fire and Water hand-shape archetypes as symbolic categories rather than personality science.", keywords: ["hand shapes", "earth hand", "air hand", "fire hand", "water hand"] });
  for (const item of HAND_SHAPES) add(entries, { path: `/palmistry/hand-shapes/${item.slug}`, title: item.name, system: "Palmistry", glyph: item.icon, summary: item.summary, keywords: [item.tradition, item.reflection, "hand shape", "palmistry"] });
  add(entries, { path: "/palmistry/mounts", title: "Mounts of the Palm", system: "Palmistry", glyph: "♃", summary: "Explore Jupiter, Saturn, Apollo, Mercury, Venus, Moon and Mars mount symbolism.", keywords: ["palm mounts", "jupiter", "saturn", "apollo", "venus", "moon", "mars"] });
  for (const item of PALM_MOUNTS) add(entries, { path: `/palmistry/mounts/${item.slug}`, title: item.name, system: "Palmistry", glyph: item.icon, summary: item.summary, keywords: [item.tradition, item.reflection, "mount", "palmistry"] });
  add(entries, { path: "/palmistry/fingers", title: "Fingers & Thumb in Palmistry", system: "Palmistry", glyph: "☝", summary: "Explore traditional symbolism of finger proportions, thumb, spacing and set without biometric personality claims.", keywords: ["fingers", "thumb", "finger spacing", "palmistry"] });
  for (const item of PALM_DIGITS) add(entries, { path: `/palmistry/fingers/${item.slug}`, title: item.name, system: "Palmistry", glyph: item.icon, summary: item.summary, keywords: [item.tradition, item.reflection, "finger", "palmistry"] });
  add(entries, { path: "/palmistry/markings", title: "Palm Markings", system: "Palmistry", glyph: "✦", summary: "Explore forks, breaks, islands, crosses, stars, squares, triangles and grilles as traditional palmistry markings.", keywords: ["palm markings", "forks", "breaks", "islands", "crosses", "stars"] });
  for (const item of PALM_MARKINGS) add(entries, { path: `/palmistry/markings/${item.slug}`, title: item.name, system: "Palmistry", glyph: item.icon, summary: item.summary, keywords: [item.tradition, item.reflection, "marking", "palmistry"] });
  for (const guide of PALM_GUIDES) add(entries, { path: `/palmistry/${guide.slug}`, title: guide.name, system: "Palmistry", glyph: "✋", summary: guide.summary, keywords: [guide.slug.replace(/-/g, " "), "palmistry guide"] });

  const dreamThemeList = dreamThemes();
  add(entries, { path: "/dreams", title: `Dream Dictionary — ${DREAM_SYMBOLS.length} Symbols`, system: "Dreams", glyph: "☾", summary: "Browse a large dream-symbol library organized by semantic themes, then compare meanings with your own associations and waking context.", keywords: ["dream dictionary", "dream meanings", "dream symbols", "interpretation"] });
  add(entries, { path: "/dreams/themes", title: "Dream Themes", system: "Dreams", glyph: "☁", summary: "Browse dream symbols by animals, relationships, places, nature, objects, body, travel, nightmares, work/success and mystical imagery.", keywords: ["dream themes", "animals", "relationships", "nightmares", "travel", "work"] });
  for (const theme of dreamThemeList) add(entries, { path: `/dreams/themes/${theme.slug}`, title: `${theme.title} Dream Meanings`, system: "Dreams", glyph: "☁", summary: theme.description, keywords: [theme.title, "dream theme", `${theme.count} symbols`], themes: topicsForPath(`/dreams/themes/${theme.slug}`, 10).map((topic) => topic.slug) });
  for (const symbol of DREAM_SYMBOLS) add(entries, { path: dreamLibraryGuidePath(symbol.symbol), title: `${symbol.title} Dream Meaning`, system: "Dreams", glyph: "☾", summary: symbol.meaning, keywords: [symbol.symbol.replace(/-/g, " "), ...symbol.aliases, symbol.category, symbol.frameworks.emotional, "dream"] });

  add(entries, { path: "/divination", title: "Grounded Divination Reference Library", system: "Divination", glyph: "✦", summary: "Explore crystals, pendulum, scrying, tea leaves, candle/wax symbolism, pattern recognition and ritual safety.", keywords: ["divination", "crystals", "pendulum", "scrying", "tea leaves", "candle wax"] });
  add(entries, { path: "/divination/crystals", title: "Crystal Meanings & Symbolism", system: "Divination", glyph: "◇", summary: "Browse 36 crystals as symbolic reflection tools with medical and supernatural claims clearly excluded.", keywords: ["crystals", "crystal meanings", "symbolism", "stones"] });
  for (const item of CRYSTALS) add(entries, { path: `/divination/crystals/${item.slug}`, title: `${item.name} Crystal Meaning`, system: "Divination", glyph: "◇", summary: item.theme, keywords: [item.colour || "", "crystal", "stone", item.name] });
  add(entries, { path: "/divination/tea-leaves", title: "Tea Leaf Symbols & Meanings", system: "Divination", glyph: "☕", summary: "Browse 40 tasseography-style symbols as flexible prompts grounded in personal association and pattern recognition.", keywords: ["tea leaves", "tasseography", "symbols", "tea reading"] });
  for (const item of TEA_SYMBOLS) add(entries, { path: `/divination/tea-leaves/${item.slug}`, title: `${item.name} in Tea Leaf Reading`, system: "Divination", glyph: "☕", summary: item.theme, keywords: [item.name, "tea leaf", "tasseography", "symbol"] });
  add(entries, { path: "/divination/candle-wax", title: "Candle Wax Symbols & Meanings", system: "Divination", glyph: "🕯", summary: "Browse 24 candle-wax shapes as metaphorical prompts with fire-safety-first, non-predictive framing.", keywords: ["candle wax", "wax reading", "ceromancy", "symbols"] });
  for (const item of WAX_SYMBOLS) add(entries, { path: `/divination/candle-wax/${item.slug}`, title: `${item.name} Candle Wax Meaning`, system: "Divination", glyph: "🕯", summary: item.theme, keywords: [item.name, "candle wax", "wax reading", "symbol"] });
  add(entries, { path: "/divination/scrying", title: "Scrying Methods", system: "Divination", glyph: "◉", summary: "Explore six scrying methods with pattern-recognition framing and practical limits.", keywords: ["scrying", "crystal ball", "black mirror", "water", "flame", "smoke", "clouds"] });
  for (const item of SCRYING_METHODS) add(entries, { path: `/divination/scrying/${item.slug}`, title: item.name, system: "Divination", glyph: "◉", summary: item.theme, keywords: [item.note || "", "scrying", "reflection"] });
  add(entries, { path: "/divination/pendulum", title: "Pendulum Reflection Guide", system: "Divination", glyph: "⌁", summary: "Learn low-stakes pendulum reflection, yes-no-maybe patterns, the ideomotor effect and ethical limits.", keywords: ["pendulum", "ideomotor effect", "yes no maybe", "reflection"] });
  for (const item of PENDULUM_GUIDES) add(entries, { path: `/divination/pendulum/${item.slug}`, title: item.name, system: "Divination", glyph: "⌁", summary: item.theme, keywords: [item.note || "", "pendulum", "ideomotor"] });
  add(entries, { path: "/divination/guides", title: "Grounded Divination Guides", system: "Divination", glyph: "✦", summary: "Learn pattern recognition, symbol journaling, ritual safety, history and the distinction between tradition and evidence.", keywords: ["divination guides", "pareidolia", "ritual safety", "symbol journaling", "evidence"] });
  for (const item of DIVINATION_GUIDES) add(entries, { path: `/divination/guides/${item.slug}`, title: item.name, system: "Divination", glyph: "✦", summary: item.theme, keywords: [item.note || "", "divination", "grounded guide"] });

  add(entries, { path: "/topics", title: "Mystical Themes Across Oracle Mirror", system: "Themes", glyph: "◎", summary: "Compare ten recurring themes across Tarot, dreams, runes, Lenormand, numerology, astrology, palmistry, I Ching and divination.", keywords: ["themes", "knowledge graph", "cross system", "symbolism"] , themes: KNOWLEDGE_TOPICS.map((topic) => topic.slug) });
  for (const topic of KNOWLEDGE_TOPICS) add(entries, { path: `/topics/${topic.slug}`, title: topic.name, system: "Themes", glyph: topic.glyph, summary: topic.summary, keywords: [topic.prompt, ...topic.links.map((link) => `${link.system} ${link.title}`)], themes: [topic.slug, ...topic.related] });

  return entries;
}

export function referenceSearchIndex(): ReferenceSearchEntry[] {
  if (!cachedIndex) cachedIndex = buildIndex();
  return cachedIndex;
}

export function referenceSearchSystems(): string[] {
  return [...new Set(referenceSearchIndex().map((entry) => entry.system))];
}

export function referenceSearchThemeOptions(): Array<{ slug: string; name: string; glyph: string }> {
  return KNOWLEDGE_TOPICS.map((topic) => ({ slug: topic.slug, name: topic.name, glyph: topic.glyph }));
}

export function isReferenceSearchRoute(pathname: string): boolean {
  return pathname === "/search" || pathname === "/search/";
}

function searchPage(): string {
  const index = referenceSearchIndex();
  const systems = referenceSearchSystems();
  const themes = referenceSearchThemeOptions();
  const description = `Search ${index.length} Oracle Mirror reference pages across Tarot, Dreams, Runes, Lenormand, Numerology, I Ching, Astrology, Palmistry, Divination and cross-system themes.`;
  const systemOptions = systems.map((system) => `<option value="${esc(system)}">${esc(system)}</option>`).join("");
  const themeOptions = themes.map((theme) => `<option value="${esc(theme.slug)}">${theme.glyph} ${esc(theme.name)}</option>`).join("");
  const schema = safeJson({ "@context": "https://schema.org", "@type": "WebApplication", name: "Oracle Mirror Universal Reference Search", url: `${HOST}/search`, applicationCategory: "ReferenceApplication", operatingSystem: "Any", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" }, description });
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Search Oracle Mirror — ${index.length} Mystical Reference Pages</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${HOST}/search"><link rel="icon" href="/favicon.svg"><meta name="theme-color" content="#07050d"><meta property="og:type" content="website"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="Search Oracle Mirror"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${HOST}/search"><meta property="og:image" content="${HOST}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/reference-search.css"><script type="application/ld+json">${schema}</script></head><body class="reference-search-body"><header class="reference-search-header"><nav class="reference-search-nav" aria-label="Reference search navigation"><a class="reference-search-brand" href="/">☼ Oracle Mirror</a><div><a href="/topics">Mystical Themes</a><a href="/dreams">Dreams</a><a href="/tarot/cards">Tarot</a><a href="/divination">Divination</a></div></nav></header><main class="reference-search-main"><section class="reference-search-hero"><p class="reference-search-kicker">${index.length} pages · local search · no query telemetry</p><h1>Search the Oracle Mirror Library</h1><p>Search the full reference collection from one place. Your words are matched inside this page in your browser; the search text is not sent to a search API or attached to Oracle Mirror telemetry.</p><div class="reference-search-shortcuts" aria-label="Keyboard shortcuts"><kbd>Ctrl K</kbd><kbd>⌘ K</kbd><kbd>/</kbd><span>focus search from anywhere on Oracle Mirror</span></div></section><section class="reference-search-tool" aria-labelledby="reference-search-tool-title"><h2 id="reference-search-tool-title" class="sr-only">Reference search</h2><form data-reference-search-form role="search" autocomplete="off"><label for="reference-search-input">Search cards, symbols, dreams, numbers, planets and themes</label><div class="reference-search-input-row"><span aria-hidden="true">⌕</span><input id="reference-search-input" data-reference-search-input type="search" inputmode="search" placeholder="Try: love, Mercury retrograde, teeth, protection, career…" aria-describedby="reference-search-privacy"><button type="button" data-reference-search-clear aria-label="Clear search">Clear</button></div><p id="reference-search-privacy" class="reference-search-privacy">Privacy: search text stays in this browser. Filter/share state uses the URL fragment after <code>#</code>, which browsers do not send to the server.</p><div class="reference-search-filters"><label>System<select data-reference-search-system><option value="all">All systems</option>${systemOptions}</select></label><label>Theme<select data-reference-search-theme><option value="all">All themes</option>${themeOptions}</select></label></div></form><div class="reference-search-suggestions" aria-label="Example searches"><span>Try:</span>${["love", "moon", "change", "career", "water", "protection"].map((query) => `<button type="button" data-reference-search-suggestion="${query}">${query}</button>`).join("")}</div><div class="reference-search-status" data-reference-search-status role="status" aria-live="polite">Type a word or phrase to search ${index.length} reference pages.</div><div class="reference-search-results" data-reference-search-results></div><noscript><p class="reference-search-noscript">JavaScript is required for local full-library search. You can still browse <a href="/topics">Mystical Themes</a>, <a href="/dreams">Dreams</a>, <a href="/tarot/cards">Tarot</a>, and the <a href="/divination">Divination Library</a>.</p></noscript></section><section class="reference-search-about"><h2>What is indexed?</h2><div class="reference-search-system-grid">${systems.map((system) => `<span><strong>${esc(system)}</strong><small>${index.filter((entry) => entry.system === system).length} pages</small></span>`).join("")}</div><p>The index is generated from Oracle Mirror's authoritative reference data. It includes the complete 78-card Tarot library, 265-symbol dream dictionary, all 64 I Ching hexagrams, 36 Lenormand cards, 24 Elder Futhark runes, numerology, astrology, palmistry, crystals and other divination guides.</p></section></main><footer class="reference-search-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>Search is a navigation tool. Symbolic traditions remain reflection and entertainment, not factual prediction.</p></footer><script id="reference-search-data" type="application/json">${safeJson(index)}</script><script type="module" src="/reference-search.js"></script></body></html>`;
}

export function handleReferenceSearchRoute(): Response {
  return new Response(searchPage(), { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function augmentSitemapWithReferenceSearch(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`<loc>${HOST}/search</loc>`)) return xml;
  return xml.replace("</urlset>", `  <url><loc>${HOST}/search</loc><changefreq>monthly</changefreq><priority>0.8</priority></url>\n</urlset>`);
}

export function augmentLlmsWithReferenceSearch(text: string): string {
  if (text.includes("## Universal Reference Search")) return text;
  return `${text.trimEnd()}\n\n## Universal Reference Search\n- ${HOST}/search — local browser search across ${referenceSearchIndex().length} Oracle Mirror reference pages.\n- Filters cover ten reference systems and the ten cross-system Mystical Themes.\n- Search text is not sent to a search API and is not included in Oracle Mirror telemetry; optional search state uses the URL fragment.\n`;
}

export function injectReferenceSearchDiscovery(html: string, pathname = ""): string {
  if (!html) return html;
  let next = html;
  if (!next.includes('href="/reference-search.css"')) next = next.replace("</head>", '<link rel="stylesheet" href="/reference-search.css"></head>');
  if (!next.includes('src="/reference-search-shortcut.js"')) next = next.replace("</body>", '<script type="module" src="/reference-search-shortcut.js"></script></body>');
  if (!next.includes('class="reference-search-launcher"') && pathname !== "/search" && pathname !== "/search/") {
    next = next.replace("</body>", '<a class="reference-search-launcher" href="/search#focus" aria-label="Search Oracle Mirror reference library" aria-keyshortcuts="Control+K Meta+K /"><span aria-hidden="true">⌕</span><span>Search</span><kbd>⌘K</kbd></a></body>');
  }
  if (!next.includes('class="dropdown-item reference-search-link"')) {
    next = next.replace('<a href="/topics" class="dropdown-item knowledge-topics-link">◎ Mystical Themes</a>', '<a href="/topics" class="dropdown-item knowledge-topics-link">◎ Mystical Themes</a>\n              <a href="/search" class="dropdown-item reference-search-link">⌕ Search Library</a>');
  }
  const topicCard = '<a href="/topics" class="card card-knowledge-topics">';
  if (next.includes(topicCard) && !next.includes('class="card card-reference-search"')) {
    next = next.replace(topicCard, '<a href="/search" class="card card-reference-search"><div class="card-frame"><div class="card-icon">⌕</div><h3>Search Library</h3><p class="card-desc">Search 745 reference pages across every Oracle Mirror knowledge system</p></div></a>\n          ' + topicCard);
  }
  return next;
}
