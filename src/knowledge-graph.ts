const HOST = "https://oraclemirror.com";

export type KnowledgeLink = {
  title: string;
  path: string;
  system: string;
  note: string;
};

export type KnowledgeTopic = {
  slug: string;
  name: string;
  glyph: string;
  summary: string;
  prompt: string;
  links: KnowledgeLink[];
  related: string[];
};

export const KNOWLEDGE_TOPICS: KnowledgeTopic[] = [
  {
    slug: "love-relationships",
    name: "Love & Relationships",
    glyph: "♡",
    summary: "Explore connection, reciprocity, commitment, attraction, boundaries, and the stories people build around closeness.",
    prompt: "What would mutual choice, honest communication, and healthy boundaries look like here?",
    related: ["communication-truth", "decisions-crossroads", "protection-boundaries"],
    links: [
      { title: "The Lovers", path: "/tarot/cards/the-lovers", system: "Tarot", note: "Choice, alignment, union, and values." },
      { title: "Heart", path: "/lenormand/heart", system: "Lenormand", note: "Affection, warmth, attachment, and emotional emphasis." },
      { title: "Heart Line", path: "/palmistry/lines/heart-line", system: "Palmistry", note: "A symbolic prompt about attachment, care, and vulnerability." },
      { title: "Venus", path: "/astrology/planets/venus", system: "Astrology", note: "Traditional symbolism around attraction, pleasure, values, and relating." },
      { title: "People & Relationships Dreams", path: "/dreams/themes/relationships", system: "Dreams", note: "Attachment, conflict, memory, projection, and changing social roles." },
      { title: "Heart in Tea Leaves", path: "/divination/tea-leaves/heart", system: "Tea Leaves", note: "A flexible metaphor for affection, vulnerability, or emotional focus." },
      { title: "Number 2", path: "/numerology/numbers/2", system: "Numerology", note: "A symbolic number theme of cooperation, sensitivity, and partnership." },
      { title: "Gebo", path: "/runes/gebo", system: "Runes", note: "Modern rune-reading themes of gift, exchange, reciprocity, and partnership." },
    ],
  },
  {
    slug: "change-transition",
    name: "Change & Transition",
    glyph: "↻",
    summary: "Follow symbols of endings, thresholds, movement, adaptation, release, and the beginning of a different chapter.",
    prompt: "What is actually changing, and what would help you move with it rather than merely resist it?",
    related: ["timing-cycles", "decisions-crossroads", "rest-renewal"],
    links: [
      { title: "Death", path: "/tarot/cards/death", system: "Tarot", note: "Transition and release rather than literal death." },
      { title: "Wheel of Fortune", path: "/tarot/cards/wheel-of-fortune", system: "Tarot", note: "Cycles, changing conditions, and adaptive response." },
      { title: "Dagaz", path: "/runes/dagaz", system: "Runes", note: "A modern symbolic theme of breakthrough, daylight, and turning point." },
      { title: "Stork", path: "/lenormand/stork", system: "Lenormand", note: "Movement, improvement, relocation, or a shift in conditions." },
      { title: "Breaks", path: "/palmistry/markings/breaks", system: "Palmistry", note: "A non-fatalistic prompt about interruption and redirection." },
      { title: "Travel & Movement Dreams", path: "/dreams/themes/travel", system: "Dreams", note: "Direction, control, delay, transition, and momentum." },
      { title: "Bridge in Tea Leaves", path: "/divination/tea-leaves/bridge", system: "Tea Leaves", note: "Connection, crossing a divide, and moving between states." },
      { title: "64 I Ching Hexagrams", path: "/iching/hexagrams", system: "I Ching", note: "A complete change-oriented symbolic system with grounded historical context." },
    ],
  },
  {
    slug: "intuition-inner-life",
    name: "Intuition & Inner Life",
    glyph: "☾",
    summary: "Compare traditions that use silence, imagination, dreams, ambiguous imagery, and inward attention as reflective material.",
    prompt: "What is an intuition here, what is an emotion, and what evidence would help you tell the difference?",
    related: ["communication-truth", "rest-renewal", "timing-cycles"],
    links: [
      { title: "The High Priestess", path: "/tarot/cards/the-high-priestess", system: "Tarot", note: "Observation, silence, pattern recognition, and inner knowledge." },
      { title: "The Moon", path: "/tarot/cards/the-moon", system: "Tarot", note: "Uncertainty, imagination, projection, and incomplete information." },
      { title: "Perthro", path: "/runes/perthro", system: "Runes", note: "A modern interpretive theme around mystery, uncertainty, and the unknown." },
      { title: "Mount of Moon", path: "/palmistry/mounts/moon", system: "Palmistry", note: "Imagination, dreams, receptivity, and the need for grounding." },
      { title: "Mystical & Spiritual Dreams", path: "/dreams/themes/mystical", system: "Dreams", note: "Meaning-making, awe, conscience, and the wish for a larger pattern." },
      { title: "Moon Guide", path: "/astrology/moon", system: "Astrology", note: "Approximate lunar cycles with astronomy and symbolism labelled separately." },
      { title: "Scrying Methods", path: "/divination/scrying", system: "Divination", note: "Ambiguous imagery used for imagination-led reflection rather than supernatural proof." },
      { title: "Moon", path: "/lenormand/moon", system: "Lenormand", note: "Recognition, emotion, imagination, cycles, and subjective response." },
    ],
  },
  {
    slug: "work-purpose",
    name: "Work, Purpose & Direction",
    glyph: "✦",
    summary: "Explore ambition, vocation, resources, responsibility, recognition, and the difference between momentum and meaningful direction.",
    prompt: "Which work matters because it is aligned, and which work matters only because it is urgent or visible?",
    related: ["creativity-confidence", "decisions-crossroads", "timing-cycles"],
    links: [
      { title: "The Magician", path: "/tarot/cards/the-magician", system: "Tarot", note: "Agency, tools, execution, and using what is already available." },
      { title: "Judgement", path: "/tarot/cards/judgement", system: "Tarot", note: "Review, calling, mature decision, and vocational redirection." },
      { title: "Fehu", path: "/runes/fehu", system: "Runes", note: "Modern symbolism around resources, value, stewardship, and movable wealth." },
      { title: "Anchor", path: "/lenormand/anchor", system: "Lenormand", note: "Stability, persistence, work, and what holds a position in place." },
      { title: "Fate Line", path: "/palmistry/lines/fate-line", system: "Palmistry", note: "A reflective lens on vocation, structure, obligations, and chosen direction." },
      { title: "Work, Money & Success Dreams", path: "/dreams/themes/work-success", system: "Dreams", note: "Evaluation, security, responsibility, competition, and recognition." },
      { title: "Number 8", path: "/numerology/numbers/8", system: "Numerology", note: "A symbolic theme of authority, material responsibility, and management." },
      { title: "Saturn", path: "/astrology/planets/saturn", system: "Astrology", note: "Traditional symbolism around limits, duty, time, structure, and maturity." },
    ],
  },
  {
    slug: "protection-boundaries",
    name: "Protection & Boundaries",
    glyph: "◇",
    summary: "Compare symbolic language about safety, containment, limits, self-protection, fear, and the difference between prudent caution and magical certainty.",
    prompt: "What practical boundary, support, or safety step would reduce risk without feeding fear?",
    related: ["love-relationships", "communication-truth", "rest-renewal"],
    links: [
      { title: "The Emperor", path: "/tarot/cards/the-emperor", system: "Tarot", note: "Structure, standards, responsibility, and defensible boundaries." },
      { title: "Algiz", path: "/runes/algiz", system: "Runes", note: "A modern protective symbol presented without claims of guaranteed physical safety." },
      { title: "Bear", path: "/lenormand/bear", system: "Lenormand", note: "Power, protection, authority, resources, and strong influence." },
      { title: "Squares", path: "/palmistry/markings/squares", system: "Palmistry", note: "Traditional containment/protection symbolism kept clearly metaphorical." },
      { title: "Nightmares & Threats", path: "/dreams/themes/nightmares", system: "Dreams", note: "Fear, overload, helplessness, and boundary violations without literal prediction." },
      { title: "Crystal Symbolism", path: "/divination/crystals", system: "Divination", note: "Stones as ritual cues and reflective symbols, not protective technology." },
      { title: "Number 4", path: "/numerology/numbers/4", system: "Numerology", note: "A symbolic theme of structure, stability, method, and dependable foundations." },
      { title: "Saturn", path: "/astrology/planets/saturn", system: "Astrology", note: "Limits, responsibility, structure, and the discipline of saying no." },
    ],
  },
  {
    slug: "communication-truth",
    name: "Communication & Truth",
    glyph: "☿",
    summary: "Explore language, signals, evidence, honesty, listening, ambiguity, and the stories people tell when information is incomplete.",
    prompt: "What do you know, what are you assuming, and what conversation or evidence would reduce the gap?",
    related: ["love-relationships", "intuition-inner-life", "decisions-crossroads"],
    links: [
      { title: "Justice", path: "/tarot/cards/justice", system: "Tarot", note: "Evidence, accountability, fairness, and choices that survive scrutiny." },
      { title: "Ansuz", path: "/runes/ansuz", system: "Runes", note: "A modern symbolic theme of speech, message, learning, and communication." },
      { title: "Letter", path: "/lenormand/letter", system: "Lenormand", note: "Written communication, documents, messages, and explicit information." },
      { title: "Mercury Line", path: "/palmistry/lines/mercury-line", system: "Palmistry", note: "Communication and work habits without health diagnosis." },
      { title: "Mercury", path: "/astrology/planets/mercury", system: "Astrology", note: "Traditional symbolism around language, exchange, reasoning, and movement." },
      { title: "Objects & Symbols Dreams", path: "/dreams/themes/objects", system: "Dreams", note: "Value, access, identity, communication, control, and practical responsibility." },
      { title: "Number 3", path: "/numerology/numbers/3", system: "Numerology", note: "A symbolic theme of expression, sociability, creativity, and voice." },
      { title: "Arrow in Tea Leaves", path: "/divination/tea-leaves/arrow", system: "Tea Leaves", note: "Direction, focus, or a message pointing toward action." },
    ],
  },
  {
    slug: "creativity-confidence",
    name: "Creativity & Confidence",
    glyph: "☀",
    summary: "Follow themes of expression, craft, visibility, courage, play, recognition, and creating without turning applause into the only measure of value.",
    prompt: "What would you make, say, or attempt if the goal were expression and craft rather than approval?",
    related: ["work-purpose", "communication-truth", "rest-renewal"],
    links: [
      { title: "The Empress", path: "/tarot/cards/the-empress", system: "Tarot", note: "Creativity, cultivation, beauty, care, and patient growth." },
      { title: "The Sun", path: "/tarot/cards/the-sun", system: "Tarot", note: "Visibility, confidence, vitality, and uncomplicated expression." },
      { title: "Kenaz", path: "/runes/kenaz", system: "Runes", note: "A modern symbolic theme of torchlight, craft, learning, and illumination." },
      { title: "Sun Line", path: "/palmistry/lines/sun-line", system: "Palmistry", note: "Creative expression, satisfaction, recognition, and meaningful craft." },
      { title: "Mount of Apollo", path: "/palmistry/mounts/apollo", system: "Palmistry", note: "Visibility, pleasure, aesthetics, confidence, and appreciation of craft." },
      { title: "Sun", path: "/astrology/planets/sun", system: "Astrology", note: "Traditional symbolism around vitality, identity, purpose, and visibility." },
      { title: "Number 3", path: "/numerology/numbers/3", system: "Numerology", note: "Expression, sociability, imagination, and creative voice." },
      { title: "Work, Money & Success Dreams", path: "/dreams/themes/work-success", system: "Dreams", note: "Recognition, evaluation, ambition, and the fear of failure." },
    ],
  },
  {
    slug: "timing-cycles",
    name: "Timing & Cycles",
    glyph: "◌",
    summary: "Explore rhythm, recurrence, patience, seasons, deadlines, lunar phases, changing conditions, and the temptation to mistake timing symbolism for certainty.",
    prompt: "What is genuinely time-sensitive, what is cyclical, and what only feels urgent because you want certainty now?",
    related: ["change-transition", "decisions-crossroads", "intuition-inner-life"],
    links: [
      { title: "Wheel of Fortune", path: "/tarot/cards/wheel-of-fortune", system: "Tarot", note: "Cycles, timing, changing conditions, and adaptive response." },
      { title: "The Hanged Man", path: "/tarot/cards/the-hanged-man", system: "Tarot", note: "Pause, perspective, surrender, and the difference between waiting and stalling." },
      { title: "Jera", path: "/runes/jera", system: "Runes", note: "A modern symbolic theme of year, harvest, process, and earned results over time." },
      { title: "Moon Phases", path: "/astrology/moon/phases", system: "Astrology", note: "Eight phase labels with astronomy and symbolism clearly separated." },
      { title: "Advanced Numerology", path: "/numerology/advanced", system: "Numerology", note: "Includes a local Personal Year calculation as a symbolic cycle." },
      { title: "Clock in Tea Leaves", path: "/divination/tea-leaves/clock", system: "Tea Leaves", note: "A metaphor for timing, deadlines, patience, or a limited window." },
      { title: "Travel & Movement Dreams", path: "/dreams/themes/travel", system: "Dreams", note: "Delay, movement, control, direction, and transition." },
      { title: "I Ching Coin Method", path: "/iching/coin-method", system: "I Ching", note: "A transparent guide to the six-line three-coin casting method." },
    ],
  },
  {
    slug: "decisions-crossroads",
    name: "Decisions & Crossroads",
    glyph: "Y",
    summary: "Compare symbolic systems that focus on choice, direction, uncertainty, trade-offs, and how to keep agency with the person making the decision.",
    prompt: "Which options are real, what trade-off does each require, and what information would change your mind?",
    related: ["change-transition", "communication-truth", "work-purpose"],
    links: [
      { title: "The Lovers", path: "/tarot/cards/the-lovers", system: "Tarot", note: "Alignment, values, and meaningful choice beyond romance." },
      { title: "Crossroads", path: "/lenormand/crossroads", system: "Lenormand", note: "Options, branching paths, alternatives, and decision pressure." },
      { title: "Raidho", path: "/runes/raidho", system: "Runes", note: "A modern symbolic theme of journey, order, movement, and direction." },
      { title: "Forks", path: "/palmistry/markings/forks", system: "Palmistry", note: "A reflective metaphor for dual direction and integrating two tendencies." },
      { title: "Travel & Movement Dreams", path: "/dreams/themes/travel", system: "Dreams", note: "Direction, momentum, delay, transition, and control." },
      { title: "Fork in Tea Leaves", path: "/divination/tea-leaves/fork", system: "Tea Leaves", note: "A metaphor for alternatives, branching options, or divided attention." },
      { title: "Number 1", path: "/numerology/numbers/1", system: "Numerology", note: "A symbolic theme of initiative, independence, and beginning." },
      { title: "Advanced I Ching", path: "/iching", system: "I Ching", note: "A complete local cast framed as reflection rather than command or certainty." },
    ],
  },
  {
    slug: "rest-renewal",
    name: "Rest, Recovery & Renewal",
    glyph: "★",
    summary: "Explore recovery, solitude, hope, gentleness, pacing, stability, and the difference between restorative pause and avoidance.",
    prompt: "What would restore capacity here: sleep, distance, support, a smaller pace, or finishing something that keeps draining attention?",
    related: ["intuition-inner-life", "protection-boundaries", "change-transition"],
    links: [
      { title: "The Star", path: "/tarot/cards/the-star", system: "Tarot", note: "Hope, renewal, proportion, and the next small sign of recovery." },
      { title: "The Hermit", path: "/tarot/cards/the-hermit", system: "Tarot", note: "Solitude, reflection, independence, and useful quiet." },
      { title: "Berkano", path: "/runes/berkano", system: "Runes", note: "A modern symbolic theme of growth, care, renewal, and emergence." },
      { title: "Tree", path: "/lenormand/tree", system: "Lenormand", note: "Growth, roots, continuity, health symbolism, and slow development." },
      { title: "Life Line", path: "/palmistry/lines/life-line", system: "Palmistry", note: "A vitality-and-grounding prompt that explicitly rejects lifespan prediction." },
      { title: "Nature & Weather Dreams", path: "/dreams/themes/nature", system: "Dreams", note: "Change, exposure, renewal, intensity, and the sense of scale or control." },
      { title: "Moon Guide", path: "/astrology/moon", system: "Astrology", note: "A transparent approximate lunar cycle with symbolic layers clearly labelled." },
      { title: "Crystal Symbolism", path: "/divination/crystals", system: "Divination", note: "Stones as physical cues for intention and reflection, not treatment." },
    ],
  },
];

