export const MIRROR_JOURNAL_VERSION = 1;
export const MIRROR_JOURNAL_ARCHIVE_KEY = "oracle-mirror-archive";
export const MIRROR_JOURNAL_MAX_ENTRIES = 100;
export const MIRROR_JOURNAL_MAX_NOTE_LENGTH = 2000;
export const MIRROR_JOURNAL_MAX_TAGS = 8;
export const MIRROR_JOURNAL_MAX_TAG_LENGTH = 24;

function asString(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function validDateString(value) {
  const text = asString(value).trim();
  return text && Number.isFinite(Date.parse(text)) ? text : "";
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function normalizeJournalText(value) {
  return asString(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeJournalTag(value) {
  return asString(value)
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/^#+/, "")
    .replace(/[^\p{L}\p{N} _-]+/gu, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MIRROR_JOURNAL_MAX_TAG_LENGTH);
}

export function parseJournalTags(value) {
  const input = Array.isArray(value) ? value : asString(value).split(/[,\n]+/);
  const tags = [];
  for (const item of input) {
    const tag = normalizeJournalTag(item);
    if (!tag || tags.includes(tag)) continue;
    tags.push(tag);
    if (tags.length >= MIRROR_JOURNAL_MAX_TAGS) break;
  }
  return tags;
}

export function normalizeJournalNote(value) {
  return asString(value).replace(/\r\n/g, "\n").trim().slice(0, MIRROR_JOURNAL_MAX_NOTE_LENGTH);
}

export function journalEntryId(entry, index = 0) {
  const date = validDateString(entry?.date) || "undated";
  const fingerprint = [entry?.realm, date, entry?.question, entry?.answer, index].map(asString).join("\u241f");
  return `journal-${hashText(fingerprint)}`;
}

function normalizeJournalMeta(entry, index) {
  const current = entry && typeof entry.journal === "object" && entry.journal ? entry.journal : {};
  const id = typeof current.id === "string" && /^journal-[a-z0-9]+$/i.test(current.id)
    ? current.id
    : journalEntryId(entry, index);
  return {
    version: MIRROR_JOURNAL_VERSION,
    id,
    favorite: current.favorite === true,
    tags: parseJournalTags(current.tags),
    note: normalizeJournalNote(current.note),
    updatedAt: validDateString(current.updatedAt),
  };
}

export function migrateMirrorJournal(raw) {
  const input = Array.isArray(raw) ? raw : [];
  const entries = input
    .filter((entry) => entry && typeof entry === "object")
    .slice(0, MIRROR_JOURNAL_MAX_ENTRIES)
    .map((entry, index) => ({ ...entry, journal: normalizeJournalMeta(entry, index) }));
  const source = input.filter((entry) => entry && typeof entry === "object").slice(0, MIRROR_JOURNAL_MAX_ENTRIES);
  return {
    entries,
    changed: JSON.stringify(entries) !== JSON.stringify(source),
  };
}

export function readMirrorJournal(storage) {
  if (!storage || typeof storage.getItem !== "function") return { entries: [], migrated: false, error: "storage-unavailable" };
  try {
    const parsed = JSON.parse(storage.getItem(MIRROR_JOURNAL_ARCHIVE_KEY) || "[]");
    const migrated = migrateMirrorJournal(parsed);
    if (migrated.changed && typeof storage.setItem === "function") {
      storage.setItem(MIRROR_JOURNAL_ARCHIVE_KEY, JSON.stringify(migrated.entries));
    }
    return { entries: migrated.entries, migrated: migrated.changed, error: "" };
  } catch {
    return { entries: [], migrated: false, error: "storage-invalid" };
  }
}

export function writeMirrorJournal(entries, storage) {
  if (!storage || typeof storage.setItem !== "function") return false;
  try {
    const migrated = migrateMirrorJournal(entries);
    storage.setItem(MIRROR_JOURNAL_ARCHIVE_KEY, JSON.stringify(migrated.entries));
    return true;
  } catch {
    return false;
  }
}

export function updateMirrorJournalEntry(entries, id, patch = {}, now = new Date()) {
  const updatedAt = now instanceof Date && Number.isFinite(now.getTime()) ? now.toISOString() : new Date().toISOString();
  return migrateMirrorJournal(entries).entries.map((entry) => {
    if (entry.journal.id !== id) return entry;
    const journal = {
      ...entry.journal,
      favorite: typeof patch.favorite === "boolean" ? patch.favorite : entry.journal.favorite,
      tags: Object.prototype.hasOwnProperty.call(patch, "tags") ? parseJournalTags(patch.tags) : entry.journal.tags,
      note: Object.prototype.hasOwnProperty.call(patch, "note") ? normalizeJournalNote(patch.note) : entry.journal.note,
      updatedAt,
    };
    return { ...entry, journal };
  });
}

export function deleteMirrorJournalEntry(entries, id) {
  return migrateMirrorJournal(entries).entries.filter((entry) => entry.journal.id !== id);
}

export function mirrorJournalEntryDate(entry) {
  const date = validDateString(entry?.date);
  return date ? new Date(date) : null;
}

export function mirrorJournalDateKey(entry) {
  const date = mirrorJournalEntryDate(entry);
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function entrySearchText(entry) {
  return normalizeJournalText([
    entry.realm,
    entry.question,
    entry.answer,
    entry.journal?.note,
    ...(entry.journal?.tags || []),
  ].map(asString).join(" "));
}

export function filterMirrorJournal(entries, options = {}) {
  const query = normalizeJournalText(options.query);
  const tokens = [...new Set(query.split(" ").filter(Boolean))];
  const realm = asString(options.realm || "all");
  const tag = normalizeJournalTag(options.tag || "");
  const favoritesOnly = options.favoritesOnly === true;
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(asString(options.dateKey)) ? asString(options.dateKey) : "";
  const sort = options.sort === "oldest" ? "oldest" : "newest";

  const filtered = migrateMirrorJournal(entries).entries.filter((entry) => {
    if (realm !== "all" && asString(entry.realm) !== realm) return false;
    if (tag && !(entry.journal.tags || []).includes(tag)) return false;
    if (favoritesOnly && !entry.journal.favorite) return false;
    if (dateKey && mirrorJournalDateKey(entry) !== dateKey) return false;
    if (tokens.length) {
      const haystack = entrySearchText(entry);
      if (!tokens.every((token) => haystack.includes(token))) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    const aTime = mirrorJournalEntryDate(a)?.getTime() || 0;
    const bTime = mirrorJournalEntryDate(b)?.getTime() || 0;
    return sort === "oldest" ? aTime - bTime : bTime - aTime;
  });
}

export function mirrorJournalFacets(entries) {
  const migrated = migrateMirrorJournal(entries).entries;
  const realmCounts = new Map();
  const tagCounts = new Map();
  for (const entry of migrated) {
    const realm = asString(entry.realm).trim() || "Unknown Realm";
    realmCounts.set(realm, (realmCounts.get(realm) || 0) + 1);
    for (const tag of entry.journal.tags || []) tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
  }
  return {
    realms: [...realmCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    tags: [...tagCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
  };
}

export function mirrorJournalStats(entries) {
  const migrated = migrateMirrorJournal(entries).entries;
  const realms = new Set();
  let favorites = 0;
  let notes = 0;
  let tagged = 0;
  for (const entry of migrated) {
    if (entry.realm) realms.add(entry.realm);
    if (entry.journal.favorite) favorites += 1;
    if (entry.journal.note) notes += 1;
    if (entry.journal.tags.length) tagged += 1;
  }
  return { total: migrated.length, favorites, notes, tagged, realms: realms.size };
}

export function mirrorJournalCalendar(entries, year, monthIndex) {
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex) || monthIndex < 0 || monthIndex > 11) return [];
  const days = new Map();
  for (const entry of migrateMirrorJournal(entries).entries) {
    const date = mirrorJournalEntryDate(entry);
    if (!date || date.getFullYear() !== year || date.getMonth() !== monthIndex) continue;
    const day = date.getDate();
    const current = days.get(day) || { day, count: 0, favorites: 0 };
    current.count += 1;
    if (entry.journal.favorite) current.favorites += 1;
    days.set(day, current);
  }
  return [...days.values()].sort((a, b) => a.day - b.day);
}

export function mirrorJournalExport(entries, exportedAt = new Date()) {
  const date = exportedAt instanceof Date && Number.isFinite(exportedAt.getTime()) ? exportedAt : new Date();
  return {
    product: "Oracle Mirror",
    format: "mirror-journal",
    version: MIRROR_JOURNAL_VERSION,
    exportedAt: date.toISOString(),
    storage: "local-browser",
    entries: migrateMirrorJournal(entries).entries,
  };
}
