export function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function referenceResultPath(entry) {
  const path = String(entry?.path || "");
  if (entry?.system !== "I Ching" || !path.startsWith("/iching/hexagrams/")) return path;
  const slug = path.slice("/iching/hexagrams/".length);
  if (/^\d+(?:-|$)/.test(slug)) return path;
  const match = String(entry?.title || "").match(/^Hexagram\s+(\d+)\b/i);
  return match ? `/iching/hexagrams/${match[1]}-${slug}` : path;
}

function normalizedEntry(entry) {
  const title = normalizeSearchText(entry.title);
  const system = normalizeSearchText(entry.system);
  const summary = normalizeSearchText(entry.summary);
  const keywords = normalizeSearchText((entry.keywords || []).join(" "));
  const themes = normalizeSearchText((entry.themes || []).join(" "));
  const path = normalizeSearchText(referenceResultPath(entry).replace(/[-/]/g, " "));
  return { title, system, summary, keywords, themes, path, all: `${title} ${system} ${keywords} ${themes} ${summary} ${path}` };
}

function entryScore(entry, query, tokens) {
  const hay = normalizedEntry(entry);
  if (!tokens.every((token) => hay.all.includes(token))) return -1;

  let score = 0;
  if (hay.title === query) score += 240;
  else if (hay.title.startsWith(query)) score += 180;
  else if (hay.title.includes(query)) score += 120;
  if (hay.keywords.includes(query)) score += 70;
  if (hay.themes.includes(query)) score += 45;
  if (hay.system === query) score += 35;
  if (hay.path.includes(query)) score += 25;
  if (hay.summary.includes(query)) score += 20;

  for (const token of tokens) {
    if (hay.title.split(" ").includes(token)) score += 42;
    else if (hay.title.includes(token)) score += 28;
    if (hay.keywords.includes(token)) score += 18;
    if (hay.themes.includes(token)) score += 12;
    if (hay.system.includes(token)) score += 9;
    if (hay.summary.includes(token)) score += 6;
    if (hay.path.includes(token)) score += 4;
  }
  return score;
}

export function searchReferenceEntries(entries, query, options = {}) {
  const system = options.system || "all";
  const theme = options.theme || "all";
  const limit = Math.max(1, Math.min(Number(options.limit) || 60, 200));
  const normalizedQuery = normalizeSearchText(query);
  const tokens = [...new Set(normalizedQuery.split(" ").filter(Boolean))];

  const filtered = (Array.isArray(entries) ? entries : []).filter((entry) => {
    if (system !== "all" && entry.system !== system) return false;
    if (theme !== "all" && !(entry.themes || []).includes(theme)) return false;
    return true;
  });

  if (!normalizedQuery) {
    if (system === "all" && theme === "all") return [];
    return filtered
      .slice()
      .sort((a, b) => a.system.localeCompare(b.system) || a.title.localeCompare(b.title))
      .slice(0, limit);
  }

  return filtered
    .map((entry) => ({ entry, score: entryScore(entry, normalizedQuery, tokens) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, limit)
    .map((item) => item.entry);
}
