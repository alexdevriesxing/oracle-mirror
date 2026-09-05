export const TAROT_SPREADS = {
  "three-card": { name: "Past · Present · Future", positions: ["Past", "Present", "Future"] },
  "love": { name: "Love & Connection", positions: ["You", "Them", "Connection", "Challenge", "Direction"] },
  "career": { name: "Career Compass", positions: ["Current Position", "Strength", "Obstacle", "Opportunity", "Next Step"] },
  "decision": { name: "Decision Mirror", positions: ["Option A", "Option B", "Hidden Factor", "Advice"] },
  "horseshoe": { name: "Horseshoe", positions: ["Past", "Present", "Hidden Influence", "Obstacle", "Environment", "Advice", "Direction"] },
  "celtic-cross": { name: "Celtic Cross", positions: ["Present", "Challenge", "Foundation", "Recent Past", "Possibility", "Near Future", "Self", "Environment", "Hopes & Fears", "Direction"] },
  "year-ahead": { name: "Year Ahead", positions: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6", "Month 7", "Month 8", "Month 9", "Month 10", "Month 11", "Month 12"] },
};

function hashSeed(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rng(seed) {
  let state = hashSeed(seed) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawTarot(deck, spreadKey = "three-card", seed = "oracle-mirror") {
  const spread = TAROT_SPREADS[spreadKey] || TAROT_SPREADS["three-card"];
  if (!Array.isArray(deck) || deck.length < spread.positions.length) return [];
  const random = rng(seed);
  const available = deck.slice();
  const result = [];
  for (const position of spread.positions) {
    const index = Math.floor(random() * available.length);
    const card = available.splice(index, 1)[0];
    const reversed = random() < 0.35;
    result.push({ ...card, position, reversed, message: reversed ? card.reversed : card.upright });
  }
  return result;
}
