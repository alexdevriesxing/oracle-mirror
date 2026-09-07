import { normalizeJourneyState } from "./mirror-journey-core.js";

const MAX_MONTHS = 12;
const MAX_ON_THIS_DAY = 6;
const MAX_FOLLOW_UPS = 100;

function text(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function validDate(value) {
  const candidate = text(value).trim();
  if (!candidate || !Number.isFinite(Date.parse(candidate))) return null;
  const date = new Date(candidate);
  return Number.isFinite(date.getTime()) ? date : null;
}

function validJournalId(value) {
  const candidate = text(value).trim();
  return /^journal-[a-z0-9-]+$/i.test(candidate) ? candidate : "";
}

function cleanTags(value) {
  if (!Array.isArray(value)) return [];
  const tags = [];
  for (const raw of value) {
    const tag = text(raw).trim().toLowerCase().slice(0, 24);
    if (!tag || tags.includes(tag)) continue;
    tags.push(tag);
    if (tags.length >= 8) break;
  }
  return tags;
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function addMonths(date, offset) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1, 12);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

function addDays(date, offset) {
  const next = startOfDay(date);
  next.setDate(next.getDate() + offset);
  return next;
}

function daysBetween(earlier, later) {
  const a = Date.UTC(earlier.getFullYear(), earlier.getMonth(), earlier.getDate(), 12);
  const b = Date.UTC(later.getFullYear(), later.getMonth(), later.getDate(), 12);
  return Math.max(0, Math.round((b - a) / 86400000));
}

function structuralEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const date = validDate(raw.date);
  const journal = raw.journal && typeof raw.journal === "object" ? raw.journal : {};
  const id = validJournalId(journal.id);
  const realm = text(raw.realm).trim();
  if (!date || !id || !realm) return null;
  return {
    id,
    date,
    dateKey: dateKey(date),
    monthKey: monthKey(date),
    realm,
    favorite: journal.favorite === true,
    tags: cleanTags(journal.tags),
    hasNote: typeof journal.note === "string" && journal.note.trim().length > 0,
    followUp: journal.followUp === true,
    followedUpAt: validDate(journal.followedUpAt),
  };
}

function structuralEntries(entries) {
  return (Array.isArray(entries) ? entries : []).map(structuralEntry).filter(Boolean);
}

function topCount(map) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0])))[0] || null;
}

function monthSnapshot(entries, start) {
  const key = monthKey(start);
  const selected = entries.filter((entry) => entry.monthKey === key);
  const activeDays = new Set();
  const realms = new Map();
  const tags = new Map();
  let favorites = 0;
  let notes = 0;
  let followUps = 0;
  for (const entry of selected) {
    activeDays.add(entry.dateKey);
    realms.set(entry.realm, (realms.get(entry.realm) || 0) + 1);
    for (const tag of entry.tags) tags.set(tag, (tags.get(tag) || 0) + 1);
    if (entry.favorite) favorites += 1;
    if (entry.hasNote) notes += 1;
    if (entry.followUp) followUps += 1;
  }
  return {
    key,
    readings: selected.length,
    activeDays: activeDays.size,
    favorites,
    notes,
    followUps,
    topRealm: topCount(realms),
    topTag: topCount(tags),
  };
}

function delta(current, previous) {
  const change = current - previous;
  return { current, previous, change, direction: change > 0 ? "up" : change < 0 ? "down" : "flat" };
}

export function journalMonthComparison(entries, anchorDate = new Date()) {
  const anchor = anchorDate instanceof Date && Number.isFinite(anchorDate.getTime()) ? anchorDate : new Date();
  const normalized = structuralEntries(entries);
  const currentStart = startOfMonth(anchor);
  const previousStart = addMonths(currentStart, -1);
  const current = monthSnapshot(normalized, currentStart);
  const previous = monthSnapshot(normalized, previousStart);
  return {
    current,
    previous,
    readings: delta(current.readings, previous.readings),
    activeDays: delta(current.activeDays, previous.activeDays),
    favorites: delta(current.favorites, previous.favorites),
    notes: delta(current.notes, previous.notes),
    followUps: delta(current.followUps, previous.followUps),
  };
}

export function journalMonthlyTrend(entries, anchorDate = new Date(), months = 6) {
  const anchor = anchorDate instanceof Date && Number.isFinite(anchorDate.getTime()) ? anchorDate : new Date();
  const count = Math.max(2, Math.min(MAX_MONTHS, Math.floor(months) || 6));
  const normalized = structuralEntries(entries);
  const currentStart = startOfMonth(anchor);
  const series = [];
  for (let offset = -(count - 1); offset <= 0; offset += 1) {
    series.push(monthSnapshot(normalized, addMonths(currentStart, offset)));
  }
  let activeMonths = 0;
  for (const month of series) if (month.readings > 0) activeMonths += 1;
  let currentStreakMonths = 0;
  for (let index = series.length - 1; index >= 0; index -= 1) {
    if (!series[index].readings) break;
    currentStreakMonths += 1;
  }
  return { months: series, activeMonths, currentStreakMonths };
}

