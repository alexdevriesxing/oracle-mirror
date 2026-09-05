const POSITIONS = [
  { key: "context", label: "Context", prompt: "What shapes the situation" },
  { key: "focus", label: "Focus", prompt: "What deserves attention" },
  { key: "direction", label: "Direction", prompt: "Where the pattern may lead" },
];

function hashSeed(seed) {
  let hash = 2166136261;
  for (const char of String(seed || "oracle-mirror-lenormand")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededRandom(seed) {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function cleanCard(card) {
  if (!card || typeof card !== "object") return null;
  const number = Number(card.number);
  const name = String(card.name || "").trim();
  const slug = String(card.slug || "").trim();
  if (!Number.isInteger(number) || number < 1 || number > 36 || !name || !slug) return null;
  return {
    number,
    name,
    slug,
    symbol: String(card.symbol || "✦").slice(0, 8),
    polarity: ["light", "neutral", "shadow"].includes(card.polarity) ? card.polarity : "neutral",
    keywords: Array.isArray(card.keywords) ? card.keywords.slice(0, 4).map(String) : [],
    core: String(card.core || "").trim(),
    light: String(card.light || "").trim(),
    challenge: String(card.challenge || "").trim(),
    reflection: String(card.reflection || "").trim(),
  };
}

export function normalizeLenormandDeck(deck) {
  if (!Array.isArray(deck)) return [];
  return deck.map(cleanCard).filter(Boolean).sort((a, b) => a.number - b.number);
}

export function drawLenormand(deck, seed = Date.now()) {
  const cards = normalizeLenormandDeck(deck);
  if (cards.length < 3) return [];
  const random = seededRandom(seed);
  const pool = [...cards];
  const drawn = [];
  for (let index = 0; index < 3; index += 1) {
    const pick = Math.floor(random() * pool.length);
    const [card] = pool.splice(pick, 1);
    drawn.push({ ...card, position: POSITIONS[index] });
  }
  return drawn;
}

function pairTone(left, right) {
  const score = (card) => card.polarity === "light" ? 1 : card.polarity === "shadow" ? -1 : 0;
  const total = score(left) + score(right);
  if (total >= 1) return "supportive";
  if (total <= -1) return "challenging";
  return "mixed";
}

export function combineLenormandPair(left, right) {
  if (!left || !right) return null;
  const tone = pairTone(left, right);
  const keywordA = left.keywords?.[0] || left.name;
  const keywordB = right.keywords?.[0] || right.name;
  const lead = tone === "supportive"
    ? "Together they favor constructive movement"
    : tone === "challenging"
      ? "Together they ask for caution and clearer boundaries"
      : "Together they describe a pattern with both opportunity and friction";
  return {
    left: left.name,
    right: right.name,
    tone,
    text: `${left.name} + ${right.name}: ${lead} around ${keywordA} and ${keywordB}. Read the second card as modifying how the first card's theme is likely to show up.`,
  };
}

export function buildLenormandReading(cards) {
  if (!Array.isArray(cards) || cards.length !== 3) return null;
  return {
    cards,
    pairs: [combineLenormandPair(cards[0], cards[1]), combineLenormandPair(cards[1], cards[2])].filter(Boolean),
    summary: `${cards[0].name} sets the context, ${cards[1].name} becomes the focus, and ${cards[2].name} points toward the direction to watch.`,
  };
}
