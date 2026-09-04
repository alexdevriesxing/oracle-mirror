export const INSTANT_MYSTERIES_VERSION = 1;

export const MYSTIC_ROULETTE_OPTIONS = [
  { id: "fortuna", glyph: "🔮", oracle: "Madame Fortuna", title: "Crystal Ball", route: "/crystal-ball", teaser: "A question is already circling the mirror. Let the mists answer it." },
  { id: "seraphina", glyph: "🃏", oracle: "Seraphina", title: "Tarot", route: "/tarot", teaser: "Three cards are waiting to turn over a hidden angle of your situation." },
  { id: "astaria", glyph: "✦", oracle: "Astaria", title: "Western Zodiac", route: "/western-zodiac", teaser: "Look upward. The stars may frame today differently than you expected." },
  { id: "longwei", glyph: "🐉", oracle: "Master Longwei", title: "Chinese Zodiac", route: "/chinese-zodiac", teaser: "An older cycle is moving beneath the surface. Follow its animal wisdom." },
  { id: "pythius", glyph: "◇", oracle: "Pythius", title: "Numerology", route: "/numerology", teaser: "There is a pattern hiding in the numbers. Pythius would like a word." },
  { id: "dawn", glyph: "☀", oracle: "The Dawn Oracle", title: "Daily Fortune", route: "/daily-fortune", teaser: "Today has one message that belongs only to today." },
  { id: "morpheus", glyph: "☾", oracle: "Morpheus", title: "Dream Interpreter", route: "/dream-interpreter", teaser: "A dream symbol may be carrying more weight than it first appears." },
  { id: "rosalind", glyph: "♡", oracle: "Rosalind", title: "Love Oracle", route: "/love-oracle", teaser: "The heart is rarely quiet. Rosalind can help translate the noise." },
  { id: "laotan", glyph: "☯", oracle: "Sage Lao-Tan", title: "I Ching", route: "/iching-oracle", teaser: "Change is already in motion. Cast the coins and see its shape." },
  { id: "cassandra", glyph: "✋", oracle: "Cassandra", title: "Palm Reading", route: "/palm-reading", teaser: "The lines of the hand make an unusual map. Cassandra reads the roads." },
];

export const MICRO_TAROT_CARDS = [
  { name: "The Fool", glyph: "🃏", message: "Begin before certainty arrives. Curiosity is more useful than a perfect map." },
  { name: "The Magician", glyph: "⚡", message: "Use what is already in your hands. The missing ingredient may be confidence." },
  { name: "The High Priestess", glyph: "☾", message: "Not every answer improves when forced. Notice what your first instinct already knows." },
  { name: "The Empress", glyph: "🌸", message: "Nurture what is growing. Attention and patience are productive forces today." },
  { name: "The Emperor", glyph: "♜", message: "Give the situation structure. A clear boundary can create more freedom than another option." },
  { name: "The Hierophant", glyph: "📿", message: "A tradition, mentor, or proven method may be more useful than reinventing everything." },
  { name: "The Lovers", glyph: "♡", message: "Choose in alignment with your values, not merely with what is easiest to desire." },
  { name: "The Chariot", glyph: "⚔", message: "Pick a direction and gather your energy behind it. Divided momentum goes nowhere." },
  { name: "Strength", glyph: "🦁", message: "Gentle control beats brute force. Patience can be the strongest move available." },
  { name: "The Hermit", glyph: "✧", message: "Step away from the noise long enough to hear your own reasoning again." },
  { name: "Wheel of Fortune", glyph: "◉", message: "Conditions are changing. Stay flexible enough to use the turn rather than resist it." },
  { name: "Justice", glyph: "⚖", message: "Look at the facts, the trade-offs, and what you would call fair if roles were reversed." },
  { name: "The Hanged Man", glyph: "◇", message: "Progress may require a different viewpoint rather than more effort in the same direction." },
  { name: "Death", glyph: "✦", message: "Something is ready to end so something else can stop waiting outside the door." },
  { name: "Temperance", glyph: "☯", message: "Blend rather than polarize. The useful answer may live between two extremes." },
  { name: "The Devil", glyph: "⛓", message: "Notice the habit, bargain, or attachment that has quietly started choosing for you." },
  { name: "The Tower", glyph: "⚡", message: "A shaky assumption may be due for demolition. Better truth now than comfort built on cracks." },
  { name: "The Star", glyph: "★", message: "Keep one hopeful signal in view. Recovery often begins before it feels dramatic." },
  { name: "The Moon", glyph: "🌙", message: "The picture is incomplete. Treat strong feelings as information, not yet as proof." },
  { name: "The Sun", glyph: "☀", message: "Clarity favors action. Enjoy the part that is working instead of inventing a hidden problem." },
  { name: "Judgement", glyph: "📯", message: "Review what you have learned, then answer the call with the benefit of hindsight." },
  { name: "The World", glyph: "◎", message: "A cycle is completing. Finish it well before rushing to manufacture the next beginning." },
];

