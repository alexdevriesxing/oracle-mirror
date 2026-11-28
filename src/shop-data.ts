import { EXPANDED_SHOP_PRODUCTS } from "./shop-catalog-expanded.ts";

export type DepartmentSlug =
  | "tarot-oracle"
  | "crystals-symbolism"
  | "astrology-zodiac"
  | "dream-journaling"
  | "ritual-atmosphere"
  | "iching-runes"
  | "meditation-reflection"
  | "celestial-gifts";

export type ExperienceLevel = "beginner" | "intermediate" | "collector";

export type GiftPersonaSlug =
  | "tarot-beginner"
  | "celestial-reader"
  | "dream-keeper"
  | "rune-enthusiast"
  | "crystal-collector"
  | "symbolism-explorer";

export type RealmShopSlug =
  | "seraphina-tarot-library"
  | "madame-fortuna-crystal-ball"
  | "astaria-celestial-observatory"
  | "master-longwei-jade-pavilion"
  | "morpheus-vey-dream-library"
  | "pythius-numerology-chamber"
  | "elder-futhark-rune-chamber";

export type ProductFormat =
  | "Deck & Guidebook"
  | "Paperback"
  | "Hardcover"
  | "Boxed Kit"
  | "Journal"
  | "Physical Instrument"
  | "Postcard Set";

export interface ShopDepartment {
  slug: DepartmentSlug;
  name: string;
  kicker: string;
  glyph: string;
  description: string;
  editorialIntro: string;
}

export interface ShopProduct {
  slug: string;
  asin: string;
  title: string;
  creator: string;
  department: DepartmentSlug;
  format: ProductFormat;
  experienceLevel: ExperienceLevel;
  giftPersonas: GiftPersonaSlug[];
  realms: RealmShopSlug[];
  summary: string;
  whyItFits: string;
  groundedNote: string;
  artworkGlyph: string;
  schemaType: "Book" | "Product";
}

export interface RealmShopCollection {
  slug: RealmShopSlug;
  personaName: string;
  realmTitle: string;
  realmPath: string;
  glyph: string;
  tagline: string;
  description: string;
  curatorialNote: string;
  departments: DepartmentSlug[];
}

export interface GiftPersonaProfile {
  slug: GiftPersonaSlug;
  title: string;
  description: string;
  glyph: string;
}

export interface BuyingGuide {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  readingTime: string;
  departments: DepartmentSlug[];
  answerFirst?: string;
  historicalContext?: string;
  comparisonTable?: {
    headers: string[];
    rows: string[][];
  };
  sections: Array<{ heading: string; body: string }>;
  faq?: Array<{ question: string; answer: string }>;
  groundedBoundary: string;
  recommendedSlugs: string[];
}

export interface BountyOffer {
  slug: string;
  programName: string;
  kicker: string;
  summary: string;
  customerBenefit: string;
  eligibilityNote: string;
  amazonPath: string;
  ctaLabel: string;
  relevantDepartments: DepartmentSlug[];
}

export interface SocialCampaignTemplate {
  id: string;
  formatName: string;
  platforms: Array<"Instagram" | "Facebook" | "Pinterest" | "Threads" | "TikTok">;
  visualConcept: string;
  caption: string;
  hashtags: string[];
  videoScript: string;
  landingPath: string;
  featuredProductSlug: string;
}

export const SHOP_DEPARTMENTS: readonly ShopDepartment[] = [
  {
    slug: "tarot-oracle",
    name: "Tarot & Oracle Decks",
    kicker: "Cabinet I · Illustrated Cards & Companions",
    glyph: "✦",
    description: "Classic and contemporary 78-card tarot decks, Lenormand systems, oracle sets, and foundational study companions.",
    editorialIntro: "From the 1909 Rider-Waite-Smith tradition to modern illustrated decks and structured study manuals, every edition here is chosen for clear symbolism and enduring craft.",
  },
  {
    slug: "crystals-symbolism",
    name: "Crystals & Symbolism",
    kicker: "Cabinet II · Mineralogy, Scrying & Archetypes",
    glyph: "◇",
    description: "Illustrated crystal reference books, scrying curiosities, pendulum kits, and foundational works on symbolic psychology.",
    editorialIntro: "Thoughtful reference volumes and tabletop curiosities for readers who appreciate mineralogy, historical scrying traditions, and Jungian symbolism without overstated claims.",
  },
  {
    slug: "astrology-zodiac",
    name: "Astrology & Zodiac",
    kicker: "Cabinet III · Ephemeris, Natal Charts & Night Sky",
    glyph: "☉",
    description: "Natal chart manuals, planetary archetype guides, birthday compendiums, and practical stargazing field guides.",
    editorialIntro: "A curated observatory shelf pairing accessible natal-chart books with astronomical sky-watching guides so symbolism and observable astronomy remain clearly distinct.",
  },
  {
    slug: "dream-journaling",
    name: "Dream Journaling",
    kicker: "Cabinet IV · Nocturnal Notebooks & Depth Psychology",
    glyph: "☾",
    description: "Bedside dream notebooks, active-dreaming guides, and classic analytical psychology texts on dream symbolism.",
    editorialIntro: "Quiet paperbound companions for capturing morning fragments before they fade, alongside respected works on dream interpretation and creative reflection.",
  },
  {
    slug: "ritual-atmosphere",
    name: "Ritual & Atmosphere",
    kicker: "Cabinet V · Resonance, Hearth & Seasonal Craft",
    glyph: "🕯",
    description: "Hand-hammered Tibetan singing bowls, seasonal hearth guides, and lunar-cycle reference books for calm evening routines.",
    editorialIntro: "Tactile acoustic instruments and reflective seasonal books designed to bring unhurried stillness to a reading table or study.",
  },
  {
    slug: "iching-runes",
    name: "I Ching & Runes",
    kicker: "Cabinet VI · Classical Translations & Elder Futhark",
    glyph: "☰",
    description: "Scholarly Book of Changes translations, modern I Ching commentaries, Elder Futhark handbooks, and boxed rune kits.",
    editorialIntro: "Respectful translations of the Yijing and historically grounded Elder Futhark guides paired with physical rune sets for unhurried contemplation.",
  },
  {
    slug: "meditation-reflection",
    name: "Meditation & Reflection",
    kicker: "Cabinet VII · Posture, Breath & Quiet Attention",
    glyph: "◎",
    description: "Buckwheat zafu cushions and grounded mindfulness books for steady posture and clear, everyday attention.",
    editorialIntro: "Supportive zafu cushions and plain-spoken meditation guides that keep contemplative practice practical, ergonomic, and free of mystification.",
  },
  {
    slug: "celestial-gifts",
    name: "Celestial Gifts",
    kicker: "Cabinet VIII · Foil-Stamped Stationery & Keepsakes",
    glyph: "✧",
    description: "Embossed constellation journals, archival night-sky postcard boxes, and timeless astronomy classics for thoughtful gifting.",
    editorialIntro: "Keepsake stationery, vintage star-map postcards, and enduring cosmic literature suited for readers, stargazers, and reflective friends.",
  },
];

