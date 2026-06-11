// Oracle of Olympus — fixture storage and live-result sync.
// A Workers cron calls syncOlympusFixtures() to overlay real scores from
// football-data.org onto the static seed and persist the result in KV.
// Without an API key the seed alone is stored, so the feature degrades
// gracefully to "schedule only, no live scores".

import { buildSeedMatches } from "./olympus-data.ts";
import type { MatchData } from "./olympus-data.ts";

export interface OlympusEnv {
  ORACLE_KV?: KVNamespace;
  FOOTBALL_DATA_API_KEY?: string;
}

export const MATCHES_KV_KEY = "olympus:matches:v1";

export interface StoredMatches {
  updatedAt: string;
  source: "seed" | "football-data";
  matches: Record<string, MatchData>;
}

// football-data.org v4 response subset
interface FootballDataMatch {
  utcDate?: string;
  status?: string;
  stage?: string;
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
  score?: { fullTime?: { home?: number | null; away?: number | null } };
}

// football-data.org uses FIFA-style names that differ from ours in places.
const TEAM_NAME_ALIASES: Record<string, string> = {
  "korea republic": "South Korea",
  "south korea": "South Korea",
  "ir iran": "Iran",
  "cote d'ivoire": "Ivory Coast",
  "cote divoire": "Ivory Coast",
  "ivory coast": "Ivory Coast",
  "usa": "United States",
  "united states of america": "United States",
  "united states": "United States",
  "turkiye": "Turkey",
  "turkey": "Turkey",
  "czechia": "Czech Republic",
  "czech republic": "Czech Republic",
  "bosnia-herzegovina": "Bosnia and Herzegovina",
  "bosnia and herzegovina": "Bosnia and Herzegovina",
  "congo dr": "DR Congo",
  "dr congo": "DR Congo",
  "democratic republic of the congo": "DR Congo",
  "cabo verde": "Cape Verde",
  "cape verde": "Cape Verde",
  "curacao": "Curaçao",
  "holland": "Netherlands",
};

export function normalizeTeamName(rawName: string): string {
  const normalized = rawName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
  return TEAM_NAME_ALIASES[normalized]
    ?? rawName.normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
}

// Build a lookup key tolerant to home/away naming differences.
function pairKey(teamA: string, teamB: string): string {
  return `${normalizeTeamName(teamA).toLowerCase()}|${normalizeTeamName(teamB).toLowerCase()}`;
}

export function applyApiResults(
  seed: Record<string, MatchData>,
  apiMatches: FootballDataMatch[]
): { matches: Record<string, MatchData>; applied: number } {
  const byPair = new Map<string, string>();
  for (const match of Object.values(seed)) {
    byPair.set(pairKey(match.teamA, match.teamB), match.matchId);
  }

  const matches: Record<string, MatchData> = { ...seed };
  let applied = 0;

  for (const apiMatch of apiMatches) {
    const home = apiMatch.homeTeam?.name;
    const away = apiMatch.awayTeam?.name;
    if (!home || !away) continue;

    const matchId = byPair.get(pairKey(home, away));
    if (!matchId) continue;

    const current = matches[matchId];
    const fullTime = apiMatch.score?.fullTime;
    const isFinished = apiMatch.status === "FINISHED";

    if (isFinished && typeof fullTime?.home === "number" && typeof fullTime?.away === "number") {
      matches[matchId] = {
        ...current,
        finalScore: `${current.teamA} ${fullTime.home}–${fullTime.away} ${current.teamB}`,
      };
      applied++;
    }
  }

  return { matches, applied };
}

async function fetchFootballDataMatches(apiKey: string): Promise<FootballDataMatch[]> {
  const response = await fetch("https://api.football-data.org/v4/competitions/WC/matches", {
    headers: { "X-Auth-Token": apiKey },
  });
  if (!response.ok) {
    throw new Error(`football-data.org request failed: ${response.status} ${await response.text()}`);
  }
  const data = (await response.json()) as { matches?: FootballDataMatch[] };
  return Array.isArray(data.matches) ? data.matches : [];
}

export async function syncOlympusFixtures(env: OlympusEnv): Promise<StoredMatches> {
  const seed = buildSeedMatches();
  let stored: StoredMatches = {
    updatedAt: new Date().toISOString(),
    source: "seed",
    matches: seed,
  };

  if (env.FOOTBALL_DATA_API_KEY) {
    try {
      const apiMatches = await fetchFootballDataMatches(env.FOOTBALL_DATA_API_KEY);
      const { matches } = applyApiResults(seed, apiMatches);
      stored = { updatedAt: new Date().toISOString(), source: "football-data", matches };
    } catch (err) {
      console.error("Olympus fixture sync failed, falling back to seed:", err);
    }
  }

  if (env.ORACLE_KV) {
    await env.ORACLE_KV.put(MATCHES_KV_KEY, JSON.stringify(stored));
  }
  return stored;
}

export async function getOlympusMatches(env: OlympusEnv): Promise<StoredMatches> {
  if (env.ORACLE_KV) {
    try {
      const raw = await env.ORACLE_KV.get(MATCHES_KV_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredMatches;
        if (parsed && parsed.matches && Object.keys(parsed.matches).length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Olympus KV read failed, serving seed:", err);
    }
  }
  return {
    updatedAt: new Date().toISOString(),
    source: "seed",
    matches: buildSeedMatches(),
  };
}
