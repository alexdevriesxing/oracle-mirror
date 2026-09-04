import { daysBetweenDateKeys } from "./daily-ritual-core.js";

export const MIRROR_JOURNEY_STATE_VERSION = 1;
export const MIRROR_JOURNEY_MAX_ENTRIES = 90;
export const MIRROR_JOURNEY_MAX_REALM_VISITS = 180;

const REALM_PATHS = new Map([
  ["/crystal-ball", "crystal-ball"],
  ["/dream-interpreter", "dream-interpreter"],
  ["/western-zodiac", "western-zodiac"],
  ["/chinese-zodiac", "chinese-zodiac"],
  ["/tarot", "tarot"],
  ["/love-oracle", "love-oracle"],
  ["/love-match", "love-match"],
  ["/magic-8-ball", "magic8"],
  ["/numerology", "numerology"],
  ["/daily-fortune", "daily-fortune"],
  ["/birth-chart", "birthchart"],
  ["/palm-reading", "palmistry"],
  ["/iching-oracle", "iching"],
  ["/mystics", "personas"],
]);

function safeInteger(value, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

function safeText(value, maximum = 120) {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}

function normalizedEntry(input) {
  if (!input || typeof input !== "object") return null;
  const dateKey = safeText(input.dateKey, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const cardName = safeText(input.cardName, 80);
  if (!cardName) return null;
  return {
    dateKey,
    cardName,
    cardGlyph: safeText(input.cardGlyph, 8),
    moonName: safeText(input.moonName, 60),
    theme: safeText(input.theme, 120),
    mood: safeInteger(input.mood, 0, 100),
    love: safeInteger(input.love, 0, 100),
    money: safeInteger(input.money, 0, 100),
    recommendationRealm: safeText(input.recommendationRealm, 60),
    recommendationPath: safeText(input.recommendationPath, 120),
    recommendationTitle: safeText(input.recommendationTitle, 120),
    luckyNumber: safeInteger(input.luckyNumber, 1, 99),
    luckyColor: safeText(input.luckyColor, 60),
    element: safeText(input.element, 40),
  };
}

function normalizedVisit(input) {
  if (!input || typeof input !== "object") return null;
  const dateKey = safeText(input.dateKey, 10);
  const realm = safeText(input.realm, 60);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || !realm) return null;
  return { dateKey, realm };
}

function dedupeByKey(list, keyForItem) {
  const map = new Map();
  for (const item of list) map.set(keyForItem(item), item);
  return [...map.values()];
}

function addDays(dateKey, offset) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset, 12));
  return [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
}

export function realmForPath(pathname) {
  return REALM_PATHS.get(pathname) || "";
}

export function normalizeJourneyState(input) {
  const source = input && typeof input === "object" ? input : {};
  const entries = Array.isArray(source.entries)
    ? source.entries.map(normalizedEntry).filter(Boolean)
    : [];
  const realmVisits = Array.isArray(source.realmVisits)
    ? source.realmVisits.map(normalizedVisit).filter(Boolean)
    : [];

  return {
    version: MIRROR_JOURNEY_STATE_VERSION,
    entries: dedupeByKey(entries, (entry) => entry.dateKey)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(-MIRROR_JOURNEY_MAX_ENTRIES),
    realmVisits: dedupeByKey(realmVisits, (visit) => `${visit.dateKey}:${visit.realm}`)
      .sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      .slice(-MIRROR_JOURNEY_MAX_REALM_VISITS),
  };
}

export function mirrorEntryFromDailyMirror(mirror) {
  if (!mirror || typeof mirror !== "object") return null;
  return normalizedEntry({
    dateKey: mirror.dateKey,
    cardName: mirror.tarot?.name,
    cardGlyph: mirror.tarot?.glyph,
    moonName: mirror.moon?.name,
    theme: mirror.theme,
    mood: mirror.scores?.mood,
    love: mirror.scores?.love,
    money: mirror.scores?.money,
    recommendationRealm: mirror.recommendation?.realm,
    recommendationPath: mirror.recommendation?.path,
    recommendationTitle: mirror.recommendation?.title,
    luckyNumber: mirror.luckyNumber,
    luckyColor: mirror.luckyColor?.name,
    element: mirror.element,
  });
}

