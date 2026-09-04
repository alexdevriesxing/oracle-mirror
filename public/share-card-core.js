export const SHARE_CARD_VERSION = 1;
export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;

const SAFE_KINDS = new Set([
  "daily",
  "tarot",
  "numerology",
  "love-match",
  "pick-card",
  "three-doors",
]);

function cleanText(value, max = 120) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanNumber(value, minimum = 0, maximum = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

function isNormalizedSharePayload(input) {
  return Boolean(
    input &&
    typeof input === "object" &&
    input.version === SHARE_CARD_VERSION &&
    SAFE_KINDS.has(input.kind) &&
    typeof input.eyebrow === "string" &&
    typeof input.title === "string" &&
    typeof input.glyph === "string" &&
    typeof input.subtitle === "string" &&
    Array.isArray(input.lines) &&
    typeof input.footer === "string"
  );
}

function normalizedCopy(input) {
  if (!isNormalizedSharePayload(input)) return null;
  return {
    version: SHARE_CARD_VERSION,
    kind: input.kind,
    eyebrow: cleanText(input.eyebrow, 80),
    title: cleanText(input.title, 120),
    glyph: cleanText(input.glyph, 8) || "✦",
    subtitle: cleanText(input.subtitle, 160),
    lines: input.lines.slice(0, 4).map((line) => cleanText(line, 140)).filter(Boolean),
    footer: cleanText(input.footer, 160),
  };
}

export function sanitizeSharePayload(input) {
  const normalized = normalizedCopy(input);
  if (normalized) return normalized;
  if (!input || typeof input !== "object") return null;
  const kind = SAFE_KINDS.has(input.kind) ? input.kind : null;
  if (!kind) return null;

  if (kind === "daily") {
    const card = cleanText(input.card, 64);
    if (!card) return null;
    return {
      version: SHARE_CARD_VERSION,
      kind,
      eyebrow: "YOUR MIRROR TODAY",
      title: card,
      glyph: cleanText(input.glyph, 8) || "✦",
      subtitle: cleanText(input.theme, 96),
      lines: [
        cleanText(input.moon, 64),
        input.luckyNumber ? `Lucky number ${cleanNumber(input.luckyNumber, 1, 99)}` : "",
        cleanText(input.element, 32) ? `Element ${cleanText(input.element, 32)}` : "",
      ].filter(Boolean),
      footer: "A daily reflection from Oracle Mirror",
    };
  }

  if (kind === "tarot") {
    const cards = Array.isArray(input.cards)
      ? input.cards.slice(0, 3).map((card) => cleanText(card, 64)).filter(Boolean)
      : [];
    if (!cards.length) return null;
    return {
      version: SHARE_CARD_VERSION,
      kind,
      eyebrow: "TAROT READING",
      title: cards.length === 3 ? "Past · Present · Future" : "Tarot Draw",
      glyph: "✦",
      subtitle: "The cards that appeared in my Oracle Mirror reading",
      lines: cards.map((card, index) => `${["Past", "Present", "Future"][index] || `Card ${index + 1}`}: ${card}`),
      footer: "Private question excluded from this card",
    };
  }

  if (kind === "numerology") {
    const lifePath = cleanText(String(input.lifePath ?? ""), 16);
    if (!lifePath) return null;
    return {
      version: SHARE_CARD_VERSION,
      kind,
      eyebrow: "NUMEROLOGY",
      title: `Life Path ${lifePath}`,
      glyph: "◇",
      subtitle: "My Oracle Mirror numerology result",
      lines: ["Calculated without displaying my birth date"],
      footer: "Birth date excluded from this card",
    };
  }

  if (kind === "pick-card") {
    const card = cleanText(input.card, 64);
    const message = cleanText(input.message, 140);
    if (!card || !message) return null;
    return {
      version: SHARE_CARD_VERSION,
      kind,
      eyebrow: "PICK A CARD",
      title: card,
      glyph: cleanText(input.glyph, 8) || "✦",
      subtitle: "My instant Oracle Mirror tarot prompt",
      lines: [message],
      footer: "A playful symbolic reflection from Oracle Mirror",
    };
  }

  if (kind === "three-doors") {
    const outcome = cleanText(input.outcome, 72);
    const message = cleanText(input.message, 140);
    if (!outcome || !message) return null;
    const category = cleanText(input.category, 32);
    const door = cleanText(input.door, 32);
    return {
      version: SHARE_CARD_VERSION,
      kind,
      eyebrow: "THREE DOORS",
      title: outcome,
      glyph: cleanText(input.glyph, 8) || "✦",
      subtitle: [door ? `${door} Door` : "Mystery Door", category].filter(Boolean).join(" · "),
      lines: [message],
      footer: "A playful symbolic reveal from Oracle Mirror",
    };
  }

  const score = cleanNumber(input.score, 0, 100);
  if (score === null) return null;
  return {
    version: SHARE_CARD_VERSION,
    kind,
    eyebrow: "COSMIC CHEMISTRY",
    title: `${score}% Compatibility`,
    glyph: "♡",
    subtitle: cleanText(input.tier, 96) || "Oracle Mirror Love Match",
    lines: ["A playful compatibility reading", "Names excluded by default"],
    footer: "Private names and inputs excluded from this card",
  };
}

export function payloadText(payload) {
  const safe = sanitizeSharePayload(payload);
  if (!safe) return "";
  const body = [safe.eyebrow, safe.title, safe.subtitle, ...safe.lines].filter(Boolean).join(" · ");
  return `${body} — oraclemirror.com`;
}

export function safeFileName(payload) {
  const safe = sanitizeSharePayload(payload);
  const kind = safe?.kind || "reading";
  return `oracle-mirror-${kind}-share-card.png`;
}
