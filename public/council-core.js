export const COUNCIL_VERSION = 1;
export const COUNCIL_ENDPOINT = "/api/council";
export const COUNCIL_ARCHIVE_KEY = "oracle-mirror-archive";
export const COUNCIL_MAX_ARCHIVE = 100;

export function normalizeCouncilQuestion(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, 500);
}

export function isCouncilResult(value) {
  return Boolean(
    value &&
    typeof value === "object" &&
    Array.isArray(value.voices) &&
    value.voices.length === 3 &&
    value.voices.every((voice) => voice && typeof voice.name === "string" && typeof voice.response === "string") &&
    value.verdict &&
    typeof value.verdict.title === "string" &&
    typeof value.verdict.summary === "string" &&
    typeof value.verdict.next_step === "string"
  );
}

export function councilArchiveEntry(result, question, now = new Date()) {
  if (!isCouncilResult(result)) return null;
  const cleanQuestion = normalizeCouncilQuestion(question);
  const answer = [
    ...result.voices.map((voice) => `${voice.name}: ${voice.response}`),
    `Mirror Verdict — ${result.verdict.title}: ${result.verdict.summary}`,
    `Next step: ${result.verdict.next_step}`,
  ].join("\n\n");
  return {
    realm: "Council of Mystics",
    question: cleanQuestion,
    answer,
    date: now.toISOString(),
  };
}

export function saveCouncilToArchive(result, question, storage = window.localStorage) {
  const entry = councilArchiveEntry(result, question);
  if (!entry) return false;
  try {
    const parsed = JSON.parse(storage.getItem(COUNCIL_ARCHIVE_KEY) || "[]");
    const archive = Array.isArray(parsed) ? parsed : [];
    archive.unshift(entry);
    if (archive.length > COUNCIL_MAX_ARCHIVE) archive.length = COUNCIL_MAX_ARCHIVE;
    storage.setItem(COUNCIL_ARCHIVE_KEY, JSON.stringify(archive));
    return true;
  } catch {
    return false;
  }
}

export function councilSharePayload(result) {
  if (!isCouncilResult(result)) return null;
  const names = result.voices.map((voice) => voice.name).filter(Boolean).slice(0, 3);
  return {
    kind: "council",
    mystics: names,
  };
}
