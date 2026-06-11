// Oracle of Olympus — World Cup 2026 fixture seed and deterministic prediction engine.
// The seed is the offline source of truth; the cron sync (olympus-sync.ts) overlays
// live results from football-data.org on top of it in KV.

export type MatchStatus = "upcoming" | "completed" | "today";

export interface Probabilities {
  teamAWin: number;
  draw: number;
  teamBWin: number;
}

export interface MatchData {
  matchId: string;
  teamA: string;
  teamB: string;
  competition: string;
  stage: string;
  group: string;
  date: string;
  venue: string;
  flagA: string;
  flagB: string;
  predictedScore: string;
  probabilities: Probabilities;
  confidence: "Low" | "Medium" | "High";
  historicalSummary: string;
  dataReasoning: string;
  finalScore?: string;
}

// Status is derived from the match date (UTC) so listings never go stale;
// match dates are calendar days, so a string compare against today is enough.
export function deriveMatchStatus(dateStr: string): MatchStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (dateStr === today) return "today";
  return dateStr < today ? "completed" : "upcoming";
}

const COMPETITION = "FIFA World Cup 2026";

// [group, date, teamA (home), teamB (away), venue]
// Source: official FIFA schedule (group pages on Wikipedia, fetched 2026-06-11).
type FixtureTuple = readonly [string, string, string, string, string];