const TOPIC_BY_SLUG = new Map(KNOWLEDGE_TOPICS.map((topic) => [topic.slug, topic]));

const FAMILY_DEFAULTS: Array<[RegExp, string[]]> = [
  [/^\/dreams\/themes\/relationships(?:\/|$)/, ["love-relationships", "communication-truth"]],
  [/^\/dreams\/themes\/work-success(?:\/|$)/, ["work-purpose", "creativity-confidence"]],
  [/^\/dreams\/themes\/travel(?:\/|$)/, ["change-transition", "decisions-crossroads", "timing-cycles"]],
  [/^\/dreams\/themes\/nightmares(?:\/|$)/, ["protection-boundaries", "rest-renewal"]],
  [/^\/dreams\/themes\/mystical(?:\/|$)/, ["intuition-inner-life", "timing-cycles"]],
  [/^\/dreams\/themes\/nature(?:\/|$)/, ["rest-renewal", "change-transition"]],
  [/^\/dreams\/themes\/objects(?:\/|$)/, ["communication-truth", "decisions-crossroads"]],
  [/^\/dreams\//, ["intuition-inner-life", "change-transition"]],
  [/^\/tarot(?:\/|$)/, ["decisions-crossroads", "intuition-inner-life"]],
  [/^\/runes(?:\/|$)/, ["change-transition", "decisions-crossroads"]],
  [/^\/lenormand(?:\/|$)/, ["decisions-crossroads", "communication-truth"]],
  [/^\/numerology(?:\/|$)/, ["work-purpose", "timing-cycles"]],
  [/^\/iching(?:\/|$)/, ["change-transition", "decisions-crossroads", "timing-cycles"]],
  [/^\/astrology(?:\/|$)/, ["timing-cycles", "intuition-inner-life"]],
  [/^\/palmistry(?:\/|$)/, ["intuition-inner-life", "communication-truth"]],
  [/^\/divination\/pendulum(?:\/|$)/, ["decisions-crossroads", "intuition-inner-life"]],
  [/^\/divination\/scrying(?:\/|$)/, ["intuition-inner-life", "rest-renewal"]],
  [/^\/divination\/crystals(?:\/|$)/, ["rest-renewal", "protection-boundaries"]],
  [/^\/divination\/tea-leaves(?:\/|$)/, ["communication-truth", "decisions-crossroads"]],
  [/^\/divination\/candle-wax(?:\/|$)/, ["change-transition", "timing-cycles"]],
  [/^\/divination(?:\/|$)/, ["intuition-inner-life", "decisions-crossroads"]],
];

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function directTopicSlugs(path: string): string[] {
  const found: string[] = [];
  for (const topic of KNOWLEDGE_TOPICS) {
    if (topic.links.some((link) => link.path === path)) found.push(topic.slug);
  }
  return found;
}

export function topicsForPath(path: string, limit = 3): KnowledgeTopic[] {
  if (!path || path === "/" || path.startsWith("/topics")) return [];
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const slugs = directTopicSlugs(normalized);
  for (const [pattern, defaults] of FAMILY_DEFAULTS) {
    if (!pattern.test(normalized)) continue;
    for (const slug of defaults) if (!slugs.includes(slug)) slugs.push(slug);
    break;
  }
  return slugs.slice(0, Math.max(0, limit)).map((slug) => TOPIC_BY_SLUG.get(slug)).filter((topic): topic is KnowledgeTopic => Boolean(topic));
}

export function knowledgeTopicUrls(): string[] {
  return ["/topics", ...KNOWLEDGE_TOPICS.map((topic) => `/topics/${topic.slug}`)];
}

function breadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: `${HOST}${item.path}` })),
  };
}

