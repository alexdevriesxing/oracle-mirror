// Dream-interpretation knowledge base for Morpheus Vey, the Dream-Walker.
//
// This is a curated corpus distilled from the public body of dream-interpretation
// knowledge — Freudian and Jungian frameworks, emotional/psychological readings,
// and cross-cultural symbolism. It is bundled with the worker (static, version
// controlled) and serves three jobs:
//   1. Grounds the AI persona so interpretations draw on real symbolism, not
//      8B-model guesses (see retrieveDreamKnowledge + handleDream in index.ts).
//   2. Seeds sharper, dream-aware clarifying questions (questionHints).
//   3. Renders the crawlable SSR symbol dictionary + FAQ for SEO/GAIO.
//
// Dream symbolism is stable, so a curated corpus is preferable to live web
// retrieval (no latency, no unsafe content, deterministic, reusable as content).

export type DreamSymbol = {
  /** Canonical symbol slug, lowercase. */
  symbol: string;
  /** Human-readable title for SSR/FAQ rendering. */
  title: string;
  /** Alternate words/phrases that should match this symbol in dream text. */
  aliases: string[];
  /** Layered interpretations across the major frameworks. */
  frameworks: {
    jungian: string;
    freudian: string;
    emotional: string;
    cultural: string;
  };
  /** A single concise meaning used for SSR dictionary + grounding fallback. */
  meaning: string;
  /** In-character clarifying questions Morpheus may ask about this symbol. */
  questionHints: string[];
};

export const FRAMEWORK_PRIMERS: Record<string, string> = {
  jungian:
    "Carl Jung saw dreams as messages from the unconscious, populated by archetypes (the Shadow, the Anima/Animus, the Self) and rich in symbols that compensate for what the waking mind ignores.",
  freudian:
    "Sigmund Freud read dreams as disguised wish-fulfilment, where 'manifest' images conceal 'latent' desires — often rooted in anxiety, repression, or the past.",
  emotional:
    "Modern psychology treats dreams as the mind processing emotion and memory: the feeling a dream leaves behind matters more than any single image.",
  cultural:
    "Across cultures, recurring dream symbols carry shared folk meanings — omens, warnings, and reassurances passed down through generations.",
};

