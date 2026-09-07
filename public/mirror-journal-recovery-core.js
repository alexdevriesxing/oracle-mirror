export const MIRROR_JOURNAL_BACKUP_FORMAT = "mirror-journal";
export const MIRROR_JOURNAL_RECOVERY_VERSION = 2;
export const MIRROR_JOURNAL_MAX_ENTRIES = 100;
export const MIRROR_JOURNAL_MAX_TAGS = 8;
export const MIRROR_JOURNAL_MAX_TAG_LENGTH = 24;
export const MIRROR_JOURNAL_MAX_NOTE_LENGTH = 2000;

function text(value) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

function cleanTag(value) {
  return text(value)
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

function cleanTags(value) {
  const source = Array.isArray(value) ? value : [];
  const tags = [];
  for (const item of source) {
    const tag = cleanTag(item);
    if (!tag || tags.includes(tag)) continue;
    tags.push(tag);
    if (tags.length >= MIRROR_JOURNAL_MAX_TAGS) break;
  }
  return tags;
}

function cleanNote(value) {
  return text(value).replace(/\r\n/g, "\n").trim().slice(0, MIRROR_JOURNAL_MAX_NOTE_LENGTH);
}

function validIso(value) {
  const candidate = text(value).trim();
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : "";
}

function validId(value) {
  const candidate = text(value).trim();
  return /^journal-[a-z0-9-]+$/i.test(candidate) ? candidate : "";
}

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function mirrorJournalFingerprint(entry) {
  return hashText([
    text(entry?.realm).trim(),
    validIso(entry?.date),
    text(entry?.question).trim(),
    text(entry?.answer).trim(),
  ].join("\u241f"));
}

function normalizedEntry(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;
  const realm = text(raw.realm).trim();
  const question = text(raw.question);
  const answer = text(raw.answer);
  const date = validIso(raw.date);
  if (!realm || !answer || !date) return null;
  const sourceJournal = raw.journal && typeof raw.journal === "object" ? raw.journal : {};
  const fallbackId = `journal-${mirrorJournalFingerprint({ realm, question, answer, date })}-${index.toString(36)}`;
  return {
    ...raw,
    realm,
    question,
    answer,
    date,
    journal: {
      version: MIRROR_JOURNAL_RECOVERY_VERSION,
      id: validId(sourceJournal.id) || fallbackId,
      favorite: sourceJournal.favorite === true,
      tags: cleanTags(sourceJournal.tags),
      note: cleanNote(sourceJournal.note),
      updatedAt: validIso(sourceJournal.updatedAt),
      followUp: sourceJournal.followUp === true,
      followedUpAt: validIso(sourceJournal.followedUpAt),
    },
  };
}

export function validateMirrorJournalBackup(input) {
  let parsed = input;
  if (typeof input === "string") {
    try { parsed = JSON.parse(input); } catch { return { ok: false, error: "invalid-json", entries: [] }; }
  }
  if (!parsed || typeof parsed !== "object") return { ok: false, error: "invalid-backup", entries: [] };
  if (parsed.format !== MIRROR_JOURNAL_BACKUP_FORMAT) return { ok: false, error: "wrong-format", entries: [] };
  if (!Array.isArray(parsed.entries)) return { ok: false, error: "missing-entries", entries: [] };
  if (parsed.entries.length > 1000) return { ok: false, error: "backup-too-large", entries: [] };

  const sourceVersion = Number.isFinite(Number(parsed.version)) ? Number(parsed.version) : 1;
  if (sourceVersion > MIRROR_JOURNAL_RECOVERY_VERSION) {
    return { ok: false, error: "unsupported-version", entries: [], sourceVersion };
  }

  const entries = [];
  let rejected = 0;
  for (let index = 0; index < parsed.entries.length; index += 1) {
    const entry = normalizedEntry(parsed.entries[index], index);
    if (!entry) { rejected += 1; continue; }
    entries.push(entry);
  }
  if (!entries.length && parsed.entries.length) return { ok: false, error: "no-valid-entries", entries: [], rejected };
  return {
    ok: true,
    error: "",
    entries,
    rejected,
    sourceVersion,
    exportedAt: validIso(parsed.exportedAt),
  };
}

function mergeTags(local, incoming) {
  return cleanTags([...(local || []), ...(incoming || [])]);
}

function mergeDuplicate(local, incoming) {
  const localJournal = local.journal || {};
  const incomingJournal = incoming.journal || {};
  return {
    ...local,
    journal: {
      ...localJournal,
      version: MIRROR_JOURNAL_RECOVERY_VERSION,
      id: validId(localJournal.id) || validId(incomingJournal.id),
      favorite: localJournal.favorite === true || incomingJournal.favorite === true,
      tags: mergeTags(localJournal.tags, incomingJournal.tags),
      note: cleanNote(localJournal.note) || cleanNote(incomingJournal.note),
      updatedAt: validIso(localJournal.updatedAt) || validIso(incomingJournal.updatedAt),
      followUp: localJournal.followUp === true || incomingJournal.followUp === true,
      followedUpAt: validIso(localJournal.followedUpAt) || validIso(incomingJournal.followedUpAt),
    },
  };
}

export function mergeMirrorJournalBackup(localEntries, backupEntries) {
  const local = (Array.isArray(localEntries) ? localEntries : [])
    .map((entry, index) => normalizedEntry(entry, index))
    .filter(Boolean)
    .slice(0, MIRROR_JOURNAL_MAX_ENTRIES);
  const incoming = (Array.isArray(backupEntries) ? backupEntries : [])
    .map((entry, index) => normalizedEntry(entry, index))
    .filter(Boolean)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  // Existing browser entries are authoritative and must never be displaced by restore.
  const result = [...local];
  const byId = new Map();
  const byFingerprint = new Map();
  const seenIncomingIds = new Set();
  const seenIncomingFingerprints = new Set();
  result.forEach((entry, index) => {
    byId.set(entry.journal.id, index);
    byFingerprint.set(mirrorJournalFingerprint(entry), index);
  });

  let added = 0;
  let duplicates = 0;
  let enriched = 0;
  let truncated = 0;
  for (const entry of incoming) {
    const fingerprint = mirrorJournalFingerprint(entry);
    const match = byId.get(entry.journal.id) ?? byFingerprint.get(fingerprint);
    if (match !== undefined) {
      duplicates += 1;
      const before = JSON.stringify(result[match].journal);
      result[match] = mergeDuplicate(result[match], entry);
      if (JSON.stringify(result[match].journal) !== before) enriched += 1;
      seenIncomingIds.add(entry.journal.id);
      seenIncomingFingerprints.add(fingerprint);
      continue;
    }

    // Duplicate records inside the backup itself should never consume capacity twice.
    if (seenIncomingIds.has(entry.journal.id) || seenIncomingFingerprints.has(fingerprint)) {
      duplicates += 1;
      continue;
    }
    seenIncomingIds.add(entry.journal.id);
    seenIncomingFingerprints.add(fingerprint);

    if (result.length >= MIRROR_JOURNAL_MAX_ENTRIES) {
      truncated += 1;
      continue;
    }
    result.push(entry);
    const index = result.length - 1;
    byId.set(entry.journal.id, index);
    byFingerprint.set(fingerprint, index);
    added += 1;
  }

  result.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  return { entries: result, summary: { added, duplicates, enriched, truncated } };
}

export function markMirrorJournalFollowUp(entries, id, followUp, now = new Date()) {
  const stamp = now instanceof Date && Number.isFinite(now.getTime()) ? now.toISOString() : new Date().toISOString();
  return (Array.isArray(entries) ? entries : []).map((raw, index) => {
    const entry = normalizedEntry(raw, index);
    if (!entry || entry.journal.id !== id) return raw;
    return {
      ...entry,
      journal: {
        ...entry.journal,
        followUp: followUp === true,
        followedUpAt: followUp === true ? "" : stamp,
        updatedAt: stamp,
      },
    };
  });
}

function dateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function periodBounds(period, anchor) {
  const date = anchor instanceof Date && Number.isFinite(anchor.getTime()) ? new Date(anchor) : new Date();
  date.setHours(0, 0, 0, 0);
  if (period === "month") return { start: new Date(date.getFullYear(), date.getMonth(), 1), end: new Date(date.getFullYear(), date.getMonth() + 1, 1) };
  const offset = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(start.getDate() - offset);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return { start, end };
}

function topCounts(map, limit = 3) {
  return [...map.entries()].sort((a, b) => b[1] - a[1] || String(a[0]).localeCompare(String(b[0]))).slice(0, limit);
}

export function mirrorJournalInsights(entries, options = {}) {
  const period = options.period === "month" ? "month" : "week";
  const { start, end } = periodBounds(period, options.anchorDate);
  const selected = (Array.isArray(entries) ? entries : []).map((entry, index) => normalizedEntry(entry, index)).filter(Boolean).filter((entry) => {
    const time = Date.parse(entry.date);
    return time >= start.getTime() && time < end.getTime();
  });
  const realms = new Map();
  const tags = new Map();
  const activeDays = new Set();
  const weekdays = new Map();
  let favorites = 0;
  let notes = 0;
  let pendingFollowUps = 0;
  for (const entry of selected) {
    realms.set(entry.realm, (realms.get(entry.realm) || 0) + 1);
    for (const tag of entry.journal.tags) tags.set(tag, (tags.get(tag) || 0) + 1);
    const date = new Date(entry.date);
    activeDays.add(dateKey(date));
    const weekday = date.getDay();
    weekdays.set(weekday, (weekdays.get(weekday) || 0) + 1);
    if (entry.journal.favorite) favorites += 1;
    if (entry.journal.note) notes += 1;
    if (entry.journal.followUp) pendingFollowUps += 1;
  }
  const busiest = topCounts(weekdays, 1)[0];
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return {
    period,
    start: dateKey(start),
    endExclusive: dateKey(end),
    readings: selected.length,
    activeDays: activeDays.size,
    favorites,
    notes,
    pendingFollowUps,
    topRealms: topCounts(realms),
    recurringRealms: topCounts(new Map([...realms].filter(([, count]) => count >= 2))),
    topTags: topCounts(tags, 5),
    recurringTags: topCounts(new Map([...tags].filter(([, count]) => count >= 2)), 5),
    busiestWeekday: busiest ? weekdayNames[busiest[0]] : "",
  };
}