export function recordDailyMirror(input, mirror) {
  const state = normalizeJourneyState(input);
  const entry = mirrorEntryFromDailyMirror(mirror);
  if (!entry) return state;
  return normalizeJourneyState({
    ...state,
    entries: [...state.entries.filter((item) => item.dateKey !== entry.dateKey), entry],
  });
}

export function recordRealmVisit(input, dateKey, realm) {
  const state = normalizeJourneyState(input);
  const visit = normalizedVisit({ dateKey, realm });
  if (!visit) return state;
  return normalizeJourneyState({
    ...state,
    realmVisits: [...state.realmVisits, visit],
  });
}

export function journeyWindow(input, currentDateKey, days = 7) {
  const state = normalizeJourneyState(input);
  const count = Math.max(1, Math.min(31, Math.floor(days)));
  const entriesByDate = new Map(state.entries.map((entry) => [entry.dateKey, entry]));
  return Array.from({ length: count }, (_, index) => {
    const dateKey = addDays(currentDateKey, index - (count - 1));
    return { dateKey, entry: entriesByDate.get(dateKey) || null };
  });
}

export function collectionProgress(input) {
  const state = normalizeJourneyState(input);
  const latestByCard = new Map();
  for (const entry of state.entries) latestByCard.set(entry.cardName, entry);
  const collected = [...latestByCard.values()].sort((a, b) => b.dateKey.localeCompare(a.dateKey));
  return {
    collected,
    uniqueCards: collected.length,
    totalCards: 22,
    percent: Math.round((collected.length / 22) * 100),
  };
}

export function weeklyJourneySummary(input, currentDateKey) {
  const state = normalizeJourneyState(input);
  const window = journeyWindow(state, currentDateKey, 7);
  const entries = window.flatMap((slot) => slot.entry ? [slot.entry] : []);
  const visitRealms = new Set(
    state.realmVisits
      .filter((visit) => {
        const difference = daysBetweenDateKeys(visit.dateKey, currentDateKey);
        return difference !== null && difference >= 0 && difference <= 6;
      })
      .map((visit) => visit.realm)
  );

  const averages = entries.length
    ? {
        mood: Math.round(entries.reduce((sum, entry) => sum + entry.mood, 0) / entries.length),
        love: Math.round(entries.reduce((sum, entry) => sum + entry.love, 0) / entries.length),
        money: Math.round(entries.reduce((sum, entry) => sum + entry.money, 0) / entries.length),
      }
    : { mood: 0, love: 0, money: 0 };

  const strongestArea = Object.entries(averages)
    .sort((left, right) => right[1] - left[1])[0]?.[0] || "mood";

  const recommendationCounts = new Map();
  for (const entry of entries) {
    if (!entry.recommendationRealm) continue;
    recommendationCounts.set(entry.recommendationRealm, (recommendationCounts.get(entry.recommendationRealm) || 0) + 1);
  }
  const recurringRecommendation = [...recommendationCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))[0]?.[0] || "";

  return {
    completedDays: entries.length,
    availableDays: 7,
    averages,
    strongestArea,
    realmsExplored: visitRealms.size,
    recurringRecommendation,
    uniqueCardsInWindow: new Set(entries.map((entry) => entry.cardName)).size,
  };
}

export function realmQuestProgress(input, currentDateKey, goal = 3) {
  const summary = weeklyJourneySummary(input, currentDateKey);
  const target = Math.max(1, Math.floor(goal));
  return {
    current: Math.min(summary.realmsExplored, target),
    actual: summary.realmsExplored,
    target,
    complete: summary.realmsExplored >= target,
  };
}