function layout(title: string, description: string, path: string, body: string, schema: unknown[] = []): string {
  const canonical = `${HOST}${path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><meta name="theme-color" content="#07050d"><meta property="og:type" content="website"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${HOST}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/knowledge-graph.css">${schema.map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`).join("")}</head><body class="knowledge-body"><header class="knowledge-header"><nav class="knowledge-nav" aria-label="Knowledge topics navigation"><a class="knowledge-brand" href="/">✦ Oracle Mirror</a><div><a href="/topics">Themes</a><a href="/dreams">Dreams</a><a href="/tarot/advanced">Tarot</a><a href="/runes">Runes</a><a href="/lenormand">Lenormand</a><a href="/divination">Divination</a></div></nav></header><main class="knowledge-main">${body}</main><footer class="knowledge-footer"><a href="/">Oracle Mirror</a><span>·</span><a href="/privacy-policy">Privacy</a><span>·</span><a href="/contact">Contact</a><p>Knowledge topics connect symbolic traditions for reflection and discovery. They do not turn repeated symbolism into scientific evidence or guaranteed prediction.</p></footer></body></html>`;
}

function topicCard(topic: KnowledgeTopic): string {
  return `<a class="knowledge-topic-card" href="/topics/${topic.slug}"><span class="knowledge-topic-glyph" aria-hidden="true">${topic.glyph}</span><h2>${esc(topic.name)}</h2><p>${esc(topic.summary)}</p><span class="knowledge-topic-count">${topic.links.length} cross-system guides</span></a>`;
}

function renderHub(): string {
  const title = "Mystical Themes — Cross-System Knowledge Map | Oracle Mirror";
  const description = "Explore ten grounded themes across Tarot, dreams, runes, Lenormand, numerology, astrology, palmistry, I Ching and divination reference guides.";
  const body = `<section class="knowledge-hero"><span class="knowledge-kicker">Oracle Mirror Knowledge Map</span><h1>One Theme, Many Symbolic Languages</h1><p>Oracle Mirror's libraries use different traditions, but many of them circle the same human questions: connection, change, work, boundaries, communication, timing and renewal. These theme hubs connect the relevant guides without pretending that repeated symbolism proves a supernatural fact.</p><div class="knowledge-actions"><a class="btn-gold" href="/divination/guides/tradition-vs-evidence">Tradition vs Evidence</a><a class="btn-ghost" href="/dreams">Browse the Dream Library</a></div></section><section aria-labelledby="knowledge-theme-list"><h2 id="knowledge-theme-list" class="knowledge-section-title">Explore by Theme</h2><div class="knowledge-topic-grid">${KNOWLEDGE_TOPICS.map(topicCard).join("")}</div></section><section class="knowledge-note"><h2>Why connect the systems?</h2><p>Cross-links help you compare how different symbolic traditions frame a concern instead of treating any one dictionary as a universal code. Similarity can be culturally interesting or personally useful while still remaining interpretation rather than evidence.</p></section>`;
  return layout(title, description, "/topics", body, [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: "Oracle Mirror Mystical Themes", url: `${HOST}/topics`, description },
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: KNOWLEDGE_TOPICS.map((topic, index) => ({ "@type": "ListItem", position: index + 1, name: topic.name, url: `${HOST}/topics/${topic.slug}` })) },
  ]);
}

