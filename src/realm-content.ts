// Route-specific SEO/GAIO content for each oracle realm.
//
// Every realm route swaps the static home FAQPage JSON-LD for its own FAQ and
// gets a visible FAQ + related-realms block injected into the empty
// `.realm-seo-slot` anchor inside its section (see serveAppShell in index.ts).
// The visible HTML and the FAQPage JSON-LD are rendered from the same data so
// structured data always matches on-page content.
//
// Tone rules: reflective, entertainment-framed, no deterministic promises, no
// medical/legal/financial claims. Dream Interpreter and Oracle of Olympus keep
// their bespoke FAQ handling in index.ts and are intentionally absent here.

export type RelatedRealm = {
  href: string;
  label: string;
  blurb: string;
};

export type RealmSeoContent = {
  /** The section id in index.html whose realm-seo-slot receives this content. */
  pageSectionId: string;
  /** Kicker line above the FAQ heading. */
  kicker: string;
  /** Visible FAQ heading (H2). */
  heading: string;
  faq: ReadonlyArray<[question: string, answer: string]>;
  related: ReadonlyArray<RelatedRealm>;
};

const REL = {
  crystalBall: {
    href: "/crystal-ball",
    label: "Crystal Ball Reading",
    blurb: "Ask Madame Fortuna a focused question about love, career, or a crossroads.",
  },
  tarot: {
    href: "/tarot",
    label: "Tarot Reading",
    blurb: "Draw a free past, present and future spread with Seraphina.",
  },
  westernZodiac: {
    href: "/western-zodiac",
    label: "Daily Horoscope",
    blurb: "Pick your zodiac sign for today's free horoscope from Astaria.",
  },
  chineseZodiac: {
    href: "/chinese-zodiac",
    label: "Chinese Zodiac",
    blurb: "Find your birth-year animal in Master Longwei's Jade Pavilion.",
  },
  magic8: {
    href: "/magic-8-ball",
    label: "Magic 8 Ball",
    blurb: "Ask a quick yes-or-no question of the cosmic arcade oracle.",
  },
  numerology: {
    href: "/numerology",
    label: "Numerology Calculator",
    blurb: "Calculate your life path number from your date of birth.",
  },
  dailyFortune: {
    href: "/daily-fortune",
    label: "Daily Fortune",
    blurb: "Reveal today's fortune, lucky number, color, and affirmation.",
  },
  loveMatch: {
    href: "/love-match",
    label: "Love Compatibility",
    blurb: "Test zodiac, numerology and tarot chemistry in the Temple of Love.",
  },
  birthChart: {
    href: "/birth-chart",
    label: "Birth Chart Reading",
    blurb: "Map your Sun, Moon, and Rising signs from your birth details.",
  },
  palmistry: {
    href: "/palm-reading",
    label: "Palm Reading",
    blurb: "Explore the heart, head, life, and fate lines of your hand.",
  },
  iching: {
    href: "/iching-oracle",
    label: "I Ching Oracle",
    blurb: "Cast three coins six times to build a hexagram of changes.",
  },
  dream: {
    href: "/dream-interpreter",
    label: "Dream Interpreter",
    blurb: "Tell Morpheus your dream and learn what its symbols may mean.",
  },
  mystics: {
    href: "/mystics",
    label: "Meet the Mystics",
    blurb: "Discover the fictional guides behind every Oracle Mirror realm.",
  },
} as const;

const ENTERTAINMENT_NOTE =
  "Oracle Mirror readings are symbolic reflections created for entertainment and personal insight. They are not medical, legal, financial, or psychological advice — for serious concerns, consult a qualified professional.";

