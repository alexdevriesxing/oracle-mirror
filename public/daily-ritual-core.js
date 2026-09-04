export const DAILY_RITUAL_STATE_VERSION = 1;

const DAY_MS = 86_400_000;
const SYNODIC_MONTH_DAYS = 29.53058867;
const KNOWN_NEW_MOON_UTC = Date.UTC(2000, 0, 6, 18, 14, 0);

const TAROT = [
  ["The Fool", "🃏", "Begin lightly. Curiosity will carry you farther than certainty today."],
  ["The Magician", "✦", "Use what is already in your hands. The missing tool is probably confidence."],
  ["The High Priestess", "☾", "Listen before acting. A quiet detail contains more truth than the loudest signal."],
  ["The Empress", "❀", "Nurture what is growing. Care, beauty, and patience are productive forces today."],
  ["The Emperor", "♜", "Give the day structure. One clear boundary will make everything else easier."],
  ["The Hierophant", "⚜", "A trusted method, mentor, or tradition can save you from reinventing the wheel."],
  ["The Lovers", "♡", "Choose in alignment with your values, not merely with what is easiest to explain."],
  ["The Chariot", "➶", "Momentum favors a focused direction. Pick the road before pressing the accelerator."],
  ["Strength", "♌", "Gentle control beats brute force. Patience is your strongest move today."],
  ["The Hermit", "✧", "Step away from the noise long enough to hear your own answer."],
  ["Wheel of Fortune", "◉", "Conditions are shifting. Stay flexible enough to benefit from the turn."],
  ["Justice", "⚖", "Make the fair decision, especially when the convenient decision is tempting."],
  ["The Hanged Man", "◇", "A pause may reveal the angle you could not see while pushing forward."],
  ["Death", "✣", "Let one finished thing actually finish. Space is part of every beginning."],
  ["Temperance", "⚗", "Blend rather than force. The useful answer may sit between two extremes."],
  ["The Devil", "⛓", "Notice what has become automatic. A habit loses power when you name it clearly."],
  ["The Tower", "⚡", "If a weak structure shakes, learn from it instead of decorating the cracks."],
  ["The Star", "★", "Hope works best when given a practical next step. Make one small promise real."],
  ["The Moon", "☽", "Not everything unclear is dangerous. Give uncertainty time to become information."],
  ["The Sun", "☀", "Visibility favors you. Share the idea, make the call, or step into the room."],
  ["Judgement", "♬", "Answer the thing that keeps calling for your attention. Closure creates energy."],
  ["The World", "◎", "Complete the circle. Finish, publish, send, or celebrate what is genuinely done."],
].map(([name, glyph, message]) => ({ name, glyph, message }));

const LUCKY_COLORS = [
  ["Amethyst", "#8b5cf6"],
  ["Moon Silver", "#cbd5e1"],
  ["Solar Gold", "#d4af37"],
  ["Rose Quartz", "#f9a8d4"],
  ["Jade", "#34d399"],
  ["Sapphire", "#60a5fa"],
  ["Ember", "#fb923c"],
  ["Indigo", "#818cf8"],
  ["Pearl", "#f5f3ff"],
  ["Garnet", "#f87171"],
  ["Teal Mist", "#2dd4bf"],
  ["Lavender", "#c4b5fd"],
].map(([name, hex]) => ({ name, hex }));

const ELEMENTS = ["Air", "Fire", "Water", "Earth", "Aether"];

const THEMES = [
  ["Clear the static", "A small act of simplification will create disproportionate relief."],
  ["Follow the warm signal", "Notice which task, conversation, or idea gives energy instead of merely consuming it."],
  ["Protect the first hour", "Your early attention is valuable today. Spend it deliberately."],
  ["Choose the useful truth", "Clarity may be less dramatic than certainty, but it travels better."],
  ["Make room for surprise", "Leave one part of the day unscripted enough for a better option to appear."],
  ["Finish the open loop", "One lingering task is taking more mental space than its actual size deserves."],
  ["Speak plainly", "A direct sentence can dissolve a problem that has survived several elegant paragraphs."],
  ["Move before motivation", "A modest first action is likely to create the momentum you were waiting to feel."],
];

const RECOMMENDATIONS = [
  { realm: "tarot", path: "/tarot", title: "Draw a Tarot Spread", reason: "Today favors symbolic perspective and a three-card view of what is unfolding." },
  { realm: "crystal-ball", path: "/crystal-ball", title: "Ask the Crystal Ball", reason: "A focused question could benefit from a slower, more reflective reading." },
  { realm: "numerology", path: "/numerology", title: "Read Your Life Path", reason: "Patterns and structure are prominent today; numerology is a fitting lens." },
  { realm: "love-match", path: "/love-match", title: "Visit the Temple of Love", reason: "Relationship energy is unusually visible in today's mirror." },
  { realm: "dream-interpreter", path: "/dream-interpreter", title: "Interpret a Dream", reason: "The subconscious deserves a little more microphone time today." },
  { realm: "iching", path: "/iching-oracle", title: "Consult the I Ching", reason: "Change is the theme; the Book of Changes is therefore hardly a subtle recommendation." },
  { realm: "western-zodiac", path: "/western-zodiac", title: "Read Your Horoscope", reason: "The day's rhythm favors a zodiac check-in before you commit to the next move." },
  { realm: "palmistry", path: "/palm-reading", title: "Read Your Palm", reason: "Today rewards a longer-view reflection on patterns, choices, and direction." },
  { realm: "birthchart", path: "/birth-chart", title: "Open Your Birth Chart", reason: "A broader celestial perspective may be more useful than another short-term answer." },
  { realm: "magic8", path: "/magic-8-ball", title: "Ask the Magic 8 Ball", reason: "Do not overcomplicate every decision. One question deserves a playful answer." },
];

