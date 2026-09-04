export const SHARE_CARD_VERSION = 1;
export const SHARE_CARD_WIDTH = 1080;
export const SHARE_CARD_HEIGHT = 1920;

const SAFE_KINDS = new Set(["daily", "tarot", "numerology", "love-match"]);

function cleanText(value, max = 120) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function cleanNumber(value, minimum = 0, maximum = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(minimum, Math.min(maximum, Math.round(number)));
}

export function sanitizeSharePayload(input) {
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
