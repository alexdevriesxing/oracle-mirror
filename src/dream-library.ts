import { DREAM_SYMBOLS as CORE_DREAM_SYMBOLS } from "./dream-data.ts";
import type { DreamSymbol } from "./dream-data.ts";
import { DREAM_THEME_META, EXPANDED_DREAM_SEEDS } from "./dream-expanded-data.ts";

export type DreamThemeSlug = keyof typeof DREAM_THEME_META;
export type DreamLibrarySymbol = DreamSymbol & { category: DreamThemeSlug };

const CORE_CATEGORIES: Record<string, DreamThemeSlug> = {
  falling: "nightmares",
  flying: "travel",
  teeth: "body",
  chased: "nightmares",
  water: "nature",
  death: "nightmares",
  naked: "body",
  snake: "animals",
  baby: "relationships",
  house: "places",
  exam: "work-success",
  lost: "travel",
  fire: "nature",
  "flying-animals": "animals",
  money: "work-success",
};

const titleLower = (title: string) => title.toLowerCase().replace(/^a /, "").replace(/^being /, "");

function seedToSymbol(seed: (typeof EXPANDED_DREAM_SEEDS)[number]): DreamLibrarySymbol {
  const subject = titleLower(seed.title);
  return {
    symbol: seed.slug,
    title: seed.title,
    aliases: seed.aliases,
    category: seed.category as DreamThemeSlug,
    meaning: `Dreaming of ${subject} commonly centers on ${seed.theme}. Treat the image as a reflection prompt rather than a prediction.`,
    frameworks: {
      jungian: `In a Jungian-style reading, ${subject} can concentrate themes of ${seed.theme}, especially when the image feels unusually vivid or autonomous.`,
      freudian: `A psychodynamic or Freudian lens would ask what personal wish, conflict, inhibition, memory, or association is condensed into the image of ${subject}, rather than assign it one universal code.`,
      emotional: `${seed.title} dreams often bring attention to ${seed.theme}. The feeling in the dream and the dreamer's waking context matter more than a fixed dictionary answer.`,
      cultural: `Folklore around ${subject} varies by culture and period. Traditional associations can enrich reflection, but they should not be treated as literal forecasts or universal rules.`,
    },
    questionHints: [
      `What was the ${subject} doing, and how did you feel around it?`,
      `What does ${subject} personally remind you of in waking life?`,
    ],
  };
}

const core: DreamLibrarySymbol[] = CORE_DREAM_SYMBOLS.map((symbol) => ({
  ...symbol,
  category: CORE_CATEGORIES[symbol.symbol] ?? "objects",
}));
const expanded = EXPANDED_DREAM_SEEDS.map(seedToSymbol);
const seen = new Set(core.map((symbol) => symbol.symbol));

export const DREAM_SYMBOLS: DreamLibrarySymbol[] = [
  ...core,
  ...expanded.filter((symbol) => !seen.has(symbol.symbol)),
];

export { DREAM_THEME_META };

export function dreamThemes(): Array<{ slug: DreamThemeSlug; title: string; description: string; count: number }> {
  return Object.entries(DREAM_THEME_META).map(([slug, meta]) => ({
    slug: slug as DreamThemeSlug,
    title: meta.title,
    description: meta.description,
    count: DREAM_SYMBOLS.filter((symbol) => symbol.category === slug).length,
  }));
}

export function symbolsForDreamTheme(theme: string): DreamLibrarySymbol[] {
  return DREAM_SYMBOLS.filter((symbol) => symbol.category === theme);
}

function normalizeText(value: string): string {
  return ` ${value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim()} `;
}

const SYMBOL_INDEX = DREAM_SYMBOLS.flatMap((symbol) =>
  [symbol.symbol.replace(/-/g, " "), symbol.title, ...symbol.aliases]
    .map((alias) => alias.trim().toLowerCase())
    .filter((alias) => alias.length >= 3)
    .map((needle) => ({ needle: normalizeText(needle).trim(), symbol }))
).sort((a, b) => b.needle.length - a.needle.length);

function phraseMatches(haystack: string, needle: string): boolean {
  if (haystack.includes(` ${needle} `)) return true;
  const words = needle.split(/\s+/).filter((word) => word.length >= 4);
  if (words.length < 2) return false;
  let cursor = 0;
  for (const word of words) {
    const token = ` ${word} `;
    const index = haystack.indexOf(token, cursor);
    if (index < 0) return false;
    cursor = index + token.length - 1;
  }
  return true;
}

export function retrieveDreamKnowledge(dreamText: string, limit = 6): DreamLibrarySymbol[] {
  if (!dreamText || limit <= 0) return [];
  const haystack = normalizeText(dreamText);
  const matched: DreamLibrarySymbol[] = [];
  const seenSymbols = new Set<string>();
  for (const { needle, symbol } of SYMBOL_INDEX) {
    if (seenSymbols.has(symbol.symbol)) continue;
    if (phraseMatches(haystack, needle)) {
      matched.push(symbol);
      seenSymbols.add(symbol.symbol);
      if (matched.length >= Math.min(limit, 8)) break;
    }
  }
  return matched;
}

export function buildDreamGrounding(symbols: DreamLibrarySymbol[]): string {
  if (symbols.length === 0) return "";
  const lore = symbols.map((s) => `- ${s.title}: ${s.meaning} Emotional context: ${s.frameworks.emotional}`).join("\n");
  return `Dream-symbol context relevant to this dream. Use it as optional reflective context, not as a diagnosis or prediction. Personal associations and the dream's emotional tone take priority. Never present a symbol as having one fixed meaning:\n${lore}`;
}

export function dreamQuestionHints(symbols: DreamLibrarySymbol[]): string[] {
  return symbols.flatMap((symbol) => symbol.questionHints).slice(0, 8);
}

export function relatedDreamSymbols(symbol: DreamLibrarySymbol, limit = 6): DreamLibrarySymbol[] {
  const sameTheme = DREAM_SYMBOLS.filter((candidate) => candidate.category === symbol.category && candidate.symbol !== symbol.symbol);
  const needles = new Set(symbol.meaning.toLowerCase().split(/\W+/).filter((word) => word.length > 5));
  return sameTheme
    .map((candidate) => ({ candidate, score: candidate.meaning.toLowerCase().split(/\W+/).filter((word) => needles.has(word)).length }))
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}