export const WC2026_GROUP_FIXTURES: ReadonlyArray<FixtureTuple> = [
  ["A", "2026-06-11", "Mexico", "South Africa", "Estadio Azteca, Mexico City"],
  ["A", "2026-06-11", "South Korea", "Czech Republic", "Estadio Akron, Zapopan"],
  ["A", "2026-06-18", "Czech Republic", "South Africa", "Mercedes-Benz Stadium, Atlanta"],
  ["A", "2026-06-18", "Mexico", "South Korea", "Estadio Akron, Zapopan"],
  ["A", "2026-06-24", "Czech Republic", "Mexico", "Estadio Azteca, Mexico City"],
  ["A", "2026-06-24", "South Africa", "South Korea", "Estadio BBVA, Guadalupe"],
  ["B", "2026-06-12", "Canada", "Bosnia and Herzegovina", "BMO Field, Toronto"],
  ["B", "2026-06-13", "Qatar", "Switzerland", "Levi's Stadium, Santa Clara"],
  ["B", "2026-06-18", "Switzerland", "Bosnia and Herzegovina", "SoFi Stadium, Inglewood"],
  ["B", "2026-06-18", "Canada", "Qatar", "BC Place, Vancouver"],
  ["B", "2026-06-24", "Switzerland", "Canada", "BC Place, Vancouver"],
  ["B", "2026-06-24", "Bosnia and Herzegovina", "Qatar", "Lumen Field, Seattle"],
  ["C", "2026-06-13", "Brazil", "Morocco", "MetLife Stadium, East Rutherford"],
  ["C", "2026-06-13", "Haiti", "Scotland", "Gillette Stadium, Foxborough"],
  ["C", "2026-06-19", "Scotland", "Morocco", "Gillette Stadium, Foxborough"],
  ["C", "2026-06-19", "Brazil", "Haiti", "Lincoln Financial Field, Philadelphia"],
  ["C", "2026-06-24", "Scotland", "Brazil", "Hard Rock Stadium, Miami Gardens"],
  ["C", "2026-06-24", "Morocco", "Haiti", "Mercedes-Benz Stadium, Atlanta"],
  ["D", "2026-06-12", "United States", "Paraguay", "SoFi Stadium, Inglewood"],
  ["D", "2026-06-13", "Australia", "Turkey", "BC Place, Vancouver"],
  ["D", "2026-06-19", "United States", "Australia", "Lumen Field, Seattle"],
  ["D", "2026-06-19", "Turkey", "Paraguay", "Levi's Stadium, Santa Clara"],
  ["D", "2026-06-25", "Turkey", "United States", "SoFi Stadium, Inglewood"],
  ["D", "2026-06-25", "Paraguay", "Australia", "Levi's Stadium, Santa Clara"],
  ["E", "2026-06-14", "Germany", "Curaçao", "NRG Stadium, Houston"],
  ["E", "2026-06-14", "Ivory Coast", "Ecuador", "Lincoln Financial Field, Philadelphia"],
  ["E", "2026-06-20", "Germany", "Ivory Coast", "BMO Field, Toronto"],
  ["E", "2026-06-20", "Ecuador", "Curaçao", "Arrowhead Stadium, Kansas City"],
  ["E", "2026-06-25", "Curaçao", "Ivory Coast", "Lincoln Financial Field, Philadelphia"],
  ["E", "2026-06-25", "Ecuador", "Germany", "MetLife Stadium, East Rutherford"],
  ["F", "2026-06-14", "Netherlands", "Japan", "AT&T Stadium, Arlington"],
  ["F", "2026-06-14", "Sweden", "Tunisia", "Estadio BBVA, Guadalupe"],
  ["F", "2026-06-20", "Netherlands", "Sweden", "NRG Stadium, Houston"],
  ["F", "2026-06-20", "Tunisia", "Japan", "Estadio BBVA, Guadalupe"],
  ["F", "2026-06-25", "Japan", "Sweden", "AT&T Stadium, Arlington"],
  ["F", "2026-06-25", "Tunisia", "Netherlands", "Arrowhead Stadium, Kansas City"],
  ["G", "2026-06-15", "Iran", "New Zealand", "SoFi Stadium, Inglewood"],
  ["G", "2026-06-15", "Belgium", "Egypt", "Lumen Field, Seattle"],
  ["G", "2026-06-21", "Belgium", "Iran", "SoFi Stadium, Inglewood"],
  ["G", "2026-06-21", "New Zealand", "Egypt", "BC Place, Vancouver"],
  ["G", "2026-06-26", "Egypt", "Iran", "Lumen Field, Seattle"],
  ["G", "2026-06-26", "New Zealand", "Belgium", "BC Place, Vancouver"],
  ["H", "2026-06-15", "Saudi Arabia", "Uruguay", "Hard Rock Stadium, Miami Gardens"],
  ["H", "2026-06-15", "Spain", "Cape Verde", "Mercedes-Benz Stadium, Atlanta"],
  ["H", "2026-06-21", "Spain", "Saudi Arabia", "Mercedes-Benz Stadium, Atlanta"],
  ["H", "2026-06-21", "Uruguay", "Cape Verde", "Hard Rock Stadium, Miami Gardens"],
  ["H", "2026-06-26", "Cape Verde", "Saudi Arabia", "NRG Stadium, Houston"],
  ["H", "2026-06-26", "Uruguay", "Spain", "Estadio Akron, Zapopan"],
  ["I", "2026-06-16", "France", "Senegal", "MetLife Stadium, East Rutherford"],
  ["I", "2026-06-16", "Iraq", "Norway", "Gillette Stadium, Foxborough"],
  ["I", "2026-06-22", "France", "Iraq", "Lincoln Financial Field, Philadelphia"],
  ["I", "2026-06-22", "Norway", "Senegal", "MetLife Stadium, East Rutherford"],
  ["I", "2026-06-26", "Norway", "France", "Gillette Stadium, Foxborough"],
  ["I", "2026-06-26", "Senegal", "Iraq", "BMO Field, Toronto"],
  ["J", "2026-06-16", "Argentina", "Algeria", "Arrowhead Stadium, Kansas City"],
  ["J", "2026-06-16", "Austria", "Jordan", "Levi's Stadium, Santa Clara"],
  ["J", "2026-06-22", "Argentina", "Austria", "AT&T Stadium, Arlington"],
  ["J", "2026-06-22", "Jordan", "Algeria", "Levi's Stadium, Santa Clara"],
  ["J", "2026-06-27", "Algeria", "Austria", "Arrowhead Stadium, Kansas City"],
  ["J", "2026-06-27", "Jordan", "Argentina", "AT&T Stadium, Arlington"],
  ["K", "2026-06-17", "Portugal", "DR Congo", "NRG Stadium, Houston"],
  ["K", "2026-06-17", "Uzbekistan", "Colombia", "Estadio Azteca, Mexico City"],
  ["K", "2026-06-23", "Portugal", "Uzbekistan", "NRG Stadium, Houston"],
  ["K", "2026-06-23", "Colombia", "DR Congo", "Estadio Akron, Zapopan"],
  ["K", "2026-06-27", "Colombia", "Portugal", "Hard Rock Stadium, Miami Gardens"],
  ["K", "2026-06-27", "DR Congo", "Uzbekistan", "Mercedes-Benz Stadium, Atlanta"],
  ["L", "2026-06-17", "Ghana", "Panama", "BMO Field, Toronto"],
  ["L", "2026-06-17", "England", "Croatia", "AT&T Stadium, Arlington"],
  ["L", "2026-06-23", "England", "Ghana", "Gillette Stadium, Foxborough"],
  ["L", "2026-06-23", "Panama", "Croatia", "BMO Field, Toronto"],
  ["L", "2026-06-27", "Panama", "England", "MetLife Stadium, East Rutherford"],
  ["L", "2026-06-27", "Croatia", "Ghana", "Lincoln Financial Field, Philadelphia"],
];