function renderTopic(topic: KnowledgeTopic): string {
  const path = `/topics/${topic.slug}`;
  const title = `${topic.name} — Tarot, Dreams, Runes & More | Oracle Mirror`;
  const description = `${topic.summary} Compare ${topic.links.length} related guides across Oracle Mirror's symbolic reference systems.`;
  const related = topic.related.map((slug) => TOPIC_BY_SLUG.get(slug)).filter((item): item is KnowledgeTopic => Boolean(item));
  const body = `<nav class="knowledge-crumb"><a href="/topics">Mystical Themes</a><span>›</span><span>${esc(topic.name)}</span></nav><article class="knowledge-article"><header><span class="knowledge-big-glyph" aria-hidden="true">${topic.glyph}</span><span class="knowledge-kicker">Cross-System Theme</span><h1>${esc(topic.name)}</h1><p class="knowledge-answer">${esc(topic.summary)}</p></header><section class="knowledge-prompt"><h2>Reflection prompt</h2><p>${esc(topic.prompt)}</p></section><section><h2>Compare the Theme Across Systems</h2><p>Each link below is a real Oracle Mirror reference page. Read the systems side by side and notice both the overlap and the disagreement.</p><div class="knowledge-link-grid">${topic.links.map((link) => `<a class="knowledge-link-card" href="${link.path}"><span class="knowledge-system">${esc(link.system)}</span><h3>${esc(link.title)}</h3><p>${esc(link.note)}</p></a>`).join("")}</div></section><section class="knowledge-note"><h2>Do repeated symbols prove anything?</h2><p>No. Different traditions can reuse similar human metaphors—love as a heart, change as a journey, safety as a boundary—without establishing a shared supernatural mechanism. Treat overlap as comparative symbolism and a source of reflection, not independent confirmation.</p></section><section><h2>Related Themes</h2><div class="knowledge-related-grid">${related.map((item) => `<a href="/topics/${item.slug}"><span aria-hidden="true">${item.glyph}</span><strong>${esc(item.name)}</strong></a>`).join("")}</div></section><div class="knowledge-actions"><a class="btn-gold" href="/topics">All Mystical Themes</a><a class="btn-ghost" href="/">Oracle Mirror Home</a></div></article>`;
  return layout(title, description, path, body, [
    { "@context": "https://schema.org", "@type": "CollectionPage", name: topic.name, url: `${HOST}${path}`, description, about: topic.links.map((link) => link.title) },
    { "@context": "https://schema.org", "@type": "ItemList", itemListElement: topic.links.map((link, index) => ({ "@type": "ListItem", position: index + 1, name: `${link.system}: ${link.title}`, url: `${HOST}${link.path}` })) },
    breadcrumb([{ name: "Oracle Mirror", path: "/" }, { name: "Mystical Themes", path: "/topics" }, { name: topic.name, path }]),
  ]);
}

