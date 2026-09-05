export const TRIGRAMS = Object.freeze([
  { slug: "qian", name: "Heaven", glyph: "☰", bits: "111" },
  { slug: "dui", name: "Lake", glyph: "☱", bits: "110" },
  { slug: "li", name: "Fire", glyph: "☲", bits: "101" },
  { slug: "zhen", name: "Thunder", glyph: "☳", bits: "100" },
  { slug: "xun", name: "Wind", glyph: "☴", bits: "011" },
  { slug: "kan", name: "Water", glyph: "☵", bits: "010" },
  { slug: "gen", name: "Mountain", glyph: "☶", bits: "001" },
  { slug: "kun", name: "Earth", glyph: "☷", bits: "000" },
]);

export const KING_WEN_MATRIX = Object.freeze({
  qian: { qian: 1, dui: 43, li: 14, zhen: 34, xun: 9, kan: 5, gen: 26, kun: 11 },
  dui: { qian: 10, dui: 58, li: 38, zhen: 54, xun: 61, kan: 60, gen: 41, kun: 19 },
  li: { qian: 13, dui: 49, li: 30, zhen: 55, xun: 37, kan: 63, gen: 22, kun: 36 },
  zhen: { qian: 25, dui: 17, li: 21, zhen: 51, xun: 42, kan: 3, gen: 27, kun: 24 },
  xun: { qian: 44, dui: 28, li: 50, zhen: 32, xun: 57, kan: 48, gen: 18, kun: 46 },
  kan: { qian: 6, dui: 47, li: 64, zhen: 40, xun: 59, kan: 29, gen: 4, kun: 7 },
  gen: { qian: 33, dui: 31, li: 56, zhen: 62, xun: 53, kan: 39, gen: 52, kun: 15 },
  kun: { qian: 12, dui: 45, li: 35, zhen: 16, xun: 20, kan: 8, gen: 23, kun: 2 },
});

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed = "") {
  let state = hashString(String(seed)) || 0x9e3779b9;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function trigramForBits(bits) {
  return TRIGRAMS.find((item) => item.bits === bits);
}

function numberForBits(bits) {
  if (!Array.isArray(bits) || bits.length !== 6) return null;
  const lower = trigramForBits(bits.slice(0, 3).join(""));
  const upper = trigramForBits(bits.slice(3, 6).join(""));
  if (!lower || !upper) return null;
  return KING_WEN_MATRIX[lower.slug]?.[upper.slug] ?? null;
}

export function lineFromValue(value, position) {
  if (![6, 7, 8, 9].includes(value)) throw new Error("I Ching line value must be 6, 7, 8, or 9.");
  const yang = value === 7 || value === 9;
  const changing = value === 6 || value === 9;
  return {
    position,
    value,
    yang,
    changing,
    transformedYang: changing ? !yang : yang,
    label: value === 6 ? "Old Yin · changing" : value === 7 ? "Young Yang · stable" : value === 8 ? "Young Yin · stable" : "Old Yang · changing",
  };
}

export function castFromValues(values) {
  if (!Array.isArray(values) || values.length !== 6) throw new Error("A hexagram requires six line values.");
  const lines = values.map((value, index) => lineFromValue(value, index + 1));
  const currentBits = lines.map((line) => line.yang ? 1 : 0);
  const transformedBits = lines.map((line) => line.transformedYang ? 1 : 0);
  const currentNumber = numberForBits(currentBits);
  const transformedNumber = numberForBits(transformedBits);
  if (!currentNumber || !transformedNumber) throw new Error("Unable to resolve hexagram.");
  const lower = trigramForBits(currentBits.slice(0, 3).join(""));
  const upper = trigramForBits(currentBits.slice(3, 6).join(""));
  return {
    values: [...values],
    lines,
    currentNumber,
    transformedNumber,
    lower,
    upper,
    changingLines: lines.filter((line) => line.changing).map((line) => line.position),
    hasChanges: lines.some((line) => line.changing),
  };
}

export function castIChing(seed = `${Date.now()}-${Math.random()}`) {
  const random = seededRandom(seed);
  const values = Array.from({ length: 6 }, () => {
    let sum = 0;
    for (let coin = 0; coin < 3; coin += 1) sum += random() < 0.5 ? 2 : 3;
    return sum;
  });
  return castFromValues(values);
}
