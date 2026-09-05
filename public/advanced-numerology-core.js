export const MASTER_NUMBERS = new Set([11, 22, 33]);
export const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export function reduceNumber(value, preserveMasters = true) {
  let current = Math.abs(Number(value) || 0);
  while (current > 9 && !(preserveMasters && MASTER_NUMBERS.has(current))) {
    current = String(current).split("").reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

export function normalizeLetters(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

export function letterValue(letter) {
  const code = String(letter || "").charCodeAt(0);
  if (code < 65 || code > 90) return 0;
  return ((code - 65) % 9) + 1;
}

export function nameTotal(name, mode = "all") {
  const letters = normalizeLetters(name);
  let total = 0;
  let count = 0;
  for (const letter of letters) {
    const vowel = VOWELS.has(letter);
    const include = mode === "all" || (mode === "vowels" && vowel) || (mode === "consonants" && !vowel);
    if (!include) continue;
    total += letterValue(letter);
    count += 1;
  }
  return { total, count, reduced: count ? reduceNumber(total) : null };
}

export function parseBirthDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day, digits: `${match[1]}${match[2]}${match[3]}` };
}

export function lifePathFromBirthDate(value) {
  const birth = parseBirthDate(value);
  if (!birth) return null;
  const total = birth.digits.split("").reduce((sum, digit) => sum + Number(digit), 0);
  return { total, reduced: reduceNumber(total) };
}

export function birthdayNumber(value) {
  const birth = parseBirthDate(value);
  if (!birth) return null;
  return reduceNumber(birth.day);
}

export function personalYearNumber(value, calendarYear = new Date().getFullYear()) {
  const birth = parseBirthDate(value);
  const year = Number(calendarYear);
  if (!birth || !Number.isInteger(year) || year < 1 || year > 9999) return null;
  const digits = `${String(birth.month).padStart(2, "0")}${String(birth.day).padStart(2, "0")}${String(year).padStart(4, "0")}`;
  const total = digits.split("").reduce((sum, digit) => sum + Number(digit), 0);
  return { total, reduced: reduceNumber(total), year };
}

export function calculateNumerologyProfile(name, birthDate, calendarYear = new Date().getFullYear()) {
  const normalizedName = normalizeLetters(name);
  const birth = parseBirthDate(birthDate);
  if (normalizedName.length < 2 || !birth) return null;

  const expression = nameTotal(name, "all");
  const soulUrge = nameTotal(name, "vowels");
  const personality = nameTotal(name, "consonants");
  const lifePath = lifePathFromBirthDate(birthDate);
  const personalYear = personalYearNumber(birthDate, calendarYear);
  if (!expression.reduced || !soulUrge.reduced || !personality.reduced || !lifePath || !personalYear) return null;

  return {
    lifePath: lifePath.reduced,
    expression: expression.reduced,
    soulUrge: soulUrge.reduced,
    personality: personality.reduced,
    birthday: birthdayNumber(birthDate),
    personalYear: personalYear.reduced,
    personalYearCalendar: personalYear.year,
    raw: {
      lifePath: lifePath.total,
      expression: expression.total,
      soulUrge: soulUrge.total,
      personality: personality.total,
      personalYear: personalYear.total,
    },
  };
}

export function isMasterNumber(value) {
  return MASTER_NUMBERS.has(Number(value));
}