export function isKnowledgeTopicRoute(path: string): boolean {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  return normalized === "/topics" || /^\/topics\/[a-z0-9-]+$/.test(normalized);
}

export function handleKnowledgeTopicRoute(path: string): Response {
  const normalized = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
  const html = normalized === "/topics" ? renderHub() : renderTopic(TOPIC_BY_SLUG.get(normalized.replace("/topics/", "")) as KnowledgeTopic);
  if (normalized !== "/topics" && !TOPIC_BY_SLUG.has(normalized.replace("/topics/", ""))) return new Response("Not found", { status: 404 });
  return new Response(html, { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } });
}

export function injectKnowledgeGraph(html: string, path: string): string {
  if (!html || html.includes('class="knowledge-graph-panel"') || path.startsWith("/topics")) return html;
  const topics = topicsForPath(path, 3);
  if (!topics.length) return html;
  const panel = `<aside class="knowledge-graph-panel" aria-labelledby="knowledge-graph-title"><span class="knowledge-graph-kicker">Across Oracle Mirror</span><h2 id="knowledge-graph-title">Explore this theme in other traditions</h2><p>Compare related symbolic lenses without treating agreement between them as proof.</p><div class="knowledge-graph-links">${topics.map((topic) => `<a href="/topics/${topic.slug}"><span aria-hidden="true">${topic.glyph}</span><strong>${esc(topic.name)}</strong><small>${esc(topic.summary)}</small></a>`).join("")}</div><a class="knowledge-graph-all" href="/topics">Browse all mystical themes →</a></aside>`;
  let next = html.includes('href="/knowledge-graph.css"') ? html : html.replace("</head>", '<link rel="stylesheet" href="/knowledge-graph.css"></head>');
  const footerIndex = next.lastIndexOf("<footer");
  if (footerIndex >= 0) return `${next.slice(0, footerIndex)}${panel}${next.slice(footerIndex)}`;
  const bodyIndex = next.lastIndexOf("</body>");
  return bodyIndex >= 0 ? `${next.slice(0, bodyIndex)}${panel}${next.slice(bodyIndex)}` : next;
}