export const REALM_SEO_CONTENT: Record<string, RealmSeoContent> = {
  "/crystal-ball": {
    pageSectionId: "page-crystal-ball",
    kicker: "Questions for the crystal",
    heading: "Crystal Ball Reading FAQ",
    faq: [
      [
        "What is an online crystal ball reading?",
        "A crystal ball reading (scrying) is a classic form of fortune telling where a seer interprets images in a crystal sphere. On Oracle Mirror, Madame Fortuna weaves your chosen focus, timeframe, mood, element, omen, and moon phase into a personal, poetic reading — free, instant, and with no account required.",
      ],
      [
        "What are the best questions to ask a crystal ball?",
        "Open, focused questions work best: 'What should I understand about my career crossroads?' or 'What energy surrounds my relationship this season?' Yes-or-no questions belong to the Magic 8 Ball; the crystal prefers questions with room for nuance.",
      ],
      [
        "What should I not ask the crystal ball?",
        "Avoid questions about health, legal matters, finances, or emergencies — the mists are for reflection and entertainment, not professional advice. Also avoid sharing sensitive personal information in your question; a reading needs your situation's shape, not its private details.",
      ],
      [
        "Is the crystal ball reading really free and private?",
        "Yes. Every reading is free and supported by advertising. Completed readings are saved only in your own browser's local Archive — they are never uploaded to a public profile.",
      ],
    ],
    related: [REL.tarot, REL.magic8, REL.dream],
  },

  "/western-zodiac": {
    pageSectionId: "page-western-zodiac",
    kicker: "Written in the stars",
    heading: "Daily Horoscope FAQ",
    faq: [
      [
        "How do I get my free daily horoscope?",
        "Choose your zodiac sign in the Celestial Observatory and Astaria the Star-Seer reads what the day's alignments suggest for love, work, and inner weather. A new reading awaits every day, free and without sign-up.",
      ],
      [
        "What are the 12 zodiac signs and their dates?",
        "Aries (Mar 21 – Apr 19), Taurus (Apr 20 – May 20), Gemini (May 21 – Jun 20), Cancer (Jun 21 – Jul 22), Leo (Jul 23 – Aug 22), Virgo (Aug 23 – Sep 22), Libra (Sep 23 – Oct 22), Scorpio (Oct 23 – Nov 21), Sagittarius (Nov 22 – Dec 21), Capricorn (Dec 22 – Jan 19), Aquarius (Jan 20 – Feb 18), and Pisces (Feb 19 – Mar 20).",
      ],
      [
        "How accurate are daily horoscopes?",
        "Horoscopes offer symbolic guidance rather than literal prediction. Read yours as a daily prompt for reflection — a lens for the day's choices, not a script for them. Oracle Mirror horoscopes are created for entertainment and personal insight.",
      ],
      [
        "What is the difference between the Western and Chinese zodiac?",
        "The Western zodiac assigns a sign by your birth month along the sun's path; the Chinese zodiac assigns an animal by your birth year in a repeating 12-year cycle. You can explore both here — many seekers enjoy comparing the two portraits.",
      ],
    ],
    related: [REL.chineseZodiac, REL.birthChart, REL.dailyFortune],
  },

  "/chinese-zodiac": {
    pageSectionId: "page-chinese-zodiac",
    kicker: "The cycle of twelve",
    heading: "Chinese Zodiac FAQ",
    faq: [
      [
        "How do I find my Chinese zodiac animal?",
        "Enter your birth year in the Jade Pavilion and Master Longwei reveals your animal. The Chinese zodiac follows a repeating 12-year cycle, so your animal is determined by the year you were born.",
      ],
      [
        "What are the 12 Chinese zodiac animals in order?",
        "Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, and Pig. Each animal carries its own personality themes, strengths, and traditional compatibility pairings.",
      ],
      [
        "What if I was born in January or February?",
        "The traditional Chinese zodiac year begins at Lunar New Year, which falls in late January or February. If your birthday lands in those weeks, your traditional animal may be the one from the previous calendar year — worth reading both portraits.",
      ],
      [
        "Is the Chinese zodiac reading free?",
        "Yes. The reading is free, no account is needed, and like all Oracle Mirror realms it is offered for reflection and entertainment.",
      ],
    ],
    related: [REL.westernZodiac, REL.numerology, REL.loveMatch],
  },

  "/tarot": {
    pageSectionId: "page-tarot",
    kicker: "The cards speak",
    heading: "Tarot Reading FAQ",
    faq: [
      [
        "How does the free tarot reading work?",
        "Seraphina deals a three-card spread for past, present, and future. You draw your cards, and each is interpreted in the position it fell — where you have been, where you stand, and what energy gathers ahead. Free, private, and no account required.",
      ],
      [
        "What does a past, present, future tarot spread mean?",
        "It is the classic beginner-friendly spread: the first card reflects influences that shaped your situation, the second the forces at work right now, and the third the direction things lean if the current course holds. It reads momentum, not fixed fate.",
      ],
      [
        "Do I need to know tarot card meanings to use this?",
        "No. Every card you draw comes with its interpretation woven into the reading. Over time you may start recognising the Major Arcana — the Fool's leap, the Tower's upheaval, the Star's hope — but no prior knowledge is needed.",
      ],
      [
        "Are tarot readings accurate?",
        "Tarot works as a symbolic mirror: the cards give shape to questions you are already carrying. Oracle Mirror readings are created for reflection and entertainment — treat them as prompts for your own judgment, not instructions.",
      ],
    ],
    related: [REL.crystalBall, REL.loveMatch, REL.iching],
  },

  "/love-match": {
    pageSectionId: "page-love-match",
    kicker: "Chemistry of hearts",
    heading: "Love Compatibility FAQ",
    faq: [
      [
        "How does the love compatibility calculator work?",
        "The Temple of Love weighs affinity across five mystical frameworks — zodiac alignment, life path numerology, a tarot drawing, a resonance quiz, and path omens — and combines them into a Cosmic Chemistry Score from 0 to 100%, unlocking Rosalind's relationship reading.",
      ],
      [
        "What is zodiac compatibility?",
        "Zodiac compatibility compares two signs' elements and temperaments — fire, earth, air, and water — to describe how two personalities may harmonise or challenge each other. It is a playful lens on a relationship, not a verdict on it.",
      ],
      [
        "What is the AI Soulmate Vision?",
        "The Soulmate Vision is an AI-generated artistic portrait of a destined companion, conjured from your answers. It is a piece of romantic entertainment — a painting from the aether, not a photograph of a real person.",
      ],
      [
        "Are the names and birthdays I enter kept private?",
        "Names and birth dates are used only to generate your reading in the moment. Completed readings are stored in your own browser's local Archive and are never published. Avoid entering sensitive personal details — first names are plenty for the Temple's purposes.",
      ],
    ],
    related: [REL.westernZodiac, REL.numerology, REL.tarot],
  },

  "/love-oracle": {
    pageSectionId: "page-love-match",
    kicker: "Ask the heart's oracle",
    heading: "Love Oracle FAQ",
    faq: [
      [
        "What can I ask the Love Oracle?",
        "Ask Rosalind about romance, connection, timing, soulmates, or the emotional weather of a relationship — 'What should I understand about this connection?' works better than demands for guarantees. The oracle answers with reflective, symbolic guidance.",
      ],
      [
        "Who is Rosalind the Love Oracle?",
        "Rosalind is Oracle Mirror's fictional keeper of the Temple of Love — a mystical persona who voices the love readings. She is a character created for the experience, not a real advisor.",
      ],
      [
        "Should I make relationship decisions based on the reading?",
        "No. Love Oracle readings are entertainment and reflection — a way to hear your own heart think out loud. Real relationship decisions deserve real conversations, and serious concerns deserve a qualified counsellor.",
      ],
      [
        "Is the Love Oracle free and private?",
        "Yes. Readings are free, no account is needed, and results are saved only in your browser's local Archive. Avoid sharing sensitive personal information in your question.",
      ],
    ],
    related: [REL.loveMatch, REL.tarot, REL.crystalBall],
  },

  "/magic-8-ball": {
    pageSectionId: "page-magic8",
    kicker: "Shake the cosmos",
    heading: "Magic 8 Ball FAQ",
    faq: [
      [
        "How do I ask the Magic 8 Ball a question?",
        "Phrase your question so it can be answered yes or no — 'Will this week bring good news?' — then shake the cosmic sphere and read the reply that floats up from the deep.",
      ],
      [
        "What kinds of questions work best?",
        "Light, playful, low-stakes questions are the 8 Ball's natural habitat: plans, hunches, small dares, friendly wagers. For questions that need nuance, the Crystal Ball or Tarot realms give fuller readings.",
      ],
      [
        "Should I use the Magic 8 Ball for serious decisions?",
        "No — the Magic 8 Ball is pure entertainment. Never rely on it for medical, legal, financial, or safety decisions. Its gift is levity, not counsel.",
      ],
      [
        "Is the online Magic 8 Ball free?",
        "Yes, completely free with unlimited shakes and no account required.",
      ],
    ],
    related: [REL.crystalBall, REL.dailyFortune, REL.iching],
  },

  "/numerology": {
    pageSectionId: "page-numerology",
    kicker: "The arithmetic of fate",
    heading: "Numerology & Life Path Number FAQ",
    faq: [
      [
        "What is a life path number?",
        "The life path number is numerology's core signature — a single digit (or master number) derived from your full date of birth, said to describe your natural temperament, talents, and recurring life themes.",
      ],
      [
        "How is my life path number calculated?",
        "Add every digit of your birth date and keep reducing the sum until a single digit remains — unless you strike 11, 22, or 33, which are kept as master numbers. Pythius performs the full calculation for you and explains the result.",
      ],
      [
        "What do master numbers 11, 22, and 33 mean?",
        "Master numbers are traditionally read as intensified paths: 11 the intuitive visionary, 22 the master builder who turns dreams into structures, and 33 the compassionate teacher. They carry the themes of 2, 4, and 6 at higher voltage.",
      ],
      [
        "Is numerology real?",
        "Numerology is a symbolic tradition, not a science. Its patterns give an evocative vocabulary for self-reflection — Oracle Mirror offers it freely for insight and entertainment, not as a measure of destiny.",
      ],
    ],
    related: [REL.birthChart, REL.westernZodiac, REL.loveMatch],
  },

  "/daily-fortune": {
    pageSectionId: "page-daily-fortune",
    kicker: "Today's scroll",
    heading: "Daily Fortune FAQ",
    faq: [
      [
        "What is a daily fortune reading?",
        "The Dawn Oracle unrolls a fresh scroll each day: a cosmic theme, a piece of advice, a lucky number, color, and element, and an affirmation to carry with you. It takes seconds and costs nothing.",
      ],
      [
        "How often does my daily fortune change?",
        "A new fortune arrives with every dawn. Return each day for a new theme and affirmation — many seekers make it a small morning ritual alongside their horoscope.",
      ],
      [
        "Should I make decisions based on my daily fortune?",
        "Treat the fortune as a gentle prompt, not a plan. It is written for reflection and entertainment — a mood for the day, with all real choices remaining yours.",
      ],
      [
        "Is the daily fortune free?",
        "Yes — free every day, with no account or sign-up. The site is supported by advertising.",
      ],
    ],
    related: [REL.westernZodiac, REL.magic8, REL.numerology],
  },

  "/birth-chart": {
    pageSectionId: "page-birthchart",
    kicker: "Your celestial map",
    heading: "Birth Chart FAQ",
    faq: [
      [
        "What is a birth chart?",
        "A birth chart (natal chart) is a map of where the Sun, Moon, and planets stood at the moment you were born. Oracle Mirror reads your Sun, Moon, Ascendant, Mercury, Venus, and Mars placements and weaves them into one interpretation.",
      ],
      [
        "What do I need for a birth chart reading?",
        "Your birth date is essential; adding your birth time and place sharpens the chart — especially your Ascendant (rising sign), which shifts roughly every two hours. If you don't know your birth time, the reading still works with what you have.",
      ],
      [
        "What are Sun, Moon, and Rising signs?",
        "Your Sun sign is your core identity — the zodiac sign most people know. Your Moon sign describes your inner, emotional nature. Your Rising sign (Ascendant) is the face you show the world on first meeting. Together they form astrology's 'big three'.",
      ],
      [
        "Is my birth information stored anywhere?",
        "Your details are used to compute the reading, and the finished reading is saved only in your own browser's local Archive. Nothing is published or added to a profile.",
      ],
    ],
    related: [REL.westernZodiac, REL.numerology, REL.chineseZodiac],
  },

  "/palm-reading": {
    pageSectionId: "page-palmistry",
    kicker: "Lines of the hand",
    heading: "Palm Reading FAQ",
    faq: [
      [
        "How does an online palm reading work?",
        "You describe your hand — its shape and the character of its major lines — and the palmist voice of Oracle Mirror interprets the combination in the tradition of classic palmistry. No photo upload is needed.",
      ],
      [
        "What are the main lines in palmistry?",
        "The four classics: the heart line (emotion and connection), the head line (thought and decision-making), the life line (vitality and life's rhythm), and the fate line (career and life direction). Their depth, length, and curves color the reading.",
      ],
      [
        "Does a short life line mean a short life?",
        "No — that is folklore, not palmistry as practiced. Readers treat the life line as a picture of energy and life's changes, never a countdown. No palm reading can predict health or lifespan, and Oracle Mirror makes no such claims.",
      ],
      [
        "Is palm reading accurate?",
        "Palmistry is an ancient symbolic art rather than a science. Enjoy it as a reflective portrait — a conversation starter with yourself — offered here free, for entertainment.",
      ],
    ],
    related: [REL.crystalBall, REL.birthChart, REL.numerology],
  },

  "/iching-oracle": {
    pageSectionId: "page-iching",
    kicker: "The book of changes",
    heading: "I Ching Oracle FAQ",
    faq: [
      [
        "What is the I Ching?",
        "The I Ching, or Book of Changes, is a Chinese divination classic more than two thousand years old. It answers questions through hexagrams — six-line figures — each carrying a named theme such as 'Waiting', 'Breakthrough', or 'The Well'.",
      ],
      [
        "How does the coin toss method work?",
        "You cast three coins six times. Each throw's heads-and-tails combination forms one line, building your hexagram from the bottom up. Changing lines can point to a second hexagram — the direction your situation is moving.",
      ],
      [
        "What is a hexagram?",
        "A hexagram is a stack of six lines, each either solid (yang) or broken (yin). There are 64 possible hexagrams, and together they map the I Ching's philosophy of situations rising, ripening, and turning into one another.",
      ],
      [
        "How should I phrase my I Ching question?",
        "Open questions suit the oracle best: 'What should I understand about this decision?' rather than 'Will X happen?'. The I Ching describes the character of a moment — reflectively and, here, for entertainment — rather than issuing verdicts.",
      ],
    ],
    related: [REL.tarot, REL.chineseZodiac, REL.crystalBall],
  },

  "/mystics": {
    pageSectionId: "page-personas",
    kicker: "Keepers of the realms",
    heading: "About the Mystics",
    faq: [
      [
        "Who are the Oracle Mirror mystics?",
        "Each realm is voiced by its own mystical guide — Madame Fortuna at the crystal ball, Seraphina at the tarot table, Astaria in the observatory, Master Longwei in the Jade Pavilion, Rosalind in the Temple of Love, Pythius among the numbers, and Morpheus Vey walking the dream roads.",
      ],
      [
        "Are the mystics real people?",
        "No. The mystics are fictional characters created to give each realm its voice and atmosphere. They are storytellers for an entertainment experience, not real advisors, psychics, or experts.",
      ],
      [
        "Which mystic should I visit first?",
        "Follow your question: a focused personal question suits Madame Fortuna's crystal ball, matters of the heart belong to Rosalind, a strange dream calls for Morpheus, and if you only know your birthday, Astaria, Master Longwei, and Pythius all read from it.",
      ],
    ],
    related: [REL.crystalBall, REL.dream, REL.loveMatch],
  },

  "/archive": {
    pageSectionId: "page-archive",
    kicker: "Your private scrolls",
    heading: "Reading Archive FAQ",
    faq: [
      [
        "Where are my saved readings stored?",
        "Every completed reading is saved in your own browser's local storage, on your device. Nothing is uploaded to a server, shared with third parties, or visible to anyone else.",
      ],
      [
        "How do I clear my reading archive?",
        "You can remove readings from this page, or clear them all at once by clearing this site's browsing data in your browser settings. Because storage is local, clearing it on one device does not affect another.",
      ],
      [
        "Will my archive follow me to another device?",
        "No — and that is by design. The archive lives only in the browser where the readings were made, which keeps your fortune-telling history entirely under your control.",
      ],
    ],
    related: [REL.dailyFortune, REL.crystalBall, REL.mystics],
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function realmFaqJsonLd(content: RealmSeoContent): string {
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
  return `<script type="application/ld+json">${JSON.stringify(faq)}</script>`;
}

/**
 * Visible FAQ + related-realms + disclaimer block rendered into the realm's
 * `.realm-seo-slot`. Mirrors the markup pattern of the dream realm's FAQ so it
 * inherits the existing `.realm-faq` / `.faq-item` styling.
 */
export function realmSeoHtml(content: RealmSeoContent): string {
  const faqItems = content.faq
    .map(
      ([question, answer]) => `<div class="faq-item">
            <h3>${escapeHtml(question)}</h3>
            <p>${escapeHtml(answer)}</p>
          </div>`
    )
    .join("\n          ");

  const relatedCards = content.related
    .map(
      (realm) => `<a href="${realm.href}" class="related-realm-card">
              <strong>${escapeHtml(realm.label)}</strong>
              <span>${escapeHtml(realm.blurb)}</span>
            </a>`
    )
    .join("\n            ");

  return `<section class="realm-faq" aria-label="${escapeHtml(content.heading)}">
          <p class="overview-kicker">${escapeHtml(content.kicker)}</p>
          <h2>${escapeHtml(content.heading)}</h2>
          ${faqItems}
          <div class="related-realms" aria-label="Related realms">
            <h3>Continue Your Journey</h3>
            ${relatedCards}
          </div>
          <p class="realm-disclaimer">${escapeHtml(ENTERTAINMENT_NOTE)}</p>
        </section>`;
}
