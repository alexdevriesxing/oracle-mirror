export const INTERACTIVE_ORACLES_VERSION = 1;

function hashSeed(seed) {
  const text = String(seed ?? "");
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededIndex(seed, length, salt = "") {
  if (!Number.isInteger(length) || length <= 0) return -1;
  return hashSeed(`${seed}|${salt}`) % length;
}

export const PENDULUM_OUTCOMES = [
  { id: "yes", label: "Yes", glyph: "↗", message: "The pendulum leans clearly toward movement. Treat that as a prompt to examine what makes a yes feel workable.", route: "/crystal-ball" },
  { id: "lean-yes", label: "Leaning Yes", glyph: "⌁", message: "There is momentum here, but one condition still matters. Notice what would need to be true before you commit.", route: "/tarot" },
  { id: "uncertain", label: "Uncertain", glyph: "◇", message: "The signal is mixed. More information is likely more useful than forcing certainty from the question as it stands.", route: "/iching-oracle" },
  { id: "lean-no", label: "Leaning No", glyph: "⌁", message: "Something in the situation resists. Look for the cost, assumption, or timing issue that is making hesitation meaningful.", route: "/daily-fortune" },
  { id: "no", label: "No", glyph: "↙", message: "The pendulum points away from the current path. Use that as an invitation to identify what alternative deserves attention.", route: "/crystal-ball" },
  { id: "ask-again", label: "Ask Again Later", glyph: "◷", message: "The question may be premature. Time, context, or a better-framed question could change what is useful to notice.", route: "/tarot" },
];

export function readPendulum(question, nonce = "") {
  const normalized = String(question || "").trim().slice(0, 280);
  const index = seededIndex(`${normalized}|${nonce}`, PENDULUM_OUTCOMES.length, "pendulum");
  return PENDULUM_OUTCOMES[index] || PENDULUM_OUTCOMES[2];
}

export const AURA_PROFILES = [
  { id: "violet", name: "Violet Aura", glyph: "✦", traits: ["Imaginative", "Intuitive", "Vision-led"], message: "You tend to look beyond the obvious and connect ideas before they become fully formed.", route: "/western-zodiac" },
  { id: "blue", name: "Blue Aura", glyph: "◌", traits: ["Calm", "Reflective", "Truth-seeking"], message: "You restore clarity by slowing the pace and naming what is actually true for you.", route: "/dream-interpreter" },
  { id: "green", name: "Green Aura", glyph: "❧", traits: ["Grounded", "Restorative", "Growth-minded"], message: "You are drawn toward steady progress, repair, and environments where things can develop naturally.", route: "/palm-reading" },
  { id: "gold", name: "Golden Aura", glyph: "☀", traits: ["Driven", "Warm", "Purposeful"], message: "You tend to move best when energy, purpose, and visible progress reinforce one another.", route: "/numerology" },
  { id: "rose", name: "Rose Aura", glyph: "♡", traits: ["Empathic", "Relational", "Heart-led"], message: "You notice tone, connection, and emotional undercurrents quickly, often before others say them aloud.", route: "/love-oracle" },
  { id: "indigo", name: "Indigo Aura", glyph: "☾", traits: ["Independent", "Deep-thinking", "Pattern-aware"], message: "You prefer to understand the pattern beneath a situation rather than react to its loudest surface detail.", route: "/iching-oracle" },
];

export const AURA_QUESTIONS = [
  {
    id: "reset",
    prompt: "When your energy is scattered, what restores you fastest?",
    options: [
      { id: "quiet", label: "Quiet and solitude", scores: { blue: 2, indigo: 2 } },
      { id: "people", label: "A trusted person", scores: { rose: 3, green: 1 } },
      { id: "movement", label: "Doing something useful", scores: { gold: 2, green: 2 } },
      { id: "ideas", label: "Following a new idea", scores: { violet: 3, indigo: 1 } },
    ],
  },
  {
    id: "decision",
    prompt: "What do you trust first when making a difficult decision?",
    options: [
      { id: "facts", label: "Facts and structure", scores: { gold: 2, blue: 2 } },
      { id: "instinct", label: "A strong gut feeling", scores: { violet: 2, indigo: 2 } },
      { id: "impact", label: "How it affects people", scores: { rose: 3, green: 1 } },
      { id: "timing", label: "Whether the timing feels right", scores: { green: 2, indigo: 2 } },
    ],
  },
  {
    id: "space",
    prompt: "Which environment feels most like your natural habitat?",
    options: [
      { id: "studio", label: "A creative studio", scores: { violet: 3, gold: 1 } },
      { id: "garden", label: "A garden or quiet landscape", scores: { green: 3, blue: 1 } },
      { id: "library", label: "A library or observatory", scores: { indigo: 3, blue: 1 } },
      { id: "table", label: "A lively table with people", scores: { rose: 3, gold: 1 } },
    ],
  },
  {
    id: "friction",
    prompt: "What kind of friction drains you most?",
    options: [
      { id: "chaos", label: "Chaos without direction", scores: { gold: 3, blue: 1 } },
      { id: "coldness", label: "Emotional distance", scores: { rose: 3, green: 1 } },
      { id: "stagnation", label: "Feeling stuck", scores: { violet: 2, gold: 2 } },
      { id: "noise", label: "Too much noise and interruption", scores: { indigo: 2, blue: 2 } },
    ],
  },
  {
    id: "gift",
    prompt: "Which quality do people most often rely on you for?",
    options: [
      { id: "perspective", label: "Perspective", scores: { indigo: 2, violet: 2 } },
      { id: "comfort", label: "Comfort", scores: { rose: 2, green: 2 } },
      { id: "clarity", label: "Clarity", scores: { blue: 2, gold: 2 } },
      { id: "momentum", label: "Momentum", scores: { gold: 3, violet: 1 } },
    ],
  },
];

export function scoreAura(answerIds) {
  const scores = Object.fromEntries(AURA_PROFILES.map((profile) => [profile.id, 0]));
  const answers = Array.isArray(answerIds) ? answerIds : [];
  AURA_QUESTIONS.forEach((question, index) => {
    const answerId = answers[index];
    const option = question.options.find((item) => item.id === answerId);
    if (!option) return;
    for (const [auraId, points] of Object.entries(option.scores)) scores[auraId] += points;
  });
  const ranked = AURA_PROFILES.map((profile) => ({ profile, score: scores[profile.id] || 0 }))
    .sort((left, right) => right.score - left.score || left.profile.id.localeCompare(right.profile.id));
  const top = ranked[0];
  const total = ranked.reduce((sum, item) => sum + item.score, 0) || 1;
  return {
    ...top.profile,
    confidence: Math.max(1, Math.round((top.score / total) * 100)),
    scores,
  };
}

export const DUEL_MYSTICS = [
  { id: "fortuna", name: "Madame Fortuna", glyph: "🔮", route: "/crystal-ball" },
  { id: "seraphina", name: "Seraphina", glyph: "🃏", route: "/tarot" },
  { id: "morpheus", name: "Morpheus", glyph: "☾", route: "/dream-interpreter" },
  { id: "rosalind", name: "Rosalind", glyph: "♡", route: "/love-oracle" },
  { id: "pythius", name: "Pythius", glyph: "◇", route: "/numerology" },
  { id: "laotan", name: "Sage Lao-Tan", glyph: "☯", route: "/iching-oracle" },
];

const DUEL_THEMES = {
  love: {
    fortuna: "The feeling matters, but watch the difference between hope and evidence. Give the relationship room to show you what it actually is.",
    seraphina: "Ask which pattern keeps repeating between desire, fear, and action. The next move should interrupt the pattern rather than decorate it.",
    morpheus: "Notice what you are imagining on the other person's behalf. The hidden story may be shaping the emotion more than the facts are.",
    rosalind: "Choose the action that protects both honesty and dignity. Affection is strongest when it does not require mind-reading.",
    pythius: "Look for consistency. A relationship reveals itself through repeated behavior more reliably than through one dramatic moment.",
    laotan: "Do not force closeness or distance. Let the next truthful action be small enough that the situation can answer naturally.",
  },
  work: {
    fortuna: "Look beyond the obvious opportunity and ask what changes if the current path continues unchanged for six months.",
    seraphina: "The tension is between control and momentum. Pick the move that creates information instead of merely protecting certainty.",
    morpheus: "Pay attention to the part of the work problem that follows you home. That emotional residue is pointing toward the real friction.",
    rosalind: "Consider the human cost of the decision, including your own energy. A good outcome that exhausts you indefinitely is not neutral.",
    pythius: "Reduce the decision to measurable trade-offs: upside, reversibility, learning, and downside. Patterns become clearer when named.",
    laotan: "Do not confuse movement with progress. The useful step may be the one that removes resistance rather than adds effort.",
  },
  choice: {
    fortuna: "Imagine both doors have already closed. Which loss would teach you more about what you truly wanted?",
    seraphina: "One option likely protects the present while the other changes the pattern. Decide which function matters more right now.",
    morpheus: "Notice which option keeps appearing in daydreams, worries, or rehearsed conversations. Repetition is information, not proof.",
    rosalind: "Choose the path you can explain to yourself without resentment. A decision that requires self-betrayal will collect interest.",
    pythius: "Prefer the option with a tolerable downside and useful information gain. Reversible choices deserve less fear than permanent ones.",
    laotan: "If both choices feel forced, the real choice may be timing. Waiting briefly can also be an intentional move.",
  },
  change: {
    fortuna: "The shift is already underway. Spend less energy asking whether change is coming and more on deciding what you want to carry forward.",
    seraphina: "An old structure is losing usefulness. Let something end cleanly instead of dragging it into the next chapter out of habit.",
    morpheus: "Change often arrives first as restlessness. Ask what your mind keeps rehearsing because your routine no longer contains it.",
    rosalind: "Growth does not require becoming unrecognizable to the people who knew you before. Keep the relationships that can adapt honestly.",
    pythius: "Track what is increasing and decreasing: time, energy, opportunity, friction. Direction becomes easier to see when trends are visible.",
    laotan: "Move with the change that is already happening rather than manufacturing a dramatic break. Small alignment can outperform force.",
  },
  general: {
    fortuna: "The situation is less fixed than it appears. Ask what new information would most change your decision, then go find that first.",
    seraphina: "Look for the pattern underneath the immediate problem. The strongest move changes the pattern, not just today's symptom.",
    morpheus: "Your reaction may be carrying information from an older situation. Separate what belongs to now from what merely feels familiar.",
    rosalind: "Choose the response that lets you remain honest without becoming unnecessarily harsh with yourself or anyone else.",
    pythius: "Turn the problem into a few observable variables. What can be measured, tested, reversed, or learned before a bigger commitment?",
    laotan: "Do not push where the situation is closed. Look for the point of least resistance that still moves you in the right direction.",
  },
};

export function classifyDuelTheme(question) {
  const text = String(question || "").toLowerCase();
  if (/love|relationship|partner|dating|marriage|crush|romance|heart/.test(text)) return "love";
  if (/work|job|career|boss|business|company|client|money|salary/.test(text)) return "work";
  if (/choose|choice|decide|decision|either|option|should i|which/.test(text)) return "choice";
  if (/change|move|leave|start|end|new chapter|transition/.test(text)) return "change";
  return "general";
}

export function buildOracleDuel(question, nonce = "") {
  const normalized = String(question || "").trim().slice(0, 320);
  const theme = classifyDuelTheme(normalized);
  const firstIndex = seededIndex(`${normalized}|${nonce}`, DUEL_MYSTICS.length, "duel-first");
  let secondIndex = seededIndex(`${normalized}|${nonce}`, DUEL_MYSTICS.length, "duel-second");
  if (secondIndex === firstIndex) secondIndex = (secondIndex + 1) % DUEL_MYSTICS.length;
  const contestants = [DUEL_MYSTICS[firstIndex], DUEL_MYSTICS[secondIndex]].map((mystic) => ({
    ...mystic,
    response: DUEL_THEMES[theme][mystic.id],
  }));
  return { theme, contestants };
}