const DOOR_POOLS = {
  opportunity: [
    { id: "spark", glyph: "✦", title: "A Small Opening", message: "An overlooked option deserves a second look. The useful opportunity may arrive quietly rather than dramatically.", route: "/daily-fortune", cta: "Ask the Dawn Oracle" },
    { id: "craft", glyph: "⚡", title: "Use What You Have", message: "Your next advantage is more likely to come from combining existing strengths than waiting for a new resource.", route: "/tarot", cta: "Take It to the Tarot" },
    { id: "pattern", glyph: "◇", title: "The Pattern Repeats", message: "A recurring number, habit, or timing pattern may contain the clue you have been missing.", route: "/numerology", cta: "Follow the Numbers" },
    { id: "alliance", glyph: "♡", title: "An Unexpected Ally", message: "A conversation or collaboration could move further than solitary effort. Leave room for another perspective.", route: "/love-oracle", cta: "Consult Rosalind" },
  ],
  warning: [
    { id: "fog", glyph: "☾", title: "Do Not Rush the Fog", message: "The pressure to decide is stronger than the available information. Delay certainty, not awareness.", route: "/crystal-ball", cta: "Look Into the Mirror" },
    { id: "old-loop", glyph: "⛓", title: "The Old Loop", message: "A familiar reaction is trying to make a familiar decision. Notice the loop before you call it intuition.", route: "/iching-oracle", cta: "Consult the I Ching" },
    { id: "split-energy", glyph: "⚖", title: "Scattered Energy", message: "Too many competing priorities can make every option feel urgent. Choose what deserves the next clear hour.", route: "/tarot", cta: "Ask the Cards" },
    { id: "borrowed-voice", glyph: "✧", title: "Someone Else's Voice", message: "Check whether the standard you are chasing actually belongs to you or was quietly inherited from someone else.", route: "/palm-reading", cta: "Read the Lines" },
  ],
  unexpected: [
    { id: "dream-key", glyph: "☁", title: "The Dream Key", message: "Something your waking mind dismissed may return as a symbol, memory, or strange coincidence worth noticing.", route: "/dream-interpreter", cta: "Ask Morpheus" },
    { id: "detour", glyph: "↝", title: "The Useful Detour", message: "The route that looks inefficient may reveal the information the direct path keeps hiding.", route: "/crystal-ball", cta: "Peer Into the Mists" },
    { id: "mirror", glyph: "◈", title: "A Mirror Appears", message: "Someone else's reaction may reveal more about your own assumptions than about them.", route: "/love-match", cta: "Explore Compatibility" },
    { id: "timing", glyph: "◷", title: "Timing Changes the Answer", message: "The decision itself may be sound while the timing is wrong. Ask what changes if you wait, not only what happens if you act.", route: "/daily-fortune", cta: "Read Today's Fortune" },
  ],
};

export const SAFE_INSTANT_ROUTES = new Set([
  ...MYSTIC_ROULETTE_OPTIONS.map((option) => option.route),
  ...Object.values(DOOR_POOLS).flat().map((outcome) => outcome.route),
  "/tarot",
]);

export function hashSeed(seed) {
  const text = String(seed ?? "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededIndex(seed, length, salt = "") {
  if (!Number.isInteger(length) || length <= 0) return -1;
  return hashSeed(`${seed}|${salt}`) % length;
}

export function pickMystic(seed, previousId = "") {
  if (!MYSTIC_ROULETTE_OPTIONS.length) return null;
  let index = seededIndex(seed, MYSTIC_ROULETTE_OPTIONS.length, "mystic");
  if (MYSTIC_ROULETTE_OPTIONS[index]?.id === previousId && MYSTIC_ROULETTE_OPTIONS.length > 1) {
    index = (index + 1) % MYSTIC_ROULETTE_OPTIONS.length;
  }
  return MYSTIC_ROULETTE_OPTIONS[index];
}

export function pickMicroTarot(seed, slot = 0) {
  const index = seededIndex(seed, MICRO_TAROT_CARDS.length, `tarot-${slot}`);
  return MICRO_TAROT_CARDS[index] || null;
}

function deterministicShuffle(values, seed, salt) {
  return [...values]
    .map((value, index) => ({ value, weight: hashSeed(`${seed}|${salt}|${index}`) }))
    .sort((left, right) => left.weight - right.weight)
    .map((entry) => entry.value);
}

export function assignDoors(seed) {
  const categories = ["opportunity", "warning", "unexpected"];
  const chosen = categories.map((category) => {
    const pool = DOOR_POOLS[category];
    const index = seededIndex(seed, pool.length, `door-${category}`);
    return { ...pool[index], category };
  });
  return deterministicShuffle(chosen, seed, "door-order");
}