export const RITUAL_BADGES = [
  { threshold: 1, name: "First Reflection", glyph: "✦" },
  { threshold: 3, name: "Triple Glimmer", glyph: "✧" },
  { threshold: 7, name: "Seven-Day Seer", glyph: "☾" },
  { threshold: 14, name: "Moonlit Fortnight", glyph: "◐" },
  { threshold: 30, name: "Mirror Keeper", glyph: "◇" },
  { threshold: 100, name: "Oracle Devotee", glyph: "◎" },
];

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pick(list, key) {
  return list[hashString(key) % list.length];
}

function rangedNumber(key, minimum, maximum) {
  const span = maximum - minimum + 1;
  return minimum + (hashString(key) % span);
}

function parseDateKey(dateKey) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const stamp = Date.UTC(year, month - 1, day, 12, 0, 0);
  const date = new Date(stamp);
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function daysBetweenDateKeys(fromDateKey, toDateKey) {
  const from = parseDateKey(fromDateKey);
  const to = parseDateKey(toDateKey);
  if (!from || !to) return null;
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

export function moonPhaseForDate(dateKey) {
  const date = parseDateKey(dateKey) || new Date();
  const ageDays = (((date.getTime() - KNOWN_NEW_MOON_UTC) / DAY_MS) % SYNODIC_MONTH_DAYS + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;
  const phaseIndex = Math.round((ageDays / SYNODIC_MONTH_DAYS) * 8) % 8;
  const phases = [
    ["New Moon", "●"],
    ["Waxing Crescent", "◔"],
    ["First Quarter", "◑"],
    ["Waxing Gibbous", "◕"],
    ["Full Moon", "○"],
    ["Waning Gibbous", "◓"],
    ["Last Quarter", "◐"],
    ["Waning Crescent", "◒"],
  ];
  const [name, glyph] = phases[phaseIndex];
  return { name, glyph, ageDays: Math.round(ageDays * 10) / 10 };
}

export function buildDailyMirror(dateKey) {
  const safeDateKey = parseDateKey(dateKey) ? dateKey : localDateKey();
  const tarot = pick(TAROT, `${safeDateKey}:tarot`);
  const luckyColor = pick(LUCKY_COLORS, `${safeDateKey}:color`);
  const [theme, themeMessage] = pick(THEMES, `${safeDateKey}:theme`);
  const recommendation = pick(RECOMMENDATIONS, `${safeDateKey}:recommendation`);
  const mood = rangedNumber(`${safeDateKey}:mood`, 58, 94);
  const love = rangedNumber(`${safeDateKey}:love`, 52, 96);
  const money = rangedNumber(`${safeDateKey}:money`, 48, 92);

  return {
    dateKey: safeDateKey,
    tarot,
    moon: moonPhaseForDate(safeDateKey),
    luckyNumber: rangedNumber(`${safeDateKey}:number`, 1, 99),
    luckyColor,
    element: pick(ELEMENTS, `${safeDateKey}:element`),
    theme,
    themeMessage,
    scores: { mood, love, money },
    recommendation,
  };
}

export function normalizeRitualState(input) {
  const state = input && typeof input === "object" ? input : {};
  return {
    version: DAILY_RITUAL_STATE_VERSION,
    lastCompletedDate: typeof state.lastCompletedDate === "string" ? state.lastCompletedDate : "",
    streak: Number.isFinite(state.streak) && state.streak > 0 ? Math.floor(state.streak) : 0,
    bestStreak: Number.isFinite(state.bestStreak) && state.bestStreak > 0 ? Math.floor(state.bestStreak) : 0,
    totalDays: Number.isFinite(state.totalDays) && state.totalDays > 0 ? Math.floor(state.totalDays) : 0,
  };
}

export function activeStreakForDate(input, dateKey) {
  const state = normalizeRitualState(input);
  if (!state.lastCompletedDate) return 0;
  const difference = daysBetweenDateKeys(state.lastCompletedDate, dateKey);
  if (difference === 0 || difference === 1) return state.streak;
  return 0;
}

export function completeDailyRitual(input, dateKey) {
  const state = normalizeRitualState(input);
  if (state.lastCompletedDate === dateKey) return state;

  const difference = state.lastCompletedDate ? daysBetweenDateKeys(state.lastCompletedDate, dateKey) : null;
  const streak = difference === 1 ? state.streak + 1 : 1;

  return {
    version: DAILY_RITUAL_STATE_VERSION,
    lastCompletedDate: dateKey,
    streak,
    bestStreak: Math.max(state.bestStreak, streak),
    totalDays: state.totalDays + 1,
  };
}

export function ritualBadgeProgress(input) {
  const state = normalizeRitualState(input);
  const earned = RITUAL_BADGES.filter((badge) => state.bestStreak >= badge.threshold);
  const current = earned.at(-1) || null;
  const next = RITUAL_BADGES.find((badge) => state.bestStreak < badge.threshold) || null;
  return { current, next, earned };
}