export const DREAM_SYMBOLS: DreamSymbol[] = [
  {
    symbol: "falling",
    title: "Falling",
    aliases: ["fall", "fell", "falling", "plummet", "plummeting", "dropping", "tumbling"],
    frameworks: {
      jungian: "A loss of footing in the psyche — the conscious self has lost touch with solid inner ground.",
      freudian: "Often tied to anxiety over losing control, status, or a precarious desire.",
      emotional: "A felt sense of insecurity, overwhelm, or a situation slipping from your grasp.",
      cultural: "Folk tradition warns of a setback — yet to fall and survive foretells recovery.",
    },
    meaning:
      "Falling dreams usually mirror a loss of control or insecurity in waking life — a fear that something solid is slipping away.",
    questionHints: ["Did you ever land, or did you wake before the ground?", "Were you afraid as you fell, or strangely calm?"],
  },
  {
    symbol: "flying",
    title: "Flying",
    aliases: ["fly", "flew", "flying", "soaring", "floating", "levitating"],
    frameworks: {
      jungian: "A rising above limitation — the Self glimpsing freedom and a wider perspective.",
      freudian: "Read as liberation from restraint, sometimes a sublimated desire.",
      emotional: "Exhilaration, ambition, or a longing to escape pressures pinning you down.",
      cultural: "A favourable omen of success, transcendence, and breaking free.",
    },
    meaning:
      "Flying reflects a desire for freedom, control, or rising above a situation — often a hopeful, empowering omen.",
    questionHints: ["Did you soar with ease, or struggle to stay aloft?", "What did you see from up there?"],
  },
  {
    symbol: "teeth",
    title: "Teeth Falling Out",
    aliases: ["teeth", "tooth", "teeth falling", "losing teeth", "crumbling teeth"],
    frameworks: {
      jungian: "A shedding of an old persona, or anxiety about how one is seen by the world.",
      freudian: "Classically linked to anxiety, loss, and fears around potency or aging.",
      emotional: "Worry about appearance, communication, or losing power in a situation.",
      cultural: "Widely read as an omen of change, loss, or news arriving from afar.",
    },
    meaning:
      "Teeth falling out commonly signals anxiety about appearance, self-image, or a loss of control or power.",
    questionHints: ["Was there pain, or did the teeth simply slip away?", "Did anyone see it happen?"],
  },
  {
    symbol: "chased",
    title: "Being Chased",
    aliases: ["chased", "chasing", "being chased", "pursued", "running away", "hunted", "followed"],
    frameworks: {
      jungian: "The pursuer is often the Shadow — a disowned part of yourself demanding to be faced.",
      freudian: "An avoided impulse or fear pressing for acknowledgement.",
      emotional: "Avoidance — something in waking life you are running from rather than confronting.",
      cultural: "A warning to turn and deal with what you have been evading.",
    },
    meaning:
      "Being chased points to avoidance — a fear, person, or responsibility you're running from instead of facing.",
    questionHints: ["Did you see who or what was chasing you?", "What would have happened if you had turned around?"],
  },
  {
    symbol: "water",
    title: "Water",
    aliases: ["water", "ocean", "sea", "river", "flood", "waves", "lake", "drowning", "swimming"],
    frameworks: {
      jungian: "The classic symbol of the unconscious — calm or turbulent as your inner depths are.",
      freudian: "Associated with birth, the maternal, and deep emotional currents.",
      emotional: "The state of the water mirrors your emotional state: clear and calm, or stormy and overwhelming.",
      cultural: "Clear water foretells clarity and renewal; murky or flooding water warns of trouble.",
    },
    meaning:
      "Water represents your emotions and unconscious mind — its calmness or turbulence reflects how you truly feel.",
    questionHints: ["Was the water calm or turbulent?", "Were you in the water, or watching it from the shore?"],
  },
  {
    symbol: "death",
    title: "Death",
    aliases: ["death", "dying", "died", "dead", "funeral", "grave"],
    frameworks: {
      jungian: "Rarely literal — death marks the end of one phase of the Self and the birth of another.",
      freudian: "Can mask hidden anxieties or buried feelings toward oneself or others.",
      emotional: "A major transition: letting go of an identity, relationship, or chapter.",
      cultural: "Across traditions, dreaming of death paradoxically signals transformation and new beginnings.",
    },
    meaning:
      "Death in dreams almost never means literal death — it symbolizes endings, transformation, and new beginnings.",
    questionHints: ["Whose death did you witness — your own, or another's?", "How did you feel as it happened?"],
  },
  {
    symbol: "naked",
    title: "Being Naked in Public",
    aliases: ["naked", "nude", "undressed", "exposed", "no clothes"],
    frameworks: {
      jungian: "The persona has dropped — your true, unguarded Self stands revealed.",
      freudian: "Linked to exhibitionist impulses and anxiety about exposure.",
      emotional: "Feeling vulnerable, judged, or unprepared — afraid others will see your flaws.",
      cultural: "An omen of being caught off guard, or of hidden truths coming to light.",
    },
    meaning:
      "Being naked in public reflects vulnerability, fear of exposure, or feeling unprepared and judged.",
    questionHints: ["Did others notice, or only you?", "Where were you when you realized?"],
  },
  {
    symbol: "snake",
    title: "Snakes",
    aliases: ["snake", "snakes", "serpent", "serpents", "viper", "cobra"],
    frameworks: {
      jungian: "A potent archetype of transformation, healing, and primal life energy.",
      freudian: "Famously read as a phallic symbol tied to hidden desire or fear.",
      emotional: "A person or situation that feels threatening, deceptive, or hard to trust.",
      cultural: "Both feared as an omen of an enemy and revered as a symbol of rebirth and wisdom.",
    },
    meaning:
      "Snakes are dual symbols — they can mean hidden threats and betrayal, or transformation, healing, and renewal.",
    questionHints: ["Did the snake threaten you, or simply appear?", "What colour was it?"],
  },
  {
    symbol: "baby",
    title: "A Baby",
    aliases: ["baby", "babies", "infant", "newborn", "pregnant", "pregnancy"],
    frameworks: {
      jungian: "The 'divine child' archetype — new potential, a fresh start within the Self.",
      freudian: "Tied to desires around creation, nurturing, or the past.",
      emotional: "A new project, idea, relationship, or responsibility being born in your life.",
      cultural: "A widely auspicious omen of new beginnings, innocence, and growth.",
    },
    meaning:
      "A baby symbolizes new beginnings, untapped potential, vulnerability, or a fresh responsibility entering your life.",
    questionHints: ["Was the baby yours, or a stranger's?", "Did you feel joy, or worry?"],
  },
  {
    symbol: "house",
    title: "A House",
    aliases: ["house", "home", "rooms", "building", "mansion", "childhood home"],
    frameworks: {
      jungian: "The house is the Self — each room a different part of your psyche, the cellar your unconscious.",
      freudian: "Often connected to the body or the family of origin.",
      emotional: "Your sense of self and security; unknown rooms hint at unexplored potential.",
      cultural: "A reflection of your life's foundation — its condition mirrors your inner state.",
    },
    meaning:
      "A house represents the self — different rooms reflect different aspects of your mind, memory, and identity.",
    questionHints: ["Did you recognize the house?", "Were there rooms you had never seen before?"],
  },
  {
    symbol: "exam",
    title: "Exams or Tests",
    aliases: ["exam", "test", "exams", "school", "unprepared", "failing test", "late for exam"],
    frameworks: {
      jungian: "A confrontation with self-judgement and the standards you hold yourself to.",
      freudian: "Performance anxiety tied to a fear of inadequacy.",
      emotional: "Feeling tested, scrutinized, or unprepared for a waking-life challenge.",
      cultural: "A common stress dream warning you feel under examination.",
    },
    meaning:
      "Exam dreams reflect feeling tested, judged, or unprepared — a fear of failing to meet expectations.",
    questionHints: ["Were you prepared, or caught off guard?", "What was the test about?"],
  },
  {
    symbol: "lost",
    title: "Being Lost",
    aliases: ["lost", "can't find", "maze", "wandering", "no way out", "lost my way"],
    frameworks: {
      jungian: "The ego has lost its orientation toward the Self — a call to find your direction.",
      freudian: "Anxiety about a path or decision in waking life.",
      emotional: "Uncertainty, indecision, or a feeling of having no clear direction.",
      cultural: "A sign to pause and rediscover your true path.",
    },
    meaning:
      "Being lost mirrors uncertainty and indecision — a feeling that you've lost your sense of direction in waking life.",
    questionHints: ["What were you searching for?", "Did you feel panic, or acceptance?"],
  },
  {
    symbol: "fire",
    title: "Fire",
    aliases: ["fire", "flames", "burning", "blaze", "inferno"],
    frameworks: {
      jungian: "Transformation, passion, and the purifying energy of change.",
      freudian: "Intense desire, anger, or repressed passion.",
      emotional: "Strong emotion — anger, passion, or a situation 'burning' out of control.",
      cultural: "Both destruction and renewal; controlled fire warms, wild fire warns.",
    },
    meaning:
      "Fire symbolizes intense emotion, passion, anger, or transformation — destructive when wild, purifying when controlled.",
    questionHints: ["Was the fire controlled, or spreading?", "Did you feel warmth, or fear?"],
  },
  {
    symbol: "flying-animals",
    title: "Birds",
    aliases: ["bird", "birds", "eagle", "owl", "dove", "raven", "crow"],
    frameworks: {
      jungian: "Messengers between conscious and unconscious — the soul and higher aspiration.",
      freudian: "Freedom and the lifting of restraint.",
      emotional: "Hopes, freedom, and a longing to rise above current circumstances.",
      cultural: "An omen — doves bring peace, ravens warn, owls carry wisdom or change.",
    },
    meaning:
      "Birds symbolize freedom, aspiration, and messages from the unconscious — their kind colours the meaning.",
    questionHints: ["What kind of bird was it?", "Was it free, or caged?"],
  },
  {
    symbol: "money",
    title: "Money",
    aliases: ["money", "cash", "coins", "wealth", "gold", "losing money", "finding money"],
    frameworks: {
      jungian: "Psychic energy and self-worth — what you truly value.",
      freudian: "Linked to power, control, and early-life associations.",
      emotional: "Self-worth, security, and your sense of value or scarcity.",
      cultural: "Finding money foretells gain; losing it warns of waste or insecurity.",
    },
    meaning:
      "Money reflects self-worth, power, and security — finding it suggests confidence, losing it suggests fear of lack.",
    questionHints: ["Did you find money, or lose it?", "How did having it make you feel?"],
  },
];