// Rough strength tiers (1 weakest – 5 strongest) used by the deterministic
// prediction model. Entertainment-grade, not bookmaker-grade.
const TEAM_TIERS: Record<string, number> = {
  Argentina: 5, France: 5, Spain: 5, England: 5, Brazil: 5, Portugal: 5,
  Netherlands: 4, Germany: 4, Belgium: 4, Croatia: 4, Uruguay: 4, Colombia: 4,
  Morocco: 4, Japan: 4, Switzerland: 4, Mexico: 4, "United States": 4, Senegal: 4,
  Turkey: 3, Austria: 3, Norway: 3, Sweden: 3, Iran: 3, "South Korea": 3,
  Egypt: 3, Ecuador: 3, Australia: 3, "Czech Republic": 3, Tunisia: 3, Algeria: 3,
  "Ivory Coast": 3, Paraguay: 3, Scotland: 3, Canada: 3, Ghana: 3, "Bosnia and Herzegovina": 3,
  Qatar: 2, "Saudi Arabia": 2, Panama: 2, Uzbekistan: 2, Iraq: 2, Jordan: 2,
  "South Africa": 2, "New Zealand": 2, "Cape Verde": 2, "DR Congo": 2,
  Haiti: 1, "Curaçao": 1,
};

// flagcdn.com country codes (ISO 3166-1 alpha-2, plus gb-eng / gb-sct).
export const TEAM_FLAGS: Record<string, string> = {
  Mexico: "mx", "South Africa": "za", "South Korea": "kr", "Czech Republic": "cz",
  Canada: "ca", "Bosnia and Herzegovina": "ba", Qatar: "qa", Switzerland: "ch",
  Brazil: "br", Morocco: "ma", Haiti: "ht", Scotland: "gb-sct",
  "United States": "us", Paraguay: "py", Australia: "au", Turkey: "tr",
  Germany: "de", "Curaçao": "cw", "Ivory Coast": "ci", Ecuador: "ec",
  Netherlands: "nl", Japan: "jp", Sweden: "se", Tunisia: "tn",
  Belgium: "be", Egypt: "eg", Iran: "ir", "New Zealand": "nz",
  Spain: "es", "Cape Verde": "cv", "Saudi Arabia": "sa", Uruguay: "uy",
  France: "fr", Senegal: "sn", Iraq: "iq", Norway: "no",
  Argentina: "ar", Algeria: "dz", Austria: "at", Jordan: "jo",
  Portugal: "pt", "DR Congo": "cd", Uzbekistan: "uz", Colombia: "co",
  England: "gb-eng", Croatia: "hr", Ghana: "gh", Panama: "pa",
};

// One flavor clause per team, woven into historicalSummary.
const TEAM_NOTES: Record<string, string> = {
  Mexico: "carry the roar of the home crowds and a proud hosting legacy",
  "South Africa": "bring fearless pace and a rising generation hungry to prove itself",
  "South Korea": "are relentless pressers with tournament-hardened discipline",
  "Czech Republic": "rely on structured defending and dangerous set pieces",
  Canada: "ride home support and explosive athleticism out wide",
  "Bosnia and Herzegovina": "blend technical midfield craft with veteran resolve",
  Qatar: "field a patient, possession-minded side built on familiarity",
  Switzerland: "are perennially organized and ruthless in transition",
  Brazil: "carry five stars and an endless conveyor of attacking talent",
  Morocco: "still glow from their historic 2022 semi-final run",
  Haiti: "arrive as spirited debutants with nothing to lose",
  Scotland: "bring midfield bite and a wall of traveling support",
  "United States": "host with pace, energy, and a golden generation in its prime",
  Paraguay: "defend deep and strike on swift counters",
  Australia: "are physical, direct, and famously hard to break down",
  Turkey: "boast creative flair and a fearless young core",
  Germany: "remain tournament royalty with machine-like efficiency",
  "Curaçao": "are among the smallest nations ever at the finals, playing free of fear",
  "Ivory Coast": "combine athletic power with African champion pedigree",
  Ecuador: "are altitude-forged and dangerously quick in transition",
  Netherlands: "marry total-football heritage with modern tactical steel",
  Japan: "are disciplined, technical, and giant-killers in recent tournaments",
  Sweden: "bring aerial strength and unshakable structure",
  Tunisia: "are stubborn defenders who relish frustrating favorites",
  Belgium: "seek one last golden chapter from a gifted generation",
  Egypt: "lean on star quality up front and disciplined lines behind",
  Iran: "are battle-tested and lethal on the counterattack",
  "New Zealand": "arrive unbeaten through Oceania with collective grit",
  Spain: "weave hypnotic possession from a fountain of young talent",
  "Cape Verde": "are island debutants with athleticism and ambition",
  "Saudi Arabia": "proved in 2022 that they fear no giant",
  Uruguay: "carry garra charrúa — two stars and endless fight",
  France: "field devastating speed and finalist pedigree",
  Senegal: "are African champions built on power and poise",
  Iraq: "return to the world stage with passionate, technical football",
  Norway: "are spearheaded by a generational goal machine",
  Argentina: "defend their crown with the memory of Qatar 2022 burning bright",
  Algeria: "are technically gifted and tactically cunning",
  Austria: "press high with relentless intensity",
  Jordan: "ride the momentum of a historic first qualification",
  Portugal: "blend golden-generation skill with seleção pride",
  "DR Congo": "bring raw power and the joy of a long-awaited return",
  Uzbekistan: "are disciplined debutants from Asia's rising power",
  Colombia: "dance to a rhythm of flair and fast breaks",
  England: "chase football's homecoming with a deep, balanced squad",
  Croatia: "are midfield maestros who never know when they are beaten",
  Ghana: "bring Black Stars flair and fearless youth",
  Panama: "are organized, physical, and proud of their grit",
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function fixtureMatchId(teamA: string, teamB: string): string {
  return `wc2026-${slugify(teamA)}-${slugify(teamB)}`;
}

function hashCode(value: string): number {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 33) ^ value.charCodeAt(i);
  }
  return Math.abs(hash);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function predictScoreline(diff: number, hash: number): [number, number] {
  if (diff <= -3) return [0, 3];
  if (diff === -2) return [0, 2];
  if (diff === -1) return [1, 2];
  if (diff === 1) return [2, 1];
  if (diff === 2) return [2, 0];
  if (diff >= 3) return [3, 0];
  return hash % 3 === 0 ? [2, 2] : [1, 1];
}