export function journalFollowUpDashboard(entries, anchorDate = new Date()) {
  const anchor = anchorDate instanceof Date && Number.isFinite(anchorDate.getTime()) ? anchorDate : new Date();
  const normalized = structuralEntries(entries);
  const pending = normalized
    .filter((entry) => entry.followUp)
    .map((entry) => ({
      id: entry.id,
      realm: entry.realm,
      dateKey: entry.dateKey,
      ageDays: daysBetween(entry.date, anchor),
      favorite: entry.favorite,
      tags: entry.tags,
    }))
    .sort((a, b) => b.ageDays - a.ageDays || a.dateKey.localeCompare(b.dateKey))
    .slice(0, MAX_FOLLOW_UPS);
  const buckets = { fresh: 0, aging: 0, longstanding: 0 };
  for (const item of pending) {
    if (item.ageDays < 7) buckets.fresh += 1;
    else if (item.ageDays < 30) buckets.aging += 1;
    else buckets.longstanding += 1;
  }
  const completed = normalized.filter((entry) => !entry.followUp && entry.followedUpAt).length;
  return {
    pending,
    pendingCount: pending.length,
    completedCount: completed,
    oldestAgeDays: pending[0]?.ageDays || 0,
    buckets,
  };
}

export function journalOnThisDay(entries, anchorDate = new Date()) {
  const anchor = anchorDate instanceof Date && Number.isFinite(anchorDate.getTime()) ? anchorDate : new Date();
  const month = anchor.getMonth();
  const day = anchor.getDate();
  const year = anchor.getFullYear();
  return structuralEntries(entries)
    .filter((entry) => entry.date.getMonth() === month && entry.date.getDate() === day && entry.date.getFullYear() < year)
    .sort((a, b) => b.date.getFullYear() - a.date.getFullYear())
    .slice(0, MAX_ON_THIS_DAY)
    .map((entry) => ({
      id: entry.id,
      year: entry.date.getFullYear(),
      realm: entry.realm,
      dateKey: entry.dateKey,
      favorite: entry.favorite,
      tags: entry.tags,
    }));
}

export function journalJourneyBridge(entries, journeyInput, anchorDate = new Date(), days = 30) {
  const anchor = anchorDate instanceof Date && Number.isFinite(anchorDate.getTime()) ? anchorDate : new Date();
  const count = Math.max(7, Math.min(90, Math.floor(days) || 30));
  const start = addDays(anchor, -(count - 1));
  const startKey = dateKey(start);
  const endKey = dateKey(anchor);
  const journal = structuralEntries(entries).filter((entry) => entry.dateKey >= startKey && entry.dateKey <= endKey);
  const journey = normalizeJourneyState(journeyInput);
  const journeyEntries = journey.entries.filter((entry) => entry.dateKey >= startKey && entry.dateKey <= endKey);
  const realmVisits = journey.realmVisits.filter((visit) => visit.dateKey >= startKey && visit.dateKey <= endKey);
  const journalDays = new Set(journal.map((entry) => entry.dateKey));
  const journeyDays = new Set(journeyEntries.map((entry) => entry.dateKey));
  const pairedDays = [...journalDays].filter((key) => journeyDays.has(key));
  const journalRealms = new Set(journal.map((entry) => entry.realm));
  const journeyRealms = new Set(realmVisits.map((visit) => visit.realm));
  const sharedRealms = [...journalRealms].filter((realm) => journeyRealms.has(realm)).sort();
  return {
    windowDays: count,
    start: startKey,
    end: endKey,
    journalDays: journalDays.size,
    journeyDays: journeyDays.size,
    pairedDays: pairedDays.length,
    journalOnlyDays: [...journalDays].filter((key) => !journeyDays.has(key)).length,
    journeyOnlyDays: [...journeyDays].filter((key) => !journalDays.has(key)).length,
    journalRealms: journalRealms.size,
    journeyRealms: journeyRealms.size,
    sharedRealms,
    uniqueJourneyCards: new Set(journeyEntries.map((entry) => entry.cardName)).size,
  };
}

export function journalReflectionPrompts({ comparison, followUps, onThisDay, journeyBridge } = {}) {
  const prompts = [];
  const push = (id, title, prompt) => {
    if (prompts.some((item) => item.id === id)) return;
    prompts.push({ id, title, prompt });
  };

  if (followUps?.pendingCount) {
    push("follow-up", "Close one loop", "Choose one pending follow-up and ask: what has changed since the day you saved it?");
  }
  if (onThisDay?.length) {
    push("anniversary", "Compare across time", "A reading from this date has resurfaced. What feels different now, and what still feels familiar?");
  }
  if (comparison?.current?.topRealm?.[0]) {
    const realm = comparison.current.topRealm[0].replace(/[-_]+/g, " ");
    push("realm", "Notice your returning lens", `You returned most often to ${realm} this month. What keeps making that lens useful to you?`);
  }
  if (comparison?.readings?.direction === "up") {
    push("pace-up", "Review the faster month", "You saved more readings this month than last month. Which of them actually deserves a second look?");
  } else if (comparison?.readings?.direction === "down") {
    push("pace-down", "Notice the quieter month", "You saved fewer readings this month. Was the quieter pace deliberate, or did your attention simply move elsewhere?");
  }
  if (journeyBridge?.pairedDays >= 3) {
    push("bridge", "Connect ritual and journal", "Your Daily Mirror and Journal overlapped on several days. What made those particular days worth recording twice?");
  }
  if (!prompts.length) {
    push("start", "Begin a retrospective", "Pick one saved reading from this month and ask: what did I understand differently after some time had passed?");
  }
  return prompts.slice(0, 4);
}