/**
 * A normalized lookup over symbols + aliases for fast in-memory retrieval.
 * Longer phrases are matched before single words to prefer specific symbols.
 */
const SYMBOL_INDEX: Array<{ needle: string; symbol: DreamSymbol }> = DREAM_SYMBOLS.flatMap((symbol) =>
  [symbol.symbol, ...symbol.aliases].map((alias) => ({ needle: alias.toLowerCase(), symbol }))
).sort((a, b) => b.needle.length - a.needle.length);

/**
 * Retrieve the dream-lore entries most relevant to a piece of dream text.
 * Pure, synchronous, in-memory — no I/O. Returns at most `limit` unique symbols.
 */
export function retrieveDreamKnowledge(dreamText: string, limit = 4): DreamSymbol[] {
  if (!dreamText) return [];
  const haystack = ` ${dreamText.toLowerCase().replace(/[^a-z\s]/g, " ").replace(/\s+/g, " ")} `;
  const matched: DreamSymbol[] = [];
  const seen = new Set<string>();
  for (const { needle, symbol } of SYMBOL_INDEX) {
    if (seen.has(symbol.symbol)) continue;
    if (haystack.includes(` ${needle} `) || haystack.includes(`${needle} `) || haystack.includes(` ${needle}`)) {
      matched.push(symbol);
      seen.add(symbol.symbol);
      if (matched.length >= limit) break;
    }
  }
  return matched;
}

/**
 * Build the grounding text injected into Morpheus's prompt. Empty when nothing
 * matches, so the persona falls back to an emotional/archetypal reading.
 */
export function buildDreamGrounding(symbols: DreamSymbol[]): string {
  if (symbols.length === 0) return "";
  const lore = symbols
    .map(
      (s) =>
        `- ${s.title}: ${s.meaning} (Jungian: ${s.frameworks.jungian} Emotional: ${s.frameworks.emotional})`
    )
    .join("\n");
  return `Dream lore relevant to this dream (weave it naturally into your reading — never list it mechanically, never cite framework names):\n${lore}`;
}

/** Clarifying-question hints drawn from the matched symbols. */
export function dreamQuestionHints(symbols: DreamSymbol[]): string[] {
  return symbols.flatMap((s) => s.questionHints);
}