export function augmentSitemapWithKnowledgeGraph(xml: string): string {
  if (xml.includes(`<loc>${HOST}/topics</loc>`)) return xml;
  const block = knowledgeTopicUrls().map((path) => `  <url><loc>${HOST}${path}</loc><changefreq>monthly</changefreq><priority>${path === "/topics" ? "0.8" : "0.65"}</priority></url>`).join("\n");
  return xml.replace("</urlset>", `${block}\n</urlset>`);
}

export function augmentLlmsWithKnowledgeGraph(text: string): string {
  if (text.includes("## Cross-System Mystical Themes")) return text;
  return `${text.trimEnd()}\n\n## Cross-System Mystical Themes\n- ${HOST}/topics — ten theme hubs connecting Tarot, dreams, runes, Lenormand, numerology, astrology, palmistry, I Ching and divination guides.\n- ${HOST}/topics/{theme} — curated cross-system comparison pages for love, change, intuition, work, boundaries, communication, creativity, timing, decisions and renewal.\n- Theme overlap is presented as comparative symbolism, not as scientific or supernatural confirmation.\n`;
}

export function injectKnowledgeGraphDiscovery(html: string): string {
  if (!html || html.includes('class="dropdown-item knowledge-topics-link"')) return html;
  let next = html.replace(
    '<a href="/divination" class="dropdown-item divination-library-link">✦ Divination Library</a>',
    '<a href="/divination" class="dropdown-item divination-library-link">✦ Divination Library</a>\n              <a href="/topics" class="dropdown-item knowledge-topics-link">◎ Mystical Themes</a>'
  );
  const divinationCard = '<a href="/divination" class="card card-divination-library">';
  if (next.includes(divinationCard) && !next.includes('class="card card-knowledge-topics"')) {
    next = next.replace(divinationCard, '<a href="/topics" class="card card-knowledge-topics"><div class="card-frame"><div class="card-icon">◎</div><h3>Mystical Themes</h3><p class="card-desc">Compare love, change, intuition, work, timing and other themes across Oracle Mirror systems</p></div></a>\n          ' + divinationCard);
  }
  return next;
}