function buildReasoning(teamA: string, teamB: string, diff: number): string {
  if (diff === 0) {
    return "The mirror shows two evenly matched forces: form, possession, and set-piece edges cancel out, leaving the scales tilted toward a share of the spoils.";
  }
  const stronger = diff > 0 ? teamA : teamB;
  const weaker = diff > 0 ? teamB : teamA;
  if (Math.abs(diff) === 1) {
    return `${stronger} hold a narrow statistical edge in squad depth and recent form, but ${weaker} possess the tools to drag this contest into the mud.`;
  }
  return `The numbers favor ${stronger} decisively — deeper rotation, a stronger attacking profile, and tournament pedigree — while ${weaker} must conjure an upset beyond what the data sees.`;
}

export function buildMatchData(fixture: FixtureTuple): MatchData {
  const [group, date, teamA, teamB, venue] = fixture;
  const matchId = fixtureMatchId(teamA, teamB);
  const hash = hashCode(matchId);
  const tierA = TEAM_TIERS[teamA] ?? 2;
  const tierB = TEAM_TIERS[teamB] ?? 2;
  const diff = tierA - tierB;

  const jitter = (hash % 5) - 2;
  let teamAWin = clamp(38 + diff * 13 + jitter, 8, 80);
  const draw = clamp(28 - Math.abs(diff) * 5, 10, 32);
  let teamBWin = 100 - teamAWin - draw;
  if (teamBWin < 6) {
    teamAWin -= 6 - teamBWin;
    teamBWin = 6;
  }

  const gap = Math.abs(teamAWin - teamBWin);
  const confidence: MatchData["confidence"] = gap >= 30 ? "High" : gap >= 12 ? "Medium" : "Low";
  const [goalsA, goalsB] = predictScoreline(diff, hash);

  return {
    matchId,
    teamA,
    teamB,
    competition: COMPETITION,
    stage: `Group ${group}`,
    group,
    date,
    venue,
    flagA: TEAM_FLAGS[teamA] ?? "un",
    flagB: TEAM_FLAGS[teamB] ?? "un",
    predictedScore: `${teamA} ${goalsA}–${goalsB} ${teamB}`,
    probabilities: { teamAWin, draw, teamBWin },
    confidence,
    historicalSummary: `${teamA} ${TEAM_NOTES[teamA] ?? "arrive with quiet determination"}. ${teamB} ${TEAM_NOTES[teamB] ?? "arrive with quiet determination"}.`,
    dataReasoning: buildReasoning(teamA, teamB, diff),
  };
}

export function buildSeedMatches(): Record<string, MatchData> {
  const matches: Record<string, MatchData> = {};
  for (const fixture of WC2026_GROUP_FIXTURES) {
    const match = buildMatchData(fixture);
    matches[match.matchId] = match;
  }
  return matches;
}