export const BASE_SHOP_PRODUCTS: readonly ShopProduct[] = [
  // 1. Tarot & Oracle Decks (14 items)
  {
    slug: "rider-waite-tarot-deck",
    asin: "091386613X",
    title: "The Rider-Waite Tarot Deck",
    creator: "Arthur Edward Waite & Pamela Colman Smith (U.S. Games Systems)",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "beginner",
    giftPersonas: ["tarot-beginner", "symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "The 1909 78-card standard whose scenic Minor Arcana illustrations shaped modern English-language tarot.",
    whyItFits: "Matches Oracle Mirror's card symbolism directly, making it the clearest physical companion for learning upright and reversed meanings.",
    groundedNote: "Published as a symbolic and artistic deck; useful for reflection and visual storytelling rather than literal prediction.",
    artworkGlyph: "✦",
    schemaType: "Product",
  },
  {
    slug: "modern-witch-tarot-deck",
    asin: "1454938684",
    title: "The Modern Witch Tarot Deck",
    creator: "Lisa Sterle",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "beginner",
    giftPersonas: ["tarot-beginner"],
    realms: ["seraphina-tarot-library"],
    summary: "A contemporary, vibrant 78-card reimagining of classic Rider-Waite-Smith compositions in everyday modern dress.",
    whyItFits: "Keeps traditional visual cues recognizable while offering a fresh, approachable aesthetic for daily three-card draws.",
    groundedNote: "Designed for personal reflection and creative journaling.",
    artworkGlyph: "☽",
    schemaType: "Product",
  },
  {
    slug: "wild-unknown-tarot-keepsake",
    asin: "0062466593",
    title: "The Wild Unknown Tarot Deck and Guidebook",
    creator: "Kim Krans",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "intermediate",
    giftPersonas: ["tarot-beginner", "symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "Hand-drawn ink-and-watercolor natural history imagery housed in a keepsake box with an illustrated guidebook.",
    whyItFits: "Appeals to visual thinkers who prefer animal, botanical, and elemental archetypes over conventional human figures.",
    groundedNote: "Atmospheric fine-art deck suited to contemplative prompts.",
    artworkGlyph: "❦",
    schemaType: "Product",
  },
  {
    slug: "morgan-greer-tarot-deck",
    asin: "0913866911",
    title: "Morgan-Greer Tarot Deck",
    creator: "Bill F. Greer & Lloyd Morgan (U.S. Games Systems)",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "collector",
    giftPersonas: ["symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "A borderless 1979 classic featuring rich, saturated close-up compositions that emphasize emotional immediacy.",
    whyItFits: "Ideal for readers who enjoy bold, uninterrupted artwork in Celtic Cross and Horseshoe spreads.",
    groundedNote: "A classic collectible edition for symbolic study.",
    artworkGlyph: "❖",
    schemaType: "Product",
  },
  {
    slug: "shadowscapes-tarot-kit",
    asin: "0738715794",
    title: "Shadowscapes Tarot Kit",
    creator: "Stephanie Pui-Mun Law & Barbara Moore",
    department: "tarot-oracle",
    format: "Boxed Kit",
    experienceLevel: "collector",
    giftPersonas: ["symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "Luminous watercolor fantasy illustrations paired with a 264-page companion book exploring myth and folklore.",
    whyItFits: "Resonates with Oracle Mirror's storybook aesthetic and deep symbolic essays.",
    groundedNote: "Artistic and literary tarot edition for reflective reading.",
    artworkGlyph: "✧",
    schemaType: "Product",
  },
  {
    slug: "gilded-reverie-lenormand-expanded",
    asin: "157281893X",
    title: "Gilded Reverie Lenormand (Expanded Edition)",
    creator: "Ciro Marchetti",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "intermediate",
    giftPersonas: ["symbolism-explorer", "tarot-beginner"],
    realms: ["seraphina-tarot-library"],
    summary: "A 47-card gilded-edge Lenormand deck including the classic 36 symbols plus 8 supplemental cards and guidebook.",
    whyItFits: "Directly complements Oracle Mirror's 36-card Lenormand reader and symbol library.",
    groundedNote: "Structured combinatorial symbol system for pattern reflection.",
    artworkGlyph: "⚜",
    schemaType: "Product",
  },
  {
    slug: "work-your-light-oracle-cards",
    asin: "178180995X",
    title: "Work Your Light Oracle Cards",
    creator: "Rebecca Campbell & Danielle Noel",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "beginner",
    giftPersonas: ["tarot-beginner", "celestial-reader"],
    realms: ["seraphina-tarot-library"],
    summary: "A 44-card collage-illustrated oracle deck focused on daily intention prompts and reflective questions.",
    whyItFits: "Offers an accessible single-card morning ritual alongside Oracle Mirror's Daily Fortune.",
    groundedNote: "Designed for personal reflection and journaling prompts.",
    artworkGlyph: "☀",
    schemaType: "Product",
  },
  {
    slug: "moonology-oracle-cards",
    asin: "1781809968",
    title: "Moonology Oracle Cards",
    creator: "Yasmin Boland & Nyx Rowan",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader", "tarot-beginner"],
    realms: ["seraphina-tarot-library", "astaria-celestial-observatory"],
    summary: "A 44-card deck organized around lunar phases, eclipses, and zodiacal full-moon themes.",
    whyItFits: "Pairs naturally with Oracle Mirror's lunar phase guide and Astaria's Celestial Observatory.",
    groundedNote: "Uses lunar cycles as poetic metaphor rather than astronomical forecasting.",
    artworkGlyph: "☾",
    schemaType: "Product",
  },
  {
    slug: "sacred-traveler-oracle-cards",
    asin: "1401951589",
    title: "Sacred Traveler Oracle Cards",
    creator: "Denise Linn",
    department: "tarot-oracle",
    format: "Deck & Guidebook",
    experienceLevel: "beginner",
    giftPersonas: ["symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "A 52-card landscape-inspired oracle set built around journeys, thresholds, and seasonal transitions.",
    whyItFits: "Great for travelers and journalers seeking open-ended metaphorical prompts.",
    groundedNote: "Reflective card prompts for creative writing and quiet check-ins.",
    artworkGlyph: "🧭",
    schemaType: "Product",
  },
  {
    slug: "seventy-eight-degrees-of-wisdom",
    asin: "1578636655",
    title: "Seventy-Eight Degrees of Wisdom",
    creator: "Rachel Pollack",
    department: "tarot-oracle",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["tarot-beginner", "symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "The landmark card-by-card study of tarot archetypes, psychological symbolism, and spread synthesis.",
    whyItFits: "Widely regarded as the single most respected foundational book for deepening tarot literacy.",
    groundedNote: "Approaches tarot through history, myth, and psychology.",
    artworkGlyph: "📖",
    schemaType: "Book",
  },
  {
    slug: "kitchen-table-tarot",
    asin: "0738750778",
    title: "Kitchen Table Tarot",
    creator: "Melissa Cynova",
    department: "tarot-oracle",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["tarot-beginner"],
    realms: ["seraphina-tarot-library"],
    summary: "A warm, plain-spoken guide to reading tarot without intimidation, jargon, or rigid memorization.",
    whyItFits: "Ideal for newcomers who want practical ways to connect card keywords to everyday life.",
    groundedNote: "Grounded, conversational introduction to personal card reading.",
    artworkGlyph: "☕",
    schemaType: "Book",
  },
  {
    slug: "holistic-tarot",
    asin: "158394835X",
    title: "Holistic Tarot: An Integrative Approach",
    creator: "Benebell Wen",
    department: "tarot-oracle",
    format: "Paperback",
    experienceLevel: "collector",
    giftPersonas: ["symbolism-explorer"],
    realms: ["seraphina-tarot-library"],
    summary: "An encyclopedic 800-page reference covering tarot structure, spreads, ethics, and analytical frameworks.",
    whyItFits: "The definitive desk reference for serious students of the 78-card system.",
    groundedNote: "Emphasizes ethical boundaries, critical thinking, and self-reflection.",
    artworkGlyph: "📚",
    schemaType: "Book",
  },
  {
    slug: "tarot-for-yourself",
    asin: "1578636795",
    title: "Tarot for Yourself (35th Anniversary Edition)",
    creator: "Mary K. Greer",
    department: "tarot-oracle",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["tarot-beginner", "dream-keeper"],
    realms: ["seraphina-tarot-library", "pythius-numerology-chamber"],
    summary: "The classic workbook of journaling exercises, birth-card calculations, and personal tarot dialogues.",
    whyItFits: "Bridges tarot symbolism with numerological birth-card reflection and structured journaling.",
    groundedNote: "Workbook-style self-inquiry without deterministic claims.",
    artworkGlyph: "✍",
    schemaType: "Book",
  },
  {
    slug: "ultimate-guide-to-tarot",
    asin: "1592336574",
    title: "The Ultimate Guide to Tarot",
    creator: "Liz Dean",
    department: "tarot-oracle",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["tarot-beginner"],
    realms: ["seraphina-tarot-library"],
    summary: "An illustrated beginner's manual covering Major and Minor Arcana meanings, spreads, and symbolism.",
    whyItFits: "Clean visual layout makes it easy to keep beside a first deck.",
    groundedNote: "Introductory reference for card meanings and spread structure.",
    artworkGlyph: "✦",
    schemaType: "Book",
  },

  // 2. Crystals & Symbolism (6 items)
  {
    slug: "the-crystal-bible",
    asin: "1582972400",
    title: "The Crystal Bible",
    creator: "Judy Hall",
    department: "crystals-symbolism",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["crystal-collector"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "An illustrated pocket directory cataloging hundreds of minerals by appearance, geology, and traditional lore.",
    whyItFits: "Complements Oracle Mirror's 36-stone Crystal Symbolism library with full-color specimen photography.",
    groundedNote: "Cultural and collector's reference; not a substitute for medical or health care.",
    artworkGlyph: "◇",
    schemaType: "Book",
  },
  {
    slug: "crystals-for-beginners",
    asin: "1623159911",
    title: "Crystals for Beginners",
    creator: "Karen Frazier",
    department: "crystals-symbolism",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["crystal-collector"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "A straightforward illustrated guide to identifying common stones and organizing a personal collection.",
    whyItFits: "Accessible starting point for readers curious about mineral traditions and display.",
    groundedNote: "Presented for symbolic appreciation and collection care, not medical treatment.",
    artworkGlyph: "◈",
    schemaType: "Book",
  },
  {
    slug: "magic-crystal-ball-mini-kit",
    asin: "076246514X",
    title: "Magic Crystal Ball: See the Future! (RP Minis)",
    creator: "Running Press",
    department: "crystals-symbolism",
    format: "Boxed Kit",
    experienceLevel: "beginner",
    giftPersonas: ["crystal-collector", "symbolism-explorer"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "A 3-inch glass sphere on a compact display base accompanied by a 48-page illustrated mini book on scrying lore.",
    whyItFits: "A playful desktop nod to Madame Fortuna's Crystal Ball and scrying traditions.",
    groundedNote: "Novelty desktop keepsake and historical curiosity for entertainment.",
    artworkGlyph: "🔮",
    schemaType: "Product",
  },
  {
    slug: "mini-crystal-pendulum-kit",
    asin: "0762481838",
    title: "Mini Crystal Pendulum Kit (RP Minis)",
    creator: "Mikaila Adriance (Running Press)",
    department: "crystals-symbolism",
    format: "Boxed Kit",
    experienceLevel: "beginner",
    giftPersonas: ["crystal-collector", "symbolism-explorer"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "A faceted jadeite pendulum on a gold-toned chain paired with a 32-page illustrated booklet.",
    whyItFits: "Connects directly to Oracle Mirror's Mirror Lab Pendulum and Pendulum Guide.",
    groundedNote: "Explore pendulum motion as a reflection on expectation and the ideomotor effect, not objective truth.",
    artworkGlyph: "⌁",
    schemaType: "Product",
  },
  {
    slug: "man-and-his-symbols",
    asin: "0440351839",
    title: "Man and His Symbols",
    creator: "Carl G. Jung et al.",
    department: "crystals-symbolism",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["symbolism-explorer", "dream-keeper"],
    realms: ["madame-fortuna-crystal-ball", "morpheus-vey-dream-library"],
    summary: "Carl Jung's accessible illustrated exploration of archetypes, myth, and symbolic imagery across cultures.",
    whyItFits: "Provides the intellectual backbone for how Oracle Mirror frames symbols as mirrors of the psyche.",
    groundedNote: "Classic work of analytical psychology and cultural history.",
    artworkGlyph: "☉",
    schemaType: "Book",
  },
  {
    slug: "the-tarot-journal-peter-pauper",
    asin: "1441334572",
    title: "The Tarot Journal",
    creator: "Peter Pauper Press",
    department: "crystals-symbolism",
    format: "Journal",
    experienceLevel: "beginner",
    giftPersonas: ["tarot-beginner", "symbolism-explorer"],
    realms: ["seraphina-tarot-library", "pythius-numerology-chamber"],
    summary: "A structured hardcover notebook with guided pages for recording card draws, dates, and personal reflections.",
    whyItFits: "Brings Oracle Mirror's local Archive habit onto tactile, acid-free paper.",
    groundedNote: "Physical keepsake journal for private personal reflection.",
    artworkGlyph: "📓",
    schemaType: "Book",
  },

  // 3. Astrology & Zodiac (7 items)
  {
    slug: "only-astrology-book-youll-ever-need",
    asin: "1589796535",
    title: "The Only Astrology Book You'll Ever Need",
    creator: "Joanna Martine Woolfolk",
    department: "astrology-zodiac",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "A long-standing reference covering sun signs, moon signs, rising signs, and planetary placements.",
    whyItFits: "Complements Oracle Mirror's Western Zodiac and Birth Chart guides with clear reference tables.",
    groundedNote: "Cultural and symbolic astrology guide distinct from astronomical science.",
    artworkGlyph: "♈",
    schemaType: "Book",
  },
  {
    slug: "you-were-born-for-this",
    asin: "0063043777",
    title: "You Were Born for This: Astrology for Radical Self-Acceptance",
    creator: "Chani Nicholas",
    department: "astrology-zodiac",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "A reflective guide to reading your Sun, Moon, and Ascendant through journal prompts and self-compassion.",
    whyItFits: "Mirrors Oracle Mirror's reflective, non-fatalistic approach to natal chart symbolism.",
    groundedNote: "Designed for personal reflection rather than deterministic prediction.",
    artworkGlyph: "☉",
    schemaType: "Book",
  },
  {
    slug: "astrology-for-the-soul",
    asin: "0553378384",
    title: "Astrology for the Soul",
    creator: "Jan Spiller",
    department: "astrology-zodiac",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "An in-depth study of the Moon's North and South Nodes in natal chart interpretation.",
    whyItFits: "Great next step for readers who have already explored sun, moon, and rising signs.",
    groundedNote: "Symbolic character study in modern Western astrology.",
    artworkGlyph: "☊",
    schemaType: "Book",
  },
  {
    slug: "the-inner-sky",
    asin: "0979067715",
    title: "The Inner Sky",
    creator: "Steven Forrest",
    department: "astrology-zodiac",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "A classic, literate introduction to evolutionary astrology, emphasizing choice and agency over fate.",
    whyItFits: "Aligns closely with Oracle Mirror's philosophy that symbols invite reflection rather than fatalism.",
    groundedNote: "Humanistic astrological essay collection.",
    artworkGlyph: "✦",
    schemaType: "Book",
  },
  {
    slug: "secret-language-of-birthdays",
    asin: "0525426884",
    title: "The Secret Language of Birthdays",
    creator: "Gary Goldschneider & Joost Elffers",
    department: "astrology-zodiac",
    format: "Paperback",
    experienceLevel: "collector",
    giftPersonas: ["celestial-reader", "symbolism-explorer"],
    realms: ["astaria-celestial-observatory", "pythius-numerology-chamber"],
    summary: "An encyclopedic coffee-table compendium pairing every calendar day with cusp-astrology and numerological lore.",
    whyItFits: "A beloved gift book for birthday gatherings and cross-system curiosity.",
    groundedNote: "Entertainment and cultural personality compendium.",
    artworkGlyph: "📅",
    schemaType: "Book",
  },
  {
    slug: "astrology-of-you-and-me",
    asin: "1683690427",
    title: "The Astrology of You and Me",
    creator: "Gary Goldschneider",
    department: "astrology-zodiac",
    format: "Hardcover",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "A playful, illustrated hardcover exploring how the twelve zodiac archetypes interact in friendships and partnerships.",
    whyItFits: "Complements Oracle Mirror's Love Match and Zodiac compatibility pages.",
    groundedNote: "Lighthearted interpersonal reflection guide.",
    artworkGlyph: "♡",
    schemaType: "Book",
  },
  {
    slug: "the-stars-ha-rey",
    asin: "0395248302",
    title: "The Stars: A New Way to See Them",
    creator: "H.A. Rey",
    department: "astrology-zodiac",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "The beloved astronomy classic featuring intuitive constellation diagrams for recognizing real star patterns.",
    whyItFits: "Helps visitors step outside and identify the actual astronomical constellations behind zodiacal lore.",
    groundedNote: "Real-world observational astronomy guide.",
    artworkGlyph: "★",
    schemaType: "Book",
  },

  // 4. Dream Journaling (6 items)
  {
    slug: "bedside-dream-journal",
    asin: "0811870359",
    title: "Bedside Dream Journal: A Nighttime Memory Book",
    creator: "Chronicle Books",
    department: "dream-journaling",
    format: "Journal",
    experienceLevel: "beginner",
    giftPersonas: ["dream-keeper"],
    realms: ["morpheus-vey-dream-library"],
    summary: "A compact, thoughtfully laid-out bedside notebook with prompts for recording dreams upon waking.",
    whyItFits: "The ideal physical companion to Morpheus Vey's Dream Library and Oracle Mirror's Dream Interpreter.",
    groundedNote: "Stationery for personal dream recall and creative reflection.",
    artworkGlyph: "☾",
    schemaType: "Book",
  },
  {
    slug: "strange-dreams-journal",
    asin: "1452126445",
    title: "Strange Dreams: A Journal",
    creator: "Chronicle Books",
    department: "dream-journaling",
    format: "Journal",
    experienceLevel: "beginner",
    giftPersonas: ["dream-keeper"],
    realms: ["morpheus-vey-dream-library"],
    summary: "An illustrated dream notebook designed for capturing surreal imagery, recurring motifs, and waking associations.",
    whyItFits: "Encourages noticing personal patterns rather than relying on one-size-fits-all dream dictionaries.",
    groundedNote: "Creative bedside notebook.",
    artworkGlyph: "☁",
    schemaType: "Book",
  },
  {
    slug: "conscious-dreaming-robert-moss",
    asin: "051788710X",
    title: "Conscious Dreaming",
    creator: "Robert Moss",
    department: "dream-journaling",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["dream-keeper"],
    realms: ["morpheus-vey-dream-library"],
    summary: "A practical guide to dream recall, journaling techniques, and exploring dream imagery through creative dialogue.",
    whyItFits: "Offers concrete habits for remembering and working with dreams over time.",
    groundedNote: "Reflective dreamwork practices for personal insight.",
    artworkGlyph: "🗝",
    schemaType: "Book",
  },
  {
    slug: "dreams-carl-jung",
    asin: "0691017921",
    title: "Dreams (Bollingen Series)",
    creator: "Carl G. Jung",
    department: "dream-journaling",
    format: "Paperback",
    experienceLevel: "collector",
    giftPersonas: ["dream-keeper", "symbolism-explorer"],
    realms: ["morpheus-vey-dream-library"],
    summary: "Selected essays from Jung's Collected Works examining dream symbolism, compensation, and active imagination.",
    whyItFits: "Primary psychological source material for readers who want depth beyond popular dream dictionaries.",
    groundedNote: "Scholarly analytical psychology text.",
    artworkGlyph: "📜",
    schemaType: "Book",
  },
  {
    slug: "memories-dreams-reflections",
    asin: "0679723951",
    title: "Memories, Dreams, Reflections",
    creator: "Carl G. Jung",
    department: "dream-journaling",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["dream-keeper", "symbolism-explorer"],
    realms: ["morpheus-vey-dream-library"],
    summary: "Jung's classic memoir chronicling his inner life, dream motifs, and the development of depth psychology.",
    whyItFits: "A timeless companion for anyone keeping a long-term reflection journal.",
    groundedNote: "Autobiographical and psychological classic.",
    artworkGlyph: "✧",
    schemaType: "Book",
  },
  {
    slug: "the-artists-way",
    asin: "1585421472",
    title: "The Artist's Way",
    creator: "Julia Cameron",
    department: "dream-journaling",
    format: "Hardcover",
    experienceLevel: "beginner",
    giftPersonas: ["dream-keeper"],
    realms: ["morpheus-vey-dream-library", "pythius-numerology-chamber"],
    summary: "The foundational guide to daily Morning Pages—three pages of unedited longhand reflection upon waking.",
    whyItFits: "Pairs seamlessly with dream journaling to turn morning imagery into creative momentum.",
    groundedNote: "Practical creative-writing and reflection discipline.",
    artworkGlyph: "✒",
    schemaType: "Book",
  },

  // 5. Ritual & Atmosphere (6 items)
  {
    slug: "himalayan-bazaar-singing-bowl-4in",
    asin: "B09N21ZD7B",
    title: "Himalayan Bazaar Tibetan Singing Bowl Set (4-Inch)",
    creator: "Himalayan Bazaar",
    department: "ritual-atmosphere",
    format: "Physical Instrument",
    experienceLevel: "beginner",
    giftPersonas: ["crystal-collector", "symbolism-explorer"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "A hand-hammered 4-inch brass singing bowl with wooden striker and cushion for quiet acoustic transitions.",
    whyItFits: "A tactile cue to begin or close a calm evening tarot or meditation session.",
    groundedNote: "Acoustic craft instrument for ambiance and focus, not medical sound therapy.",
    artworkGlyph: "🔔",
    schemaType: "Product",
  },
  {
    slug: "silent-mind-tibetan-singing-bowl",
    asin: "B00XEV4WYM",
    title: "Silent Mind Tibetan Singing Bowl Set",
    creator: "Silent Mind",
    department: "ritual-atmosphere",
    format: "Physical Instrument",
    experienceLevel: "beginner",
    giftPersonas: ["crystal-collector"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "Handcrafted Tibetan singing bowl set with wooden striker and cushion for quiet desk and study ambiance.",
    whyItFits: "Ideal for apartments or compact reflection corners where a gentle acoustic chime marks the start of quiet reading.",
    groundedNote: "Decorative and acoustic table piece for quiet ambiance; not a medical device.",
    artworkGlyph: "◎",
    schemaType: "Product",
  },
  {
    slug: "moon-spells-diane-ahlquist",
    asin: "1580626955",
    title: "Moon Spells: How to Use the Phases of the Moon",
    creator: "Diane Ahlquist",
    department: "ritual-atmosphere",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader", "symbolism-explorer"],
    realms: ["astaria-celestial-observatory"],
    summary: "A seasonal guide to aligning monthly goal-setting, journaling, and quiet rituals with the lunar cycle.",
    whyItFits: "Offers structured monthly reflection rhythms synchronized with New and Full Moons.",
    groundedNote: "Presented as symbolic personal ritual and reflection.",
    artworkGlyph: "🌒",
    schemaType: "Book",
  },
  {
    slug: "the-house-witch",
    asin: "1507209460",
    title: "The House Witch",
    creator: "Arin Murphy-Hiscock",
    department: "ritual-atmosphere",
    format: "Hardcover",
    experienceLevel: "beginner",
    giftPersonas: ["symbolism-explorer"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "A cozy hardcover guide to creating a calm, intentional home atmosphere through simple seasonal habits.",
    whyItFits: "Inspirational reading for designing a warm, uncluttered reflection corner at home.",
    groundedNote: "Lifestyle and folk-tradition craft book; not supernatural protection.",
    artworkGlyph: "🕯",
    schemaType: "Book",
  },
  {
    slug: "the-green-witch",
    asin: "1507204719",
    title: "The Green Witch",
    creator: "Arin Murphy-Hiscock",
    department: "ritual-atmosphere",
    format: "Hardcover",
    experienceLevel: "beginner",
    giftPersonas: ["symbolism-explorer"],
    realms: ["madame-fortuna-crystal-ball"],
    summary: "A botanical guide to herbal teas, seasonal observance, and nature-centered mindfulness.",
    whyItFits: "Pairs naturally with Oracle Mirror's Tea Leaf library and quiet evening reflection.",
    groundedNote: "Botanical folklore and mindfulness; not herbal medical advice.",
    artworkGlyph: "🌿",
    schemaType: "Book",
  },

  // 6. I Ching & Runes (9 items)
  {
    slug: "i-ching-wilhelm-baynes",
    asin: "069109750X",
    title: "The I Ching, or, Book of Changes (Bollingen Series XIX)",
    creator: "Richard Wilhelm & Cary F. Baynes (Foreword by C.G. Jung)",
    department: "iching-runes",
    format: "Hardcover",
    experienceLevel: "collector",
    giftPersonas: ["rune-enthusiast", "symbolism-explorer"],
    realms: ["master-longwei-jade-pavilion"],
    summary: "The landmark Princeton University Press hardcover translation with commentary and Jung's famous foreword.",
    whyItFits: "The gold-standard library edition for studying the 64 King Wen hexagrams featured in Oracle Mirror.",
    groundedNote: "Classical Chinese philosophical and divinatory text.",
    artworkGlyph: "䷀",
    schemaType: "Book",
  },
  {
    slug: "i-ching-brian-browne-walker",
    asin: "0312098286",
    title: "The I Ching, or Book of Changes: A Guide to Life's Turning Points",
    creator: "Brian Browne Walker",
    department: "iching-runes",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["rune-enthusiast"],
    realms: ["master-longwei-jade-pavilion"],
    summary: "A clear, poetic, accessible rendering of all 64 hexagrams designed for everyday contemplation.",
    whyItFits: "Ideal entry point before tackling denser scholarly commentaries.",
    groundedNote: "Modern interpretive adaptation of the classical Yijing.",
    artworkGlyph: "☰",
    schemaType: "Book",
  },
  {
    slug: "total-i-ching-stephen-karcher",
    asin: "0316724319",
    title: "Total I Ching: Myths for Change",
    creator: "Stephen Karcher",
    department: "iching-runes",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["rune-enthusiast", "symbolism-explorer"],
    realms: ["master-longwei-jade-pavilion"],
    summary: "Explores the early Zhou Dynasty imagery, myths, and changing lines behind each of the 64 hexagrams.",
    whyItFits: "Deepens appreciation for changing-line dynamics in Oracle Mirror's three-coin I Ching cast.",
    groundedNote: "Historical and mythological commentary on the Book of Changes.",
    artworkGlyph: "☷",
    schemaType: "Book",
  },
  {
    slug: "i-ching-hilary-barrett",
    asin: "1848374534",
    title: "I Ching: Walking Your Path, Creating Your Future",
    creator: "Hilary Barrett",
    department: "iching-runes",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["rune-enthusiast"],
    realms: ["master-longwei-jade-pavilion"],
    summary: "A lucid, practical guide to casting with coins or yarrow stalks and reading hexagram pairs thoughtfully.",
    whyItFits: "Directly reinforces Oracle Mirror's three-coin casting method and trigram matrix.",
    groundedNote: "Reflective consultation manual.",
    artworkGlyph: "☯",
    schemaType: "Book",
  },
  {
    slug: "runes-interpret-magic-kit",
    asin: "1398803839",
    title: "Runes: Interpret the Magic of the Symbols (Boxed Kit)",
    creator: "Andrew McKay",
    department: "iching-runes",
    format: "Boxed Kit",
    experienceLevel: "beginner",
    giftPersonas: ["rune-enthusiast"],
    realms: ["elder-futhark-rune-chamber"],
    summary: "A lidded gift box containing an illustrated guidebook, velvet pouch, and a complete set of physical rune stones.",
    whyItFits: "Everything needed to practice three-rune Elder Futhark draws away from a screen.",
    groundedNote: "Includes modern symbolic meanings; Oracle Mirror keeps historical context distinct.",
    artworkGlyph: "ᚠ",
    schemaType: "Product",
  },
  {
    slug: "the-runes-box-lona-eversden",
    asin: "1577152360",
    title: "The Runes Box: Tools to Connect You to the Magic of the Universe",
    creator: "Lona Eversden",
    department: "iching-runes",
    format: "Boxed Kit",
    experienceLevel: "beginner",
    giftPersonas: ["rune-enthusiast"],
    realms: ["elder-futhark-rune-chamber"],
    summary: "A boxed card-and-guidebook set introducing the 24 Elder Futhark runes and simple spread layouts.",
    whyItFits: "A clean tabletop companion to Oracle Mirror's 24-rune reference library.",
    groundedNote: "Modern mindful rune reflection set.",
    artworkGlyph: "ᛟ",
    schemaType: "Product",
  },
  {
    slug: "futhark-handbook-edred-thorsson",
    asin: "0877285489",
    title: "Futhark: A Handbook of Rune Magic",
    creator: "Edred Thorsson",
    department: "iching-runes",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["rune-enthusiast", "symbolism-explorer"],
    realms: ["elder-futhark-rune-chamber"],
    summary: "A structured study of the 24 Elder Futhark staves, their phonetic values, Old Norse poem traditions, and lore.",
    whyItFits: "Helps readers distinguish historical runology from contemporary symbolic interpretations.",
    groundedNote: "Historical and esoteric study of the Elder Futhark alphabet.",
    artworkGlyph: "ᚱ",
    schemaType: "Book",
  },
  {
    slug: "the-book-of-runes-ralph-blum",
    asin: "0312536763",
    title: "The Book of Runes (25th Anniversary Edition)",
    creator: "Ralph H. Blum",
    department: "iching-runes",
    format: "Boxed Kit",
    experienceLevel: "beginner",
    giftPersonas: ["rune-enthusiast"],
    realms: ["elder-futhark-rune-chamber"],
    summary: "The 1982 modern classic that popularized contemporary rune casting, packaged with stones and pouch.",
    whyItFits: "Important cultural milestone in modern rune divination, complemented by Oracle Mirror's historical notes.",
    groundedNote: "Modern Western rune-casting tradition (includes the modern blank stone).",
    artworkGlyph: "ᛏ",
    schemaType: "Product",
  },
  {
    slug: "runic-tarot-kit",
    asin: "0738770736",
    title: "Runic Tarot Kit",
    creator: "Jack Sephiroth, Zhang Chao & Jaymi Elford",
    department: "iching-runes",
    format: "Boxed Kit",
    experienceLevel: "collector",
    giftPersonas: ["rune-enthusiast", "symbolism-explorer"],
    realms: ["elder-futhark-rune-chamber", "seraphina-tarot-library"],
    summary: "A 78-card Norse-inspired tarot deck and companion guidebook weaving Elder Futhark motifs into tarot.",
    whyItFits: "A natural bridge for visitors who enjoy both Seraphina's Tarot Library and the Rune Chamber.",
    groundedNote: "Artistic synthesis of Norse myth and tarot structure.",
    artworkGlyph: "ᛉ",
    schemaType: "Product",
  },

  // 7. Meditation & Reflection (6 items)
  {
    slug: "retrospec-sedona-zafu-round",
    asin: "B092DWCLYJ",
    title: "Retrospec Sedona Zafu Meditation Cushion (Round)",
    creator: "Retrospec",
    department: "meditation-reflection",
    format: "Physical Instrument",
    experienceLevel: "beginner",
    giftPersonas: ["dream-keeper", "crystal-collector"],
    realms: ["pythius-numerology-chamber"],
    summary: "A buckwheat-hull filled round zafu floor cushion with a washable cover for comfortable seated posture.",
    whyItFits: "Makes 10 minutes of quiet breathing or morning reflection physically effortless.",
    groundedNote: "Ergonomic floor seating cushion for comfort and posture.",
    artworkGlyph: "◎",
    schemaType: "Product",
  },
  {
    slug: "retrospec-sedona-zafu-crescent",
    asin: "B092DSTPCN",
    title: "Retrospec Sedona Zafu Meditation Cushion (Crescent)",
    creator: "Retrospec",
    department: "meditation-reflection",
    format: "Physical Instrument",
    experienceLevel: "intermediate",
    giftPersonas: ["dream-keeper"],
    realms: ["pythius-numerology-chamber"],
    summary: "A crescent-shaped buckwheat meditation cushion offering extra heel clearance for cross-legged sitting.",
    whyItFits: "Ideal for longer seated reflection or quiet breathing sessions.",
    groundedNote: "Ergonomic floor cushion; natural buckwheat fill.",
    artworkGlyph: "☾",
    schemaType: "Product",
  },
  {
    slug: "hugger-mugger-zafu-cushion",
    asin: "B074XT18SV",
    title: "Hugger Mugger Zafu Meditation Cushion",
    creator: "Hugger Mugger",
    department: "meditation-reflection",
    format: "Physical Instrument",
    experienceLevel: "collector",
    giftPersonas: ["symbolism-explorer"],
    realms: ["pythius-numerology-chamber"],
    summary: "A studio-grade organic buckwheat zafu crafted in durable upholstery-weight cotton.",
    whyItFits: "Built to last for years in a dedicated study or reflection corner.",
    groundedNote: "Durable ergonomic meditation cushion.",
    artworkGlyph: "◉",
    schemaType: "Product",
  },
  {
    slug: "wherever-you-go-there-you-are",
    asin: "1401307787",
    title: "Wherever You Go, There You Are",
    creator: "Jon Kabat-Zinn",
    department: "meditation-reflection",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["dream-keeper", "symbolism-explorer"],
    realms: ["pythius-numerology-chamber"],
    summary: "Short, readable chapters on bringing calm, non-judgmental attention into ordinary daily moments.",
    whyItFits: "Pairs grounded mindfulness with Oracle Mirror's Daily Ritual habit.",
    groundedNote: "Secular, evidence-informed mindfulness classic.",
    artworkGlyph: "🍃",
    schemaType: "Book",
  },
  {
    slug: "mindfulness-in-plain-english",
    asin: "0861719069",
    title: "Mindfulness in Plain English",
    creator: "Bhante Henepola Gunaratana",
    department: "meditation-reflection",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["symbolism-explorer"],
    realms: ["pythius-numerology-chamber"],
    summary: "A lucid, practical manual explaining vipassana breath meditation without mystification.",
    whyItFits: "One of the clearest step-by-step meditation books ever written.",
    groundedNote: "Practical contemplative instruction.",
    artworkGlyph: "🪷",
    schemaType: "Book",
  },
  {
    slug: "how-to-sit-thich-nhat-hanh",
    asin: "1937006581",
    title: "How to Sit",
    creator: "Thich Nhat Hanh",
    department: "meditation-reflection",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["dream-keeper", "celestial-reader"],
    realms: ["pythius-numerology-chamber"],
    summary: "A pocket-sized hardcover of gentle, poetic reflections on posture, breath, and stillness.",
    whyItFits: "A thoughtful gift for anyone building a five-minute daily pause.",
    groundedNote: "Mindfulness pocket guide.",
    artworkGlyph: "🕊",
    schemaType: "Book",
  },

  // 8. Celestial Gifts & Numerology (7 items)
  {
    slug: "constellations-journal-peter-pauper",
    asin: "1441310061",
    title: "Constellations Journal",
    creator: "Peter Pauper Press",
    department: "celestial-gifts",
    format: "Journal",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader", "dream-keeper"],
    realms: ["astaria-celestial-observatory", "morpheus-vey-dream-library"],
    summary: "A matte midnight-blue hardcover journal embossed with silver-foil constellations, 160 lined pages, and ribbon marker.",
    whyItFits: "Echoes Oracle Mirror's midnight-and-starlight palette in an everyday keepsake.",
    groundedNote: "Archival-quality gift stationery.",
    artworkGlyph: "✧",
    schemaType: "Book",
  },
  {
    slug: "celestial-journal-blue-gold",
    asin: "1441316698",
    title: "Celestial Journal (Blue & Gold Embossed)",
    creator: "Peter Pauper Press",
    department: "celestial-gifts",
    format: "Journal",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader", "tarot-beginner"],
    realms: ["astaria-celestial-observatory", "seraphina-tarot-library"],
    summary: "A bookbound celestial notebook finished in deep indigo and antique gold foil stamping.",
    whyItFits: "Feels like a physical artifact straight from The Oracle Mirror Emporium.",
    groundedNote: "Gift-ready hardcover journal.",
    artworkGlyph: "☀",
    schemaType: "Book",
  },
  {
    slug: "autumn-moon-oversize-journal",
    asin: "1441329420",
    title: "Autumn Moon Oversize Journal",
    creator: "Peter Pauper Press",
    department: "celestial-gifts",
    format: "Journal",
    experienceLevel: "collector",
    giftPersonas: ["dream-keeper", "celestial-reader"],
    realms: ["morpheus-vey-dream-library"],
    summary: "An oversize embossed hardcover journal featuring a luminous autumn moon over a quiet landscape.",
    whyItFits: "Generous page size makes it ideal for spread diagrams or detailed dream sketches.",
    groundedNote: "Oversize keepsake notebook.",
    artworkGlyph: "🌕",
    schemaType: "Book",
  },
  {
    slug: "night-sky-fifty-postcards",
    asin: "1616897341",
    title: "The Night Sky: Fifty Postcards",
    creator: "Princeton Architectural Press",
    department: "celestial-gifts",
    format: "Postcard Set",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader", "symbolism-explorer"],
    realms: ["astaria-celestial-observatory"],
    summary: "A gold-foil keepsake box of 50 postcards featuring antique star maps, Galileo's sketches, and NASA imagery.",
    whyItFits: "Doubles as correspondence stationery or framed mini-prints for a celestial study.",
    groundedNote: "Historical astronomical art and photography set.",
    artworkGlyph: "✉",
    schemaType: "Product",
  },
  {
    slug: "audubon-field-guide-night-sky",
    asin: "0679408525",
    title: "National Audubon Society Field Guide to the Night Sky",
    creator: "Mark R. Chartrand & Wil Tirion",
    department: "celestial-gifts",
    format: "Hardcover",
    experienceLevel: "intermediate",
    giftPersonas: ["celestial-reader"],
    realms: ["astaria-celestial-observatory"],
    summary: "A durable vinyl-bound field guide packed with 700+ photographs, monthly star charts, and constellation maps.",
    whyItFits: "An extraordinary gift for anyone who wants to know the real sky behind celestial symbolism.",
    groundedNote: "Authoritative observational astronomy field guide.",
    artworkGlyph: "🔭",
    schemaType: "Book",
  },
  {
    slug: "cosmos-carl-sagan",
    asin: "0345539435",
    title: "Cosmos",
    creator: "Carl Sagan",
    department: "celestial-gifts",
    format: "Paperback",
    experienceLevel: "beginner",
    giftPersonas: ["celestial-reader", "symbolism-explorer"],
    realms: ["astaria-celestial-observatory"],
    summary: "Carl Sagan's classic illustrated meditation on astronomy, history, and humanity's place among the stars.",
    whyItFits: "Grounds celestial wonder in scientific curiosity and poetic clarity.",
    groundedNote: "Classic science and astronomy literature.",
    artworkGlyph: "🌌",
    schemaType: "Book",
  },
  {
    slug: "complete-book-of-numerology",
    asin: "140190727X",
    title: "The Complete Book of Numerology",
    creator: "David A. Phillips",
    department: "celestial-gifts",
    format: "Paperback",
    experienceLevel: "intermediate",
    giftPersonas: ["symbolism-explorer"],
    realms: ["pythius-numerology-chamber"],
    summary: "A structured guide to Pythagorean letter-to-number charts, Life Path reductions, and number symbolism.",
    whyItFits: "Pairs directly with Pythius and Oracle Mirror's Pythagorean Advanced Numerology calculator.",
    groundedNote: "Symbolic Pythagorean numerology reference; not predictive mathematics.",
    artworkGlyph: "🔢",
    schemaType: "Book",
  },
];

export const SHOP_PRODUCTS: readonly ShopProduct[] = [
  ...BASE_SHOP_PRODUCTS,
  ...EXPANDED_SHOP_PRODUCTS,
];

export const REALM_SHOP_COLLECTIONS: readonly RealmShopCollection[] = [
  {
    slug: "seraphina-tarot-library",
    personaName: "Seraphina",
    realmTitle: "Seraphina's Tarot Library",
    realmPath: "/tarot/advanced",
    glyph: "✦",
    tagline: "Illustrated decks, study manuals & spread notebooks",
    description: "Curated physical companions for Seraphina's Tarot Library and the 78-card reader—from classic Rider-Waite-Smith editions to foundational books by Rachel Pollack and Mary K. Greer.",
    curatorialNote: "Chosen to support card literacy and reflective journaling; never required to use Oracle Mirror's free readings.",
    departments: ["tarot-oracle"],
  },
  {
    slug: "madame-fortuna-crystal-ball",
    personaName: "Madame Fortuna",
    realmTitle: "Madame Fortuna's Crystal Ball",
    realmPath: "/crystal-ball",
    glyph: "🔮",
    tagline: "Crystal directories, scrying curiosities & acoustic bowls",
    description: "Mineral reference guides, pendulum kits, desktop crystal spheres, and hand-hammered singing bowls inspired by Madame Fortuna's parlor and the Divination Library.",
    curatorialNote: "Presented for symbolic appreciation, tabletop atmosphere, and historical curiosity—never as medical or protective claims.",
    departments: ["crystals-symbolism", "ritual-atmosphere"],
  },
  {
    slug: "astaria-celestial-observatory",
    personaName: "Astaria",
    realmTitle: "Astaria's Celestial Observatory",
    realmPath: "/astrology",
    glyph: "☉",
    tagline: "Natal chart guides, star atlases & foil-stamped stationery",
    description: "Astrological character manuals paired with real-sky field guides like H.A. Rey's The Stars and the Audubon Night Sky guide.",
    curatorialNote: "Clearly separates astronomical observation from astrological symbolism.",
    departments: ["astrology-zodiac", "celestial-gifts"],
  },
  {
    slug: "master-longwei-jade-pavilion",
    personaName: "Master Longwei",
    realmTitle: "Master Longwei's Jade Pavilion",
    realmPath: "/iching/advanced",
    glyph: "☰",
    tagline: "Classical I Ching translations & Book of Changes commentaries",
    description: "Respected English editions of the Yijing—including the Wilhelm/Baynes Bollingen hardcover and modern commentaries by Hilary Barrett, Stephen Karcher, and Brian Browne Walker.",
    curatorialNote: "Selected for textual integrity and historical respect.",
    departments: ["iching-runes"],
  },
  {
    slug: "morpheus-vey-dream-library",
    personaName: "Morpheus Vey",
    realmTitle: "Morpheus Vey's Dream Library",
    realmPath: "/dreams",
    glyph: "☾",
    tagline: "Bedside dream journals & depth-psychology classics",
    description: "Tactile bedside notebooks for morning recall alongside classic writings by Carl Jung, Robert Moss, and Julia Cameron.",
    curatorialNote: "Your private Oracle Mirror dream entries stay in your browser and are never used to target recommendations.",
    departments: ["dream-journaling"],
  },
  {
    slug: "pythius-numerology-chamber",
    personaName: "Pythius",
    realmTitle: "Pythius & the Numerology Chamber",
    realmPath: "/numerology/advanced",
    glyph: "🔢",
    tagline: "Pythagorean number guides, zafu cushions & quiet study",
    description: "Numerology handbooks, tarot-birth-card workbooks, and supportive zafu meditation cushions for unhurried contemplation.",
    curatorialNote: "No birth dates or names entered in the Numerology Chamber are ever stored or used for shopping.",
    departments: ["meditation-reflection", "celestial-gifts"],
  },
  {
    slug: "elder-futhark-rune-chamber",
    personaName: "The Rune Chamber",
    realmTitle: "The Elder Futhark Rune Chamber",
    realmPath: "/runes",
    glyph: "ᚠ",
    tagline: "Physical rune sets & historically informed handbooks",
    description: "Boxed rune-stone kits and reference manuals covering the 24 Elder Futhark staves and their historical context.",
    curatorialNote: "Distinguishes ancient epigraphic history from modern divinatory practice.",
    departments: ["iching-runes"],
  },
];

export const GIFT_PERSONAS: readonly GiftPersonaProfile[] = [
  {
    slug: "tarot-beginner",
    title: "Tarot Beginner",
    description: "Clear, approachable decks and plain-spoken guides for learning the 78 cards without overwhelm.",
    glyph: "✦",
  },
  {
    slug: "celestial-reader",
    title: "Celestial Reader",
    description: "Star atlases, natal-chart books, and foil-stamped constellation stationery for sky lovers.",
    glyph: "☉",
  },
  {
    slug: "dream-keeper",
    title: "Dream Journal Keeper",
    description: "Bedside notebooks, Morning Pages companions, and depth-psychology classics.",
    glyph: "☾",
  },
  {
    slug: "rune-enthusiast",
    title: "Rune Enthusiast",
    description: "Physical Elder Futhark rune sets, Yijing translations, and historically grounded handbooks.",
    glyph: "ᚠ",
  },
  {
    slug: "crystal-collector",
    title: "Crystal Collector",
    description: "Illustrated mineral directories, desktop scrying curiosities, and resonant singing bowls.",
    glyph: "◇",
  },
  {
    slug: "symbolism-explorer",
    title: "Symbolism Explorer",
    description: "Cross-cultural myth, Jungian archetypes, Lenormand decks, and thoughtful philosophical classics.",
    glyph: "✧",
  },
];

export const BUYING_GUIDES: readonly BuyingGuide[] = [
  {
    slug: "how-to-choose-your-first-tarot-deck",
    title: "How to Choose Your First Tarot Deck",
    kicker: "Editorial Buying Guide · Tarot",
    description: "What separates an easy-to-learn 78-card deck from a collector's art deck, and why scenic Minor Arcana cards matter for beginners.",
    readingTime: "5 min read",
    departments: ["tarot-oracle"],
    sections: [
      {
        heading: "Start with scenic Minor Arcana illustrations",
        body: "Historical decks such as Tarot de Marseille use repeating pip symbols on numbered cards (for example, five swords arranged symmetrically). While beautiful, beginners usually learn faster with Rider-Waite-Smith-derived decks where every card—including the Two of Cups or Five of Pentacles—depicts a memorable human scene.",
      },
      {
        heading: "Check card stock, size, and companion guidebook",
        body: "Standard tarot cards measure roughly 2.75 by 4.75 inches. If you have smaller hands, look for borderless or compact editions. A clear companion booklet helps during the first month, and pairing any deck with a dedicated reference like Kitchen Table Tarot or Seventy-Eight Degrees of Wisdom accelerates confidence.",
      },
      {
        heading: "Use spreads as structured reflection, not fate",
        body: "A deck is a visual vocabulary. Whether you draw one card over morning coffee or lay out a three-card Past-Present-Future line, treat the imagery as a mirror for your own priorities rather than a fixed forecast.",
      },
    ],
    groundedBoundary: "Tarot decks are artistic and symbolic tools for reflection; no deck predicts guaranteed future events.",
    recommendedSlugs: ["rider-waite-tarot-deck", "modern-witch-tarot-deck", "kitchen-table-tarot"],
  },
  {
    slug: "tarot-decks-for-learning-major-arcana",
    title: "Tarot Decks for Learning the Major Arcana",
    kicker: "Editorial Buying Guide · Archetypes",
    description: "How classic and contemporary decks illuminate the 22 Major Arcana archetypes from The Fool to The World.",
    readingTime: "4 min read",
    departments: ["tarot-oracle"],
    sections: [
      {
        heading: "Why the 22 trumps anchor every reading",
        body: "Tarot originated in fifteenth-century Italy as a trick-taking card game featuring 21 numbered trumps plus the Fool. In modern reflective reading, those 22 Major Arcana cards represent broad life themes—beginnings, boundaries, solitude, change, and integration.",
      },
      {
        heading: "Comparing traditional symbolism and modern updates",
        body: "The Rider-Waite-Smith deck preserves early twentieth-century esoteric motifs, while The Wild Unknown distills each archetype into stark botanical and animal ink drawings. Studying both side by side reveals which details are essential to the archetype and which are stylistic.",
      },
    ],
    groundedBoundary: "Archetypal study explores metaphor and personal narrative rather than supernatural causation.",
    recommendedSlugs: ["rider-waite-tarot-deck", "wild-unknown-tarot-keepsake", "seventy-eight-degrees-of-wisdom"],
  },
  {
    slug: "beginners-guide-to-i-ching-coins-and-books",
    title: "A Beginner's Guide to I Ching Coins and Books",
    kicker: "Editorial Buying Guide · Yijing",
    description: "Choosing a respectful Book of Changes translation and understanding how three-coin casting works.",
    readingTime: "5 min read",
    departments: ["iching-runes"],
    sections: [
      {
        heading: "Why translation choice matters in the I Ching",
        body: "The Yijing is a three-thousand-year-old Chinese classic. The Wilhelm/Baynes Bollingen edition remains the benchmark literary translation with rich commentary, while Brian Browne Walker and Hilary Barrett offer clear, modern English phrasing that is easier for first-time readers.",
      },
      {
        heading: "Practicing with three coins",
        body: "You do not need rare antique currency to cast a hexagram: any three identical coins work, assigning heads = 3 and tails = 2 to sum 6, 7, 8, or 9 per line from bottom to top. Values 6 and 9 mark changing lines that invite comparing a primary hexagram with its resulting transformation.",
      },
    ],
    groundedBoundary: "The I Ching is approached here as classical philosophical literature and structured contemplation.",
    recommendedSlugs: ["i-ching-wilhelm-baynes", "i-ching-brian-browne-walker", "i-ching-hilary-barrett"],
  },
  {
    slug: "building-a-thoughtful-dream-journaling-habit",
    title: "Building a Thoughtful Dream Journaling Habit",
    kicker: "Editorial Buying Guide · Dreamwork",
    description: "Practical bedside habits, notebook formats, and psychological books that make dream recall effortless.",
    readingTime: "4 min read",
    departments: ["dream-journaling"],
    sections: [
      {
        heading: "Keep paper closer than your phone",
        body: "Dream recall fades within minutes of waking, and checking notifications immediately scatters fragile imagery. A dedicated bedside notebook and a clipped pen let you jot three or four key images—place, emotion, and one striking object—before getting out of bed.",
      },
      {
        heading: "Notice recurring motifs over fixed dictionaries",
        body: "A dog, house, or ocean means something very different depending on your lived memories. Reading Carl Jung's Dreams or Robert Moss's Conscious Dreaming alongside your own notebook helps you spot personal patterns over weeks rather than forcing generic meanings.",
      },
    ],
    groundedBoundary: "Dream journaling supports personal creativity and self-understanding; it is not medical or clinical diagnosis.",
    recommendedSlugs: ["bedside-dream-journal", "conscious-dreaming-robert-moss", "dreams-carl-jung"],
  },
  {
    slug: "choosing-a-physical-rune-set",
    title: "Choosing a Physical Rune Set",
    kicker: "Editorial Buying Guide · Elder Futhark",
    description: "What to check when buying Elder Futhark stones, why the 24-rune alphabet matters, and reliable historical guides.",
    readingTime: "4 min read",
    departments: ["iching-runes"],
    sections: [
      {
        heading: "Check for all 24 Elder Futhark staves",
        body: "The Elder Futhark—used in Germanic inscriptions roughly from the second to eighth centuries CE—contains exactly 24 runes from Fehu to Othala. Many modern sets also include a 25th blank stone popularized in the 1980s; knowing that distinction keeps modern practice honest about history.",
      },
      {
        heading: "Pair tactile stones with solid reference reading",
        body: "Boxed kits with engraved stones and a drawstring pouch are convenient for three-rune draws, while books like Edred Thorsson's Futhark provide phonetic and historical context.",
      },
    ],
    groundedBoundary: "Runes were historically an alphabet; modern three-rune casting is a contemporary reflective practice.",
    recommendedSlugs: ["runes-interpret-magic-kit", "the-runes-box-lona-eversden", "futhark-handbook-edred-thorsson"],
  },
  {
    slug: "understanding-crystals-as-symbols-and-collectibles",
    title: "Understanding Crystals as Symbols and Collectibles",
    kicker: "Editorial Buying Guide · Mineralogy",
    description: "How to appreciate natural minerals as tactile focal points and collectibles without misleading health claims.",
    readingTime: "4 min read",
    departments: ["crystals-symbolism"],
    sections: [
      {
        heading: "Geology first, symbolism second",
        body: "Quartz, amethyst, labradorite, and obsidian owe their color and luster to crystal lattice geometry and trace elements. Learning basic mineral properties makes collecting far more rewarding—and helps spot dyed or synthetic imitations.",
      },
      {
        heading: "Using a stone as a mindfulness anchor",
        body: "Holding a cool, heavy stone during a five-minute pause gives the hands a tactile anchor. Reference directories like The Crystal Bible document traditional associations as cultural folklore rather than medical evidence.",
      },
    ],
    groundedBoundary: "Crystals do not cure illness, replace medical care, or provide measurable energy fields.",
    recommendedSlugs: ["the-crystal-bible", "crystals-for-beginners", "mini-crystal-pendulum-kit"],
  },
  {
    slug: "creating-a-comfortable-reflection-corner",
    title: "Creating a Comfortable Reflection Corner",
    kicker: "Editorial Buying Guide · Sanctuary",
    description: "Simple ergonomic and atmospheric essentials—from zafu cushions to singing bowls—for an uncluttered daily pause.",
    readingTime: "4 min read",
    departments: ["meditation-reflection", "ritual-atmosphere"],
    sections: [
      {
        heading: "Prioritize posture and quiet light",
        body: "A reflection corner does not require an entire room. A buckwheat zafu cushion elevates the hips so the spine rests comfortably, while a small shelf keeps one journal, one deck, and a pen within easy reach.",
      },
      {
        heading: "Mark transitions with sound or breath",
        body: "A single clear chime from a small brass singing bowl—or three slow breaths before opening a notebook—creates a gentle boundary between busy work and unhurried reflection.",
      },
    ],
    groundedBoundary: "Atmosphere and posture support focus and comfort; ritual objects do not provide supernatural protection.",
    recommendedSlugs: ["retrospec-sedona-zafu-round", "himalayan-bazaar-singing-bowl-4in", "wherever-you-go-there-you-are"],
  },
  {
    slug: "astrology-books-for-curious-beginners",
    title: "Astrology Books for Curious Beginners",
    kicker: "Editorial Buying Guide · Celestial Shelf",
    description: "The best introductory natal-chart books alongside real-sky astronomy guides so symbolism and science stay clear.",
    readingTime: "5 min read",
    departments: ["astrology-zodiac", "celestial-gifts"],
    sections: [
      {
        heading: "Learn the Big Three before memorizing aspects",
        body: "Books like Chani Nicholas's You Were Born for This and Steven Forrest's The Inner Sky focus on the Sun, Moon, and Rising signs as reflective archetypes rather than fatalistic labels.",
      },
      {
        heading: "Step outside and learn the real constellations",
        body: "Pairing an astrology manual with H.A. Rey's The Stars or the Audubon Field Guide to the Night Sky connects symbolic zodiac language back to the actual seasonal night sky.",
      },
    ],
    groundedBoundary: "Astrology is cultural symbolism; astronomy is observational science. Both belong on a thoughtful shelf for different reasons.",
    recommendedSlugs: ["you-were-born-for-this", "only-astrology-book-youll-ever-need", "the-stars-ha-rey"],
  },
  {
    slug: "tarot-vs-oracle-cards",
    title: "Tarot vs. Oracle Cards: Structure, Symbolism & Choosing",
    kicker: "Editorial Buying Guide · Card Systems",
    description: "An answer-first comparison of 78-card tarot decks and freeform oracle decks so readers know how each system works.",
    readingTime: "5 min read",
    departments: ["tarot-oracle"],
    answerFirst: "Tarot follows a standardized 78-card structure (22 Major Arcana and 56 Minor Arcana across four suits), whereas oracle decks vary freely in card count, themes, and layout according to each creator's design.",
    historicalContext: "Tarot evolved from 15th-century Italian tarocchi trick-taking games and was adapted for symbolic reading in the 18th–20th centuries. Modern oracle decks emerged largely in the late 20th century as open-ended thematic reflection cards.",
    comparisonTable: {
      headers: ["Dimension", "Tarot Deck", "Oracle Deck"],
      rows: [
        ["Card Count", "Standardized 78 cards", "Varies (commonly 36–64 cards)"],
        ["Structure", "22 Major + 56 Minor Arcana (4 suits)", "Creator-defined themes or keywords"],
        ["Learning Curve", "Steeper initially, transferable across decks", "Immediate per-deck, relies on guidebook"],
        ["Best Use", "Structured multi-card reflection & study", "Daily single-card prompts & affirmations"],
      ],
    },
    sections: [
      {
        heading: "Why tarot skills transfer from deck to deck",
        body: "Because nearly every tarot deck shares the 22 Major Arcana and four Minor Arcana suits (Wands, Cups, Swords, Pentacles), learning one Rider-Waite-Smith-based deck lets you read hundreds of others.",
      },
      {
        heading: "When an oracle deck is the better companion",
        body: "Oracle decks like Moonology or Sacred Traveler center on a single cohesive motif—lunar phases, nature metaphors, or gentle daily prompts—making them approachable for quick morning journaling without memorizing 78 meanings.",
      },
    ],
    faq: [
      {
        question: "Can beginners use oracle cards before tarot?",
        answer: "Yes. Many readers begin with a single-card oracle draw for daily journaling and add a 78-card tarot deck later when they want deeper structural nuance.",
      },
      {
        question: "Do oracle cards replace tarot?",
        answer: "They complement rather than replace each other: tarot offers a structured narrative grammar, while oracle decks offer focused thematic prompts.",
      },
    ],
    groundedBoundary: "Both tarot and oracle cards are creative reflection tools for entertainment and self-inquiry, not predictive instruments.",
    recommendedSlugs: ["rider-waite-tarot-deck", "moonology-oracle-cards", "work-your-light-oracle-cards"],
  },
  {
    slug: "numerology-terminology-and-core-numbers",
    title: "Numerology Terminology: Life Path, Expression & Master Numbers",
    kicker: "Editorial Buying Guide · Pythagorean Numerology",
    description: "Clear definitions of Life Path, Expression, Soul Urge, Personality, Birthday, and Master Numbers in Pythagorean numerology.",
    readingTime: "5 min read",
    departments: ["celestial-gifts", "meditation-reflection"],
    answerFirst: "Pythagorean numerology reduces birth dates and name letters (A=1 through I=9, cycling) to single digits 1–9 or Master Numbers 11, 22, and 33 to frame symbolic personality and life-theme archetypes.",
    historicalContext: "While attributed in tradition to the 6th-century BCE Greek philosopher Pythagoras, modern alphabetical numerology was systematized in the late 19th and early 20th centuries in Western esoteric literature.",
    comparisonTable: {
      headers: ["Core Term", "Input Source", "Symbolic Focus"],
      rows: [
        ["Life Path", "Full birth date (YYYY-MM-DD)", "Broad life lessons and recurring themes"],
        ["Expression (Destiny)", "All letters of full birth name", "Natural talents and modes of action"],
        ["Soul Urge (Heart's Desire)", "Vowels (A, E, I, O, U) of birth name", "Inner motivations and values"],
        ["Master Numbers (11, 22, 33)", "Unreduced double-digit sums", "Intensified versions of 2, 4, and 6"],
      ],
    },
    sections: [
      {
        heading: "Distinguishing arithmetic reduction from empirical prediction",
        body: "Digit reduction (for example, 1994 → 1+9+9+4 = 23 → 2+3 = 5) is deterministic arithmetic applied to names and dates. Its interpretive meanings are cultural and symbolic conventions, not scientific measurements.",
      },
      {
        heading: "Pairing reference books with hands-on calculation",
        body: "Using a structured guide such as David A. Phillips's The Complete Book of Numerology alongside Oracle Mirror's local Pythagorean calculator helps you verify every reduction step transparently.",
      },
    ],
    groundedBoundary: "Numerology is a symbolic and historical study tradition, not a substitute for financial, medical, or career guidance.",
    recommendedSlugs: ["complete-book-of-numerology", "constellations-journal-peter-pauper"],
  },
  {
    slug: "reflective-journaling-for-clarity",
    title: "Reflective Journaling: Turning Daily Prompts into Clarity",
    kicker: "Editorial Buying Guide · Contemplative Writing",
    description: "Practical, evidence-informed journaling structures for pairing tarot draws, morning pages, and evening review.",
    readingTime: "4 min read",
    departments: ["meditation-reflection", "dream-journaling", "celestial-gifts"],
    answerFirst: "Reflective journaling works best when it stays brief and concrete: record the date, one observation or prompt, two honest sentences of personal context, and one small action or question for the day.",
    sections: [
      {
        heading: "Why physical notebooks reduce distraction",
        body: "Writing by hand on dedicated paper—away from notifications and feeds—slows thought down enough to notice patterns across weeks without turning reflection into another screen task.",
      },
      {
        heading: "Three-line structure for tarot or daily reflection",
        body: "Dedicated layouts like The Tarot Journal or unruled celestial notebooks make it easy to log a card draw, note what resonated in your actual week, and revisit entries a month later.",
      },
    ],
    groundedBoundary: "Journaling supports personal organization and self-reflection; it is not clinical therapy or medical treatment.",
    recommendedSlugs: ["the-tarot-journal-peter-pauper", "the-artists-way", "celestial-journal-blue-gold"],
  },
  {
    slug: "thoughtful-gift-ideas-for-tarot-enthusiasts",
    title: "Thoughtful Gift Ideas for Tarot & Symbolism Enthusiasts",
    kicker: "Editorial Buying Guide · Curated Gifting",
    description: "How to choose meaningful decks, reference books, journals, and tactile ritual gifts without guessing someone's private practice.",
    readingTime: "5 min read",
    departments: ["tarot-oracle", "celestial-gifts", "ritual-atmosphere"],
    answerFirst: "The safest, most appreciated gifts for tarot and symbolism readers are classic study books, archival foil-stamped journals, acoustic singing bowls, or an accessible second deck with distinctive illustration.",
    comparisonTable: {
      headers: ["Recipient Profile", "Ideal Gift Category", "Standout Pairing"],
      rows: [
        ["Curious Beginner", "Scenic RWS-based deck + accessible guide", "Modern Witch Tarot + Kitchen Table Tarot"],
        ["Seasoned Reader", "Deep study volume or art-collector deck", "Seventy-Eight Degrees of Wisdom + Shadowscapes"],
        ["Writer & Dreamer", "Foil-stamped hardcover notebook", "Constellations Journal + The Tarot Journal"],
        ["Calm Space Builder", "Zafu cushion or hand-hammered bowl", "Sedona Zafu + 4-inch Singing Bowl"],
      ],
    },
    sections: [
      {
        heading: "Match the gift to their reading habit, not stereotypes",
        body: "Look for durable bindings, clear typography, and respected authors. A well-made hardcover journal or classic reference book feels personal without assuming specific beliefs.",
      },
      {
        heading: "Pair physical editions with free digital exploration",
        body: "Any physical deck or book pairs naturally with Oracle Mirror's free reference libraries—allowing recipients to explore card meanings, dream symbols, or constellations at their own pace.",
      },
    ],
    groundedBoundary: "Gift selections focus on craftsmanship, literary value, and aesthetic appeal rather than supernatural claims.",
    recommendedSlugs: ["rider-waite-tarot-deck", "constellations-journal-peter-pauper", "seventy-eight-degrees-of-wisdom"],
  },
  {
    slug: "understanding-different-rider-waite-deck-editions",
    title: "Understanding Different Rider-Waite Deck Editions",
    kicker: "Editorial Buying Guide · Classic Editions",
    description: "How standard U.S. Games yellow-box, borderless, pocket, and modern recolored Rider-Waite-Smith editions compare in cardstock, sizing, and readability.",
    readingTime: "5 min read",
    departments: ["tarot-oracle"],
    answerFirst: "The classic 1971 U.S. Games yellow-box Rider-Waite Tarot Deck (ASIN 091386613X) remains the benchmark for beginners because its standard 2.75 x 4.75 inch proportions and clear borders match almost every tarot study book.",
    historicalContext: "First published in London in December 1909 by William Rider & Son, the deck paired Arthur Edward Waite's esoteric direction with Pamela Colman Smith's expressive scenic illustrations.",
    sections: [
      {
        heading: "Standard vs. pocket and oversized formats",
        body: "Standard-size decks (roughly 2.75 by 4.75 inches) balance hand-shuffle comfort with visible scenic detail. Pocket editions save table space for travel, while oversized editions highlight fine linework for study.",
      },
      {
        heading: "Why edition verification matters",
        body: "Because Rider-Waite-Smith artwork is widely reprinted, checking the publisher (such as U.S. Games Systems) and exact ASIN ensures consistent cardstock, color reproduction, and booklet quality.",
      },
    ],
    groundedBoundary: "Historical note: the 1909 Rider-Waite-Smith deck is a landmark of illustrated card design. Readings remain personal reflection and entertainment.",
    recommendedSlugs: ["rider-waite-tarot-deck", "morgan-greer-tarot-deck", "modern-witch-tarot-deck"],
  },
  {
    slug: "exploring-the-cultural-history-of-divination",
    title: "Exploring the Cultural History of Divination",
    kicker: "Editorial Buying Guide · History & Folklore",
    description: "Distinguishing the documented historical origins of tarot, the I Ching, Elder Futhark runes, and lunar calendars from modern symbolic reflection.",
    readingTime: "6 min read",
    departments: ["tarot-oracle", "iching-runes", "astrology-zodiac"],
    answerFirst: "Tarot began as a fifteenth-century Italian trick-taking card game, the I Ching evolved over three millennia as a classical Chinese philosophical text, and the Elder Futhark was a Germanic alphabet—knowing their real history enriches modern reflective use.",
    historicalContext: "Across cultures, symbolic systems served varied roles: courtly games in Renaissance Italy, moral and cosmological philosophy in Zhou-dynasty China, and epigraphic writing in Northern Europe.",
    sections: [
      {
        heading: "Separating documented history from later esoteric lore",
        body: "Scholarly translations and museum-backed histories help readers appreciate how traditions actually developed, rather than relying on nineteenth-century myths about ancient origins.",
      },
      {
        heading: "Reading classics alongside modern commentary",
        body: "Pairing a respected primary translation—such as Richard Wilhelm and Cary F. Baynes's I Ching—with an accessible modern workbook gives both historical depth and practical clarity.",
      },
    ],
    groundedBoundary: "Oracle Mirror clearly distinguishes documented history and cultural traditions from scientific evidence, presenting readings as symbolic entertainment.",
    recommendedSlugs: ["i-ching-wilhelm-baynes", "futhark-handbook-edred-thorsson", "seventy-eight-degrees-of-wisdom"],
  },
];

export const BOUNTY_OFFERS: readonly BountyOffer[] = [
  {
    slug: "audible-standard",
    programName: "Audible Standard",
    kicker: "Audio Reading Companion · Bounties",
    summary: "Monthly audiobook listening access for contemplative classics, mythology, and historical surveys when reading hands-free.",
    customerBenefit: "Listen to select audiobooks during walks or quiet evenings; plan terms and included catalog vary by region.",
    eligibilityNote: "Membership eligibility, trial availability, and catalog inclusion are determined by Amazon at signup. Not every book is included in every tier.",
    amazonPath: "/hz/audible/mlp/membership/standard",
    ctaLabel: "Explore Audible Standard on Amazon",
    relevantDepartments: ["tarot-oracle", "astrology-zodiac", "meditation-reflection"],
  },
  {
    slug: "audible-premium-plus",
    programName: "Audible Premium Plus",
    kicker: "Audio Library · Bounties",
    summary: "Includes a monthly audiobook credit to keep a title in your library plus access to the rotating Plus Catalog of audiobooks and podcasts.",
    customerBenefit: "Ideal for long-form works on depth psychology, comparative mythology, and astronomy.",
    eligibilityNote: "Trial offers apply only to eligible accounts as determined by Amazon; subscription pricing and catalog titles are subject to Amazon terms.",
    amazonPath: "/hz/audible/mlp/membership/premiumplus",
    ctaLabel: "Explore Audible Premium Plus on Amazon",
    relevantDepartments: ["dream-journaling", "astrology-zodiac", "crystals-symbolism"],
  },
  {
    slug: "kindle-unlimited",
    programName: "Kindle Unlimited",
    kicker: "Digital Reading Shelf · Bounties",
    summary: "On-demand access to a rotating selection of e-books and digital magazines across Kindle devices and the free Kindle app.",
    customerBenefit: "Browse introductory guides, journaling workbooks, and folklore collections digitally before committing to hardcover editions.",
    eligibilityNote: "Not every book in the Oracle Reading Library is included in Kindle Unlimited; title availability and trial eligibility are set by Amazon.",
    amazonPath: "/kindle-dbs/hz/signup",
    ctaLabel: "Explore Kindle Unlimited on Amazon",
    relevantDepartments: ["tarot-oracle", "dream-journaling", "iching-runes", "celestial-gifts"],
  },
  {
    slug: "amazon-prime",
    programName: "Amazon Prime",
    kicker: "Shipping & Prime Reading · Bounties",
    summary: "Fast delivery on physical tarot decks, hardcover books, and journals, alongside Prime Reading rotating e-book access.",
    customerBenefit: "Convenient shipping on physical study editions and access to rotating Prime Reading selections.",
    eligibilityNote: "Prime trial eligibility, regional benefits, and renewal terms are determined solely by Amazon at checkout or signup.",
    amazonPath: "/amazonprime",
    ctaLabel: "Explore Amazon Prime Benefits",
    relevantDepartments: ["tarot-oracle", "ritual-atmosphere", "celestial-gifts"],
  },
];

export const SOCIAL_CAMPAIGN_TEMPLATES: readonly SocialCampaignTemplate[] = [
  {
    id: "tarot-deck-of-the-week",
    formatName: "Tarot Deck of the Week",
    platforms: ["Instagram", "Pinterest", "Threads"],
    visualConcept: "Flat-lay illustration or original photo of a wooden reading table with linen cloth, brass candle snuffer, and open journal next to our bespoke Tarot Cabinet card.",
    caption: "Tarot Deck of the Week: The Rider-Waite Tarot Deck — the 1909 scenic standard that still teaches beginners fastest. Pair it with our free 78-Card Reader on oraclemirror.com. (Affiliate link in bio — As an Amazon Associate I earn from qualifying purchases.)",
    hashtags: ["#TarotReading", "#TarotDeck", "#OracleMirror", "#TarotStudy", "#MindfulReflection"],
    videoScript: "0-3s: Show a three-card spread on linen. 3-12s: Explain why scenic Minor Arcana cards make learning intuitive. 12-18s: Point viewers to the free Tarot Library & Emporium at oraclemirror.com/shop.",
    landingPath: "/shop/products/rider-waite-tarot-deck",
    featuredProductSlug: "rider-waite-tarot-deck",
  },
  {
    id: "the-celestial-bookshelf",
    formatName: "The Celestial Bookshelf",
    platforms: ["Instagram", "Facebook", "Pinterest"],
    visualConcept: "Vertical shelfie graphic in midnight blue and antique gold highlighting three complementary titles: natal chart symbolism, real-sky astronomy, and a foil-stamped journal.",
    caption: "The Celestial Bookshelf: Pair Chani Nicholas's You Were Born for This with H.A. Rey's The Stars—symbolism for reflection, real astronomy for clear nights. Explore Astaria's shelf at oraclemirror.com/shop/realms/astaria-celestial-observatory. As an Amazon Associate I earn from qualifying purchases.",
    hashtags: ["#CelestialBookshelf", "#AstrologyBooks", "#Stargazing", "#OracleMirrorEmporium"],
    videoScript: "0-4s: Pan across two books—one astrology, one astronomy. 4-14s: Share why keeping symbolism and sky-watching distinct deepens both. 14-20s: Invite followers to Astaria's Observatory.",
    landingPath: "/shop/realms/astaria-celestial-observatory",
    featuredProductSlug: "you-were-born-for-this",
  },
  {
    id: "mystical-gift-guide",
    formatName: "Mystical Gift Guide",
    platforms: ["Pinterest", "Instagram", "Facebook"],
    visualConcept: "Editorial gift-tag grid featuring 6 archetypes: Tarot Beginner, Celestial Reader, Dream Keeper, Rune Enthusiast, Crystal Collector, and Symbolism Explorer.",
    caption: "Looking for a thoughtful gift for a reflective reader? Try our Find Your Mystical Gift matcher at oraclemirror.com/shop/gift-finder—no quizzes collecting personal data, just curated books, decks, and keepsakes. As an Amazon Associate I earn from qualifying purchases.",
    hashtags: ["#MysticalGifts", "#BookishGifts", "#TarotGifts", "#OracleMirror"],
    videoScript: "0-3s: '3 thoughtful gifts for quiet readers.' 3-15s: Show Constellations Journal, Moonology Oracle, and Bedside Dream Journal. 15-20s: Link to /shop/gift-finder.",
    landingPath: "/shop/gift-finder",
    featuredProductSlug: "constellations-journal-peter-pauper",
  },
  {
    id: "inside-the-oracle-emporium",
    formatName: "Inside the Oracle Emporium",
    platforms: ["TikTok", "Instagram", "Threads"],
    visualConcept: "Slow-paced collector's cabinet tour showcasing the 8 departments of The Oracle Mirror Emporium.",
    caption: "Welcome inside The Oracle Mirror Emporium: Tarot, Celestial Treasures & Ritual Essentials—eight curated cabinets built to pair with our free interactive realms. Browse at oraclemirror.com/shop. As an Amazon Associate I earn from qualifying purchases.",
    hashtags: ["#OracleMirrorEmporium", "#OccultBookshop", "#CuratedShelf", "#SlowLiving"],
    videoScript: "0-4s: Title card 'Inside the Oracle Mirror Emporium'. 4-16s: Quick cuts through Tarot, Dream Journaling, I Ching & Runes, and Celestial Gifts. 16-20s: CTA to oraclemirror.com/shop.",
    landingPath: "/shop",
    featuredProductSlug: "shadowscapes-tarot-kit",
  },
  {
    id: "symbolism-explained",
    formatName: "Symbolism Explained",
    platforms: ["Threads", "Instagram", "TikTok"],
    visualConcept: "Split-card editorial graphic contrasting historical origin vs. modern reflective meaning for Elder Futhark runes or I Ching trigrams.",
    caption: "Symbolism Explained: The Elder Futhark was a 24-letter Germanic alphabet centuries before modern three-rune casting. Dive into the history in our Rune Chamber and browse grounded rune handbooks at oraclemirror.com/shop/realms/elder-futhark-rune-chamber. As an Amazon Associate I earn from qualifying purchases.",
    hashtags: ["#SymbolismExplained", "#ElderFuthark", "#IChing", "#MythAndHistory"],
    videoScript: "0-4s: 'What most rune guides leave out.' 4-15s: Contrast historical inscriptions with modern reflective practice. 15-20s: Point to /runes and /shop/guides/choosing-a-physical-rune-set.",
    landingPath: "/shop/guides/choosing-a-physical-rune-set",
    featuredProductSlug: "futhark-handbook-edred-thorsson",
  },
  {
    id: "create-your-reflection-corner",
    formatName: "Create Your Reflection Corner",
    platforms: ["TikTok", "Pinterest", "Instagram"],
    visualConcept: "Minimalist evening corner with a round buckwheat zafu cushion, small brass singing bowl, and warm reading lamp.",
    caption: "You don't need an elaborate altar—just a quiet corner, a supportive cushion, and ten unhurried minutes. Read our guide to Creating a Comfortable Reflection Corner at oraclemirror.com/shop/guides/creating-a-comfortable-reflection-corner. As an Amazon Associate I earn from qualifying purchases.",
    hashtags: ["#ReflectionCorner", "#MindfulSpace", "#MeditationCushion", "#EveningRitual"],
    videoScript: "0-3s: Empty corner transformation. 3-14s: Place zafu cushion, singing bowl, and journal. 14-20s: Share link to the Reflection Corner guide.",
    landingPath: "/shop/guides/creating-a-comfortable-reflection-corner",
    featuredProductSlug: "retrospec-sedona-zafu-round",
  },
  {
    id: "dream-journal-inspiration",
    formatName: "Dream Journal Inspiration",
    platforms: ["Instagram", "Threads", "Pinterest"],
    visualConcept: "Bedside table aesthetic with an open notebook, fountain pen, and crescent moon motif.",
    caption: "Keep paper closer than your phone. Recording three dream images before checking notifications preserves details that vanish in minutes. Explore Morpheus Vey's Dream Library & Emporium shelf at oraclemirror.com/shop/realms/morpheus-vey-dream-library. As an Amazon Associate I earn from qualifying purchases.",
    hashtags: ["#DreamJournal", "#Dreamwork", "#CarlJung", "#MorningPages", "#OracleMirror"],
    videoScript: "0-4s: 'Why you forget dreams in 90 seconds.' 4-14s: Show bedside notebook habit + 3-bullet recall method. 14-20s: Link to /shop/guides/building-a-thoughtful-dream-journaling-habit.",
    landingPath: "/shop/guides/building-a-thoughtful-dream-journaling-habit",
    featuredProductSlug: "bedside-dream-journal",
  },
];

export function departmentBySlug(slug: string): ShopDepartment | undefined {
  return SHOP_DEPARTMENTS.find((d) => d.slug === slug);
}

export function productBySlug(slug: string): ShopProduct | undefined {
  return SHOP_PRODUCTS.find((p) => p.slug === slug);
}

export function productsByDepartment(department: DepartmentSlug): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.department === department);
}

export function realmShopBySlug(slug: string): RealmShopCollection | undefined {
  return REALM_SHOP_COLLECTIONS.find((r) => r.slug === slug);
}

export function productsForRealmShop(realm: RealmShopSlug): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.realms.includes(realm));
}

export function productsForGiftPersona(persona: GiftPersonaSlug): ShopProduct[] {
  return SHOP_PRODUCTS.filter((p) => p.giftPersonas.includes(persona));
}

export function guideBySlug(slug: string): BuyingGuide | undefined {
  return BUYING_GUIDES.find((g) => g.slug === slug);
}

export function relatedProductsFor(product: ShopProduct, limit = 4): ShopProduct[] {
  const sameDept = SHOP_PRODUCTS.filter(
    (p) => p.slug !== product.slug && p.department === product.department,
  );
  const crossRealm = SHOP_PRODUCTS.filter(
    (p) =>
      p.slug !== product.slug &&
      p.department !== product.department &&
      p.realms.some((r) => product.realms.includes(r)),
  );
  return [...sameDept, ...crossRealm].slice(0, limit);
}

export function getTarotDeckOfTheWeek(date: Date = new Date()): ShopProduct {
  const decks = SHOP_PRODUCTS.filter(
    (p) => p.department === "tarot-oracle" && (p.format === "Deck & Guidebook" || p.format === "Boxed Kit"),
  );
  const startOfYear = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000);
  const weekIndex = Math.max(0, Math.floor(dayOfYear / 7));
  return decks[weekIndex % decks.length] || SHOP_PRODUCTS[0];
}

export function getReadingLibraryProducts(): ShopProduct[] {
  return SHOP_PRODUCTS.filter(
    (p) => p.format === "Paperback" || p.format === "Hardcover" || p.format === "Journal",
  );
}
