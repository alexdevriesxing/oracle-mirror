export type RoutineSiteId = "glow" | "runway" | "haven";

export interface RoutinePublication {
  id: RoutineSiteId;
  name: string;
  tagline: string;
  description: string;
  ctaLabel: string;
  url: string;
  image: string;
  imageAlt: string;
  focusAreas: string[];
}

export interface ContributorAsset {
  id: "dewi" | "eileen";
  name: string;
  featureTitle: string;
  featureQuote: string;
  bio: string;
  disclosure: string;
  avatarPath: string;
  avatarSha256: string;
  portraitPath: string;
  portraitSha256: string;
  articleUrl: string;
  articleLabel: string;
  siteId: RoutineSiteId;
  siteName: string;
}

export interface DailyEditRecommendation {
  siteId: RoutineSiteId;
  siteName: string;
  headline: string;
  description: string;
  url: string;
  image: string;
}

export interface DailyEditEdition {
  themeId: string;
  dayIndex: number;
  title: string;
  status: "published";
  themeTags: string[];
  reflection: string;
  recommendations: [DailyEditRecommendation, DailyEditRecommendation, DailyEditRecommendation];
}

export interface PostReadingMapping {
  realmKey: string;
  heading: string;
  subcopy: string;
  emporiumPath: string;
  emporiumLabel: string;
  recommendations: DailyEditRecommendation[];
}

export const MANIFEST_VERSION = "2026-11-28.1";

export const ALLOWED_ROUTINE_HOSTS = new Set([
  "www.routineandglow.com",
  "routineandglow.com",
  "www.routineandrunway.com",
  "routineandrunway.com",
  "www.routineandhaven.com",
  "routineandhaven.com",
]);

export function isValidRoutineUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return parsed.protocol === "https:" && ALLOWED_ROUTINE_HOSTS.has(parsed.hostname);
  } catch {
    return false;
  }
}

export const ROUTINE_PUBLICATIONS: RoutinePublication[] = [
  {
    id: "glow",
    name: "Routine & Glow",
    tagline: "Beauty & Rituals",
    description: "Discover beauty rituals, personal care, fragrances and little everyday luxuries.",
    ctaLabel: "Explore Beauty",
    url: "https://www.routineandglow.com/",
    image: "/assets/routine/glow-editorial.webp",
    imageAlt: "Skincare and beauty ritual essentials curated by Routine & Glow",
    focusAreas: ["Skincare", "Fragrance", "Evening Rituals", "Beauty Tools"],
  },
  {
    id: "runway",
    name: "Routine & Runway",
    tagline: "Style & Accessories",
    description: "Discover personal style, meaningful accessories, fashion and individual expression.",
    ctaLabel: "Explore Style",
    url: "https://www.routineandrunway.com/",
    image: "/assets/routine/runway-editorial.webp",
    imageAlt: "Eileen in tailored city outerwear featured on Routine & Runway",
    focusAreas: ["Personal Style", "Symbolic Jewelry", "Accessories", "Wardrobe Guides"],
  },
  {
    id: "haven",
    name: "Routine & Haven",
    tagline: "Home & Living",
    description: "Create a welcoming, comfortable and beautifully considered home.",
    ctaLabel: "Explore Beautiful Living",
    url: "https://www.routineandhaven.com/",
    image: "/assets/routine/haven-editorial.webp",
    imageAlt: "Warm linen sofa and natural textures from Routine & Haven",
    focusAreas: ["Warm Lighting", "Reading Corners", "Japandi & Nordic", "Home Fragrance"],
  },
];

export const CONTRIBUTOR_ASSETS: ContributorAsset[] = [
  {
    id: "dewi",
    name: "Dewi",
    featureTitle: "Dewi's Everyday Inspiration",
    featureQuote: "Sometimes a small change in your surroundings or daily routine can make the day feel a little more enjoyable.",
    bio: "Dewi is an editorial host across the Routine lifestyle publications, sharing practical ideas on warm textures, sensory routines, and unhurried daily rituals.",
    disclosure: "Dewi is a fictional, AI-created editorial contributor shared with Routine & Glow, Routine & Runway, and Routine & Haven. Her notes offer everyday lifestyle inspiration, not spiritual, astrological, or professional advice.",
    avatarPath: "/assets/contributors/dewi-avatar.webp",
    avatarSha256: "35401dc6e29c1057575dad5b16da62af11a79b393f78c58210aae3a85ce6070e",
    portraitPath: "/assets/contributors/dewi.webp",
    portraitSha256: "0d9e4c290bd4d8913b3024c41e69497f33fcaac21654d567bc5defcbae856e6e",
    articleUrl: "https://www.routineandhaven.com/journal/bringing-balinese-warmth-into-a-city-apartment/",
    articleLabel: "Read on Routine & Haven",
    siteId: "haven",
    siteName: "Routine & Haven",
  },
  {
    id: "eileen",
    name: "Eileen",
    featureTitle: "Eileen's Beautiful Living Edit",
    featureQuote: "Discover timeless little luxuries that make everyday life feel more considered.",
    bio: "Eileen is an editorial host across the Routine lifestyle publications, focusing on understated European style, fragrance, and calm interior details.",
    disclosure: "Eileen is a fictional, AI-created editorial contributor shared with Routine & Glow, Routine & Runway, and Routine & Haven. Her notes offer everyday lifestyle inspiration, not spiritual, astrological, or professional advice.",
    avatarPath: "/assets/contributors/eileen-avatar.webp",
    avatarSha256: "f514f617ef40c9ac2ad768b3cb10b11a4c2619a55459e45919436ab51a826789",
    portraitPath: "/assets/contributors/eileen.webp",
    portraitSha256: "6cfe4b71f979fb57e10cae15837d3dd29f6a085eeaf49a911c12d34f2faa89d2",
    articleUrl: "https://www.routineandglow.com/edits/eileen/",
    articleLabel: "Read on Routine & Glow",
    siteId: "glow",
    siteName: "Routine & Glow",
  },
];

const GLOW_REC = (headline: string, description: string, url: string): DailyEditRecommendation => ({
  siteId: "glow",
  siteName: "Routine & Glow",
  headline,
  description,
  url,
  image: "/assets/routine/glow-editorial.webp",
});

const RUNWAY_REC = (headline: string, description: string, url: string): DailyEditRecommendation => ({
  siteId: "runway",
  siteName: "Routine & Runway",
  headline,
  description,
  url,
  image: "/assets/routine/runway-editorial.webp",
});

const HAVEN_REC = (headline: string, description: string, url: string): DailyEditRecommendation => ({
  siteId: "haven",
  siteName: "Routine & Haven",
  headline,
  description,
  url,
  image: "/assets/routine/haven-editorial.webp",
});

export const DAILY_EDIT_EDITIONS: DailyEditEdition[] = [
  {
    themeId: "sunday-sanctuary",
    dayIndex: 1,
    title: "Sunday Sanctuary",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "Take a moment to reflect on the week behind you and enjoy the small things that made it meaningful.",
    recommendations: [
      GLOW_REC("An evening beauty ritual", "Unwind with a calm, three-step skincare routine.", "https://www.routineandglow.com/magazine/less-is-more/"),
      RUNWAY_REC("Comfortable personal style", "Soft tailoring and relaxed layers for an unhurried day.", "https://www.routineandrunway.com/looks/sage-day/"),
      HAVEN_REC("A peaceful reading corner", "Create a quiet corner with warm lighting and a supportive chair.", "https://www.routineandhaven.com/looks/the-mid-century-reading-room/"),
    ],
  },
  {
    themeId: "quiet-luxury",
    dayIndex: 2,
    title: "Quiet Luxury",
    status: "published",
    themeTags: ["personal-style", "home-comfort"],
    reflection: "Sometimes the most enjoyable things are the simplest. Consider what brings genuine comfort to your everyday life.",
    recommendations: [
      GLOW_REC("Considered everyday luxury", "Choosing fewer, better personal care staples.", "https://www.routineandglow.com/magazine/luxury-value/"),
      RUNWAY_REC("Ivory tailoring & tonal ease", "Neutral silhouettes that feel effortless from morning to evening.", "https://www.routineandrunway.com/looks/ivory-tailoring/"),
      HAVEN_REC("The quiet luxury bedroom", "Layered bedding and soft textures for restful nights.", "https://www.routineandhaven.com/looks/the-quiet-luxury-bedroom/"),
    ],
  },
  {
    themeId: "a-fresh-start",
    dayIndex: 3,
    title: "A Fresh Start",
    status: "published",
    themeTags: ["creative-inspiration", "journaling"],
    reflection: "Give yourself permission to approach the day with curiosity and an open mind.",
    recommendations: [
      GLOW_REC("Daily discovery edit", "Fresh beauty and personal care finds worth noting.", "https://www.routineandglow.com/daily-discovery/"),
      RUNWAY_REC("Building a capsule wardrobe", "Simplify morning choices with versatile, reliable pieces.", "https://www.routineandrunway.com/journal/capsule-wardrobe/"),
      HAVEN_REC("A warm entryway pause", "Make coming home feel welcoming from the very first step.", "https://www.routineandhaven.com/looks/the-warm-entryway-pause/"),
    ],
  },
  {
    themeId: "natural-balance",
    dayIndex: 4,
    title: "Natural Balance",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "Consider where a little more balance might make your daily routine feel more enjoyable.",
    recommendations: [
      GLOW_REC("Thoughtful body care", "Simple hydration and scent rituals that ground the senses.", "https://www.routineandglow.com/magazine/body-care/"),
      RUNWAY_REC("Camel & chocolate tones", "Warm earth palettes that pair naturally across seasons.", "https://www.routineandrunway.com/looks/camel-chocolate/"),
      HAVEN_REC("The Japandi sanctuary", "Natural timber, clean lines, and calm breathing room.", "https://www.routineandhaven.com/looks/the-japandi-sanctuary/"),
    ],
  },
  {
    themeId: "modern-romance",
    dayIndex: 5,
    title: "Modern Romance",
    status: "published",
    themeTags: ["fragrance", "personal-style"],
    reflection: "Reflect on the everyday gestures that help people feel appreciated.",
    recommendations: [
      GLOW_REC("Exploring fragrance families", "Understand floral, woody, and amber notes for personal scent.", "https://www.routineandglow.com/magazine/fragrance-families/"),
      RUNWAY_REC("After-dark evening style", "Understated evening dressing for dinner or a night out.", "https://www.routineandrunway.com/looks/after-dark/"),
      HAVEN_REC("Setting a calm dinner table", "Thoughtful tableware and candlelight for relaxed hosting.", "https://www.routineandhaven.com/journal/the-calm-table-setting-a-dinner-for-four/"),
    ],
  },
  {
    themeId: "gentle-mornings",
    dayIndex: 6,
    title: "Gentle Mornings",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "How you begin the first twenty minutes of your morning often shapes the pace of the hours that follow.",
    recommendations: [
      GLOW_REC("Minimalist skincare essentials", "A cleanser, moisturizer, and daytime protection—nothing extra.", "https://www.routineandglow.com/shop/skincare/"),
      RUNWAY_REC("The city trench edit", "A reliable outer layer that pulls an outfit together in seconds.", "https://www.routineandrunway.com/looks/city-trench/"),
      HAVEN_REC("Scandinavian Sunday light", "Bright, uncluttered spaces designed for slow mornings.", "https://www.routineandhaven.com/looks/the-scandinavian-sunday/"),
    ],
  },
  {
    themeId: "tactile-comfort",
    dayIndex: 7,
    title: "Tactile Comfort",
    status: "published",
    themeTags: ["home-comfort", "personal-style"],
    reflection: "Notice the textures around you today—linen, wool, ceramic, or warm water—and how they affect your mood.",
    recommendations: [
      GLOW_REC("Korean beauty textures", "Lightweight essences and soothing layers for daily comfort.", "https://www.routineandglow.com/magazine/korean-beauty/"),
      RUNWAY_REC("Choosing a daily work bag", "Practical proportions and durable materials for everyday carry.", "https://www.routineandrunway.com/journal/choose-a-work-bag/"),
      HAVEN_REC("Styling cushions with ease", "How to mix weaves and tones on a sofa without overthinking.", "https://www.routineandhaven.com/journal/how-to-style-cushions-without-overthinking-it/"),
    ],
  },
  {
    themeId: "golden-hour",
    dayIndex: 8,
    title: "Golden Hour",
    status: "published",
    themeTags: ["home-comfort", "fragrance"],
    reflection: "As daylight softens, let your environment shift from productivity to ease.",
    recommendations: [
      GLOW_REC("Warm fragrance notes", "Amber, cedar, and soft spice scents for late afternoon.", "https://www.routineandglow.com/shop/fragrance/"),
      RUNWAY_REC("Champagne evening dressing", "Soft luminosity and timeless silhouettes for special evenings.", "https://www.routineandrunway.com/looks/champagne-evening/"),
      HAVEN_REC("Why warm lighting matters", "How table and floor lamps transform a room faster than new furniture.", "https://www.routineandhaven.com/journal/why-warm-lighting-changes-a-room-faster-than-new-furniture/"),
    ],
  },
  {
    themeId: "small-rituals",
    dayIndex: 9,
    title: "Small Rituals",
    status: "published",
    themeTags: ["evening-reflection", "journaling"],
    reflection: "A five-minute pause with tea or a notebook can turn an ordinary afternoon into a moment of clarity.",
    recommendations: [
      GLOW_REC("Wash-day haircare ritual", "Turning routine haircare into a restorative weekly habit.", "https://www.routineandglow.com/magazine/wash-day/"),
      RUNWAY_REC("Jewelry and necklines", "Simple proportions for pairing pendants, hoops, and collars.", "https://www.routineandrunway.com/journal/jewelry-and-necklines/"),
      HAVEN_REC("Ceramic vases and natural stems", "Bringing seasonal greenery indoors with sculptural ceramics.", "https://www.routineandhaven.com/journal/a-practical-guide-to-ceramic-vases-and-natural-stems/"),
    ],
  },
  {
    themeId: "considered-spaces",
    dayIndex: 10,
    title: "Considered Spaces",
    status: "published",
    themeTags: ["home-comfort", "creative-inspiration"],
    reflection: "Clearing a single surface—a desk, a nightstand, or a shelf—creates room for fresh ideas.",
    recommendations: [
      GLOW_REC("Streamlined makeup kit", "Keep only the everyday pieces you genuinely reach for.", "https://www.routineandglow.com/magazine/makeup-kit/"),
      RUNWAY_REC("Everyday accessories", "Belts, scarves, and sunglasses that anchor simple outfits.", "https://www.routineandrunway.com/shop/accessories/"),
      HAVEN_REC("The quiet timber study", "A calm workspace built around natural wood and soft light.", "https://www.routineandhaven.com/looks/the-quiet-timber-study/"),
    ],
  },
  {
    themeId: "creative-curiosity",
    dayIndex: 11,
    title: "Creative Curiosity",
    status: "published",
    themeTags: ["creative-inspiration", "journaling"],
    reflection: "Follow one small thread of curiosity today without expecting an immediate outcome.",
    recommendations: [
      GLOW_REC("Dewi's beauty edit", "Luminous colour and global skincare inspiration.", "https://www.routineandglow.com/edits/dewi/"),
      RUNWAY_REC("Dressing for an occasion", "How to feel comfortable and authentic at milestone events.", "https://www.routineandrunway.com/journal/dress-for-an-occasion/"),
      HAVEN_REC("The creative bohemian corner", "Layered textiles, art books, and personal keepsakes.", "https://www.routineandhaven.com/looks/the-creative-bohemian-corner/"),
    ],
  },
  {
    themeId: "warm-hospitality",
    dayIndex: 12,
    title: "Warm Hospitality",
    status: "published",
    themeTags: ["home-comfort", "gift-discovery"],
    reflection: "Hospitality starts with making the people around you—and yourself—feel genuinely at ease.",
    recommendations: [
      GLOW_REC("Eileen's beauty edit", "Understated European staples and thoughtful everyday scents.", "https://www.routineandglow.com/edits/eileen/"),
      RUNWAY_REC("Symbolic jewelry pieces", "Timeless rings, lockets, and bracelets with personal meaning.", "https://www.routineandrunway.com/shop/jewelry/"),
      HAVEN_REC("Balinese warmth in the city", "Teak accents, woven textures, and welcoming living spaces.", "https://www.routineandhaven.com/journal/bringing-balinese-warmth-into-a-city-apartment/"),
    ],
  },
  {
    themeId: "restful-evenings",
    dayIndex: 13,
    title: "Restful Evenings",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "Letting go of unfinished errands in the evening gives tomorrow a cleaner slate.",
    recommendations: [
      GLOW_REC("Beauty tools that simplify", "Practical tools that support a calm evening routine.", "https://www.routineandglow.com/magazine/beauty-tools/"),
      RUNWAY_REC("Relaxed handbag essentials", "Organizing what you carry so evenings stay light.", "https://www.routineandrunway.com/shop/handbags/"),
      HAVEN_REC("The stillness bedroom", "Soft, low-contrast tones designed for genuine rest.", "https://www.routineandhaven.com/looks/the-stillness-bedroom/"),
    ],
  },
  {
    themeId: "subtle-detail",
    dayIndex: 14,
    title: "Subtle Detail",
    status: "published",
    themeTags: ["personal-style", "creative-inspiration"],
    reflection: "Often it is a single thoughtful detail—a scent, a cufflink, a handwritten note—that makes something memorable.",
    recommendations: [
      GLOW_REC("Grooming basics done well", "Clean, reliable daily habits for skin and hair.", "https://www.routineandglow.com/magazine/grooming-basics/"),
      RUNWAY_REC("The style journal", "Practical guides to fit, fabric, and personal expression.", "https://www.routineandrunway.com/journal/"),
      HAVEN_REC("The tonal living room", "Depth through texture rather than visual clutter.", "https://www.routineandhaven.com/looks/the-tonal-living-room/"),
    ],
  },
  {
    themeId: "seasonal-shift",
    dayIndex: 15,
    title: "Seasonal Shift",
    status: "published",
    themeTags: ["home-comfort", "personal-style"],
    reflection: "Notice what feels ready for a gentle refresh as the light and rhythm of the season change.",
    recommendations: [
      GLOW_REC("Glow for less", "High-performing everyday beauty finds at sensible prices.", "https://www.routineandglow.com/edits/glow-for-less/"),
      RUNWAY_REC("Seasonal lookbook", "Visual outfit ideas built around wearable staples.", "https://www.routineandrunway.com/looks/"),
      HAVEN_REC("Layering a neutral room", "Combining warm woods, linen, and matte ceramics.", "https://www.routineandhaven.com/journal/how-to-layer-a-neutral-living-room-so-it-never-feels-flat/"),
    ],
  },
  {
    themeId: "mindful-pauses",
    dayIndex: 16,
    title: "Mindful Pauses",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "A pause is not lost time; it is how you notice what actually matters.",
    recommendations: [
      GLOW_REC("The Daily Glow magazine", "Considered essays on beauty, care, and pacing.", "https://www.routineandglow.com/magazine/"),
      RUNWAY_REC("Dewi & Eileen's style notes", "Two perspectives on dressing with ease.", "https://www.routineandrunway.com/hosts/"),
      HAVEN_REC("The light-filled Nordic bath", "Calm, spa-like organization for everyday routines.", "https://www.routineandhaven.com/looks/the-light-filled-nordic-bath/"),
    ],
  },
  {
    themeId: "personal-signature",
    dayIndex: 17,
    title: "Personal Signature",
    status: "published",
    themeTags: ["fragrance", "personal-style"],
    reflection: "Your personal style works best when it reflects how you actually live, not a passing trend.",
    recommendations: [
      GLOW_REC("Finding a signature scent", "How to test and layer fragrances without overwhelm.", "https://www.routineandglow.com/magazine/fragrance-families/"),
      RUNWAY_REC("Jewelry & accessories", "Pieces that feel personal enough to wear every day.", "https://www.routineandrunway.com/shop/jewelry/"),
      HAVEN_REC("Home fragrance & candles", "Subtle scents that define the atmosphere of a room.", "https://www.routineandhaven.com/shop/home-fragrance/"),
    ],
  },
  {
    themeId: "unhurried-pace",
    dayIndex: 18,
    title: "Unhurried Pace",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "Doing one thing with full attention often feels calmer than rushing through five.",
    recommendations: [
      GLOW_REC("Less is more in skincare", "Why consistency beats complicated ten-step routines.", "https://www.routineandglow.com/magazine/less-is-more/"),
      RUNWAY_REC("Sage day tailoring", "Soft, breathable silhouettes for relaxed focus.", "https://www.routineandrunway.com/looks/sage-day/"),
      HAVEN_REC("A Balinese villa at home", "Indoor-outdoor calm with natural timber and greenery.", "https://www.routineandhaven.com/looks/a-balinese-villa-at-home/"),
    ],
  },
  {
    themeId: "quiet-confidence",
    dayIndex: 19,
    title: "Quiet Confidence",
    status: "published",
    themeTags: ["personal-style", "creative-inspiration"],
    reflection: "Comfort and preparedness are two of the simplest foundations for feeling at ease.",
    recommendations: [
      GLOW_REC("Daily skincare basics", "Reliable hydration and barrier care for every season.", "https://www.routineandglow.com/shop/skincare/"),
      RUNWAY_REC("Ivory tailoring", "Crisp, timeless lines that never try too hard.", "https://www.routineandrunway.com/looks/ivory-tailoring/"),
      HAVEN_REC("The walnut studio office", "Warm mid-century tones for focused, calm work.", "https://www.routineandhaven.com/looks/the-walnut-studio-office/"),
    ],
  },
  {
    themeId: "botanical-calm",
    dayIndex: 20,
    title: "Botanical Calm",
    status: "published",
    themeTags: ["home-comfort", "creative-inspiration"],
    reflection: "A touch of green—a houseplant, a walk under trees, or fresh herbs—softens the sharpest day.",
    recommendations: [
      GLOW_REC("Botanical body care", "Gentle, plant-inspired textures for daily care.", "https://www.routineandglow.com/magazine/body-care/"),
      RUNWAY_REC("Natural-toned accessories", "Woven, leather, and tonal accents for everyday wear.", "https://www.routineandrunway.com/shop/accessories/"),
      HAVEN_REC("Sunlit botanical gallery", "Pairing framed prints with living greenery.", "https://www.routineandhaven.com/looks/the-sunlit-botanical-gallery/"),
    ],
  },
  {
    themeId: "thoughtful-gifting",
    dayIndex: 21,
    title: "Thoughtful Gifting",
    status: "published",
    themeTags: ["gift-discovery", "personal-style"],
    reflection: "The best gifts show that you noticed how someone actually spends their quiet hours.",
    recommendations: [
      GLOW_REC("Fragrance & giftable beauty", "Scents and sets that feel personal and practical.", "https://www.routineandglow.com/shop/fragrance/"),
      RUNWAY_REC("Meaningful jewelry gifts", "Classic pieces chosen for everyday wearability.", "https://www.routineandrunway.com/shop/jewelry/"),
      HAVEN_REC("Ceramics & decorative vases", "Tactile objects that brighten a dining table or shelf.", "https://www.routineandhaven.com/shop/ceramics-and-vases/"),
    ],
  },
  {
    themeId: "evening-glow",
    dayIndex: 22,
    title: "Evening Glow",
    status: "published",
    themeTags: ["evening-reflection", "home-comfort"],
    reflection: "Soft light in the evening tells the mind it is safe to slow down.",
    recommendations: [
      GLOW_REC("Restorative evening care", "Gentle cleansing and moisture before sleep.", "https://www.routineandglow.com/magazine/less-is-more/"),
      RUNWAY_REC("After-dark wardrobe", "Effortless pieces for evening plans.", "https://www.routineandrunway.com/looks/after-dark/"),
      HAVEN_REC("Ambient home lighting", "Lamps and sconces that create a warm evening atmosphere.", "https://www.routineandhaven.com/shop/lighting/"),
    ],
  },
  {
    themeId: "art-of-editing",
    dayIndex: 23,
    title: "The Art of Editing",
    status: "published",
    themeTags: ["creative-inspiration", "personal-style"],
    reflection: "Removing one unnecessary obligation or item often makes everything else shine.",
    recommendations: [
      GLOW_REC("Curated makeup kit", "Fewer products, chosen for versatility.", "https://www.routineandglow.com/magazine/makeup-kit/"),
      RUNWAY_REC("Capsule wardrobe guide", "Building a cohesive closet around pieces you love.", "https://www.routineandrunway.com/journal/capsule-wardrobe/"),
      HAVEN_REC("The Nordic living room", "Airy proportions and purposeful furniture.", "https://www.routineandhaven.com/looks/the-nordic-living-room-edit/"),
    ],
  },
  {
    themeId: "shared-tables",
    dayIndex: 24,
    title: "Shared Tables",
    status: "published",
    themeTags: ["home-comfort", "gift-discovery"],
    reflection: "Good conversation rarely needs an elaborate backdrop—just warmth and unhurried time.",
    recommendations: [
      GLOW_REC("Eileen's fragrance notes", "Soft, welcoming scents suited to close company.", "https://www.routineandglow.com/edits/eileen/"),
      RUNWAY_REC("Occasion dressing", "Polished, comfortable outfits for gatherings.", "https://www.routineandrunway.com/journal/dress-for-an-occasion/"),
      HAVEN_REC("The Haussmannian dining salon", "Classic table proportions and candlelit warmth.", "https://www.routineandhaven.com/looks/the-haussmannian-dining-salon/"),
    ],
  },
  {
    themeId: "open-air",
    dayIndex: 25,
    title: "Open Air",
    status: "published",
    themeTags: ["home-comfort", "creative-inspiration"],
    reflection: "Step outside for ten minutes without headphones and let your thoughts settle naturally.",
    recommendations: [
      GLOW_REC("Daytime skin protection", "Light, breathable daily sun care.", "https://www.routineandglow.com/magazine/korean-beauty/"),
      RUNWAY_REC("City trench outerwear", "Weather-ready style for crisp walks.", "https://www.routineandrunway.com/looks/city-trench/"),
      HAVEN_REC("Small balcony sanctuary", "Turning even a compact outdoor space into an extra room.", "https://www.routineandhaven.com/journal/making-a-tiny-balcony-feel-like-an-extra-room/"),
    ],
  },
  {
    themeId: "calm-organization",
    dayIndex: 26,
    title: "Calm Organization",
    status: "published",
    themeTags: ["home-comfort", "journaling"],
    reflection: "When everyday objects have a natural home, your mind spends less energy searching.",
    recommendations: [
      GLOW_REC("Grooming & vanity order", "Simple habits that keep daily routines smooth.", "https://www.routineandglow.com/magazine/grooming-basics/"),
      RUNWAY_REC("The right everyday bag", "Structured compartments that keep essentials tidy.", "https://www.routineandrunway.com/journal/choose-a-work-bag/"),
      HAVEN_REC("The Parisian apartment edit", "Balanced storage and classic architectural charm.", "https://www.routineandhaven.com/looks/the-parisian-apartment/"),
    ],
  },
  {
    themeId: "reflective-reading",
    dayIndex: 27,
    title: "Reflective Reading",
    status: "published",
    themeTags: ["journaling", "evening-reflection"],
    reflection: "A few quiet pages before bed can replace the noise of a long day.",
    recommendations: [
      GLOW_REC("Evening wind-down", "Simple, soothing steps before turning in.", "https://www.routineandglow.com/daily-discovery/"),
      RUNWAY_REC("Lounge & evening ease", "Comfortable layers for quiet evenings indoors.", "https://www.routineandrunway.com/looks/sage-day/"),
      HAVEN_REC("Mid-century reading room", "Warm wood, good task lighting, and a quiet chair.", "https://www.routineandhaven.com/looks/the-mid-century-reading-room/"),
    ],
  },
  {
    themeId: "soft-architecture",
    dayIndex: 28,
    title: "Soft Architecture",
    status: "published",
    themeTags: ["personal-style", "home-comfort"],
    reflection: "Clean lines feel warmest when paired with natural materials and personal stories.",
    recommendations: [
      GLOW_REC("Considered beauty", "Quality textures and understated packaging.", "https://www.routineandglow.com/magazine/luxury-value/"),
      RUNWAY_REC("Camel & chocolate palette", "Structured coats and soft knits in rich neutrals.", "https://www.routineandrunway.com/looks/camel-chocolate/"),
      HAVEN_REC("The retro lounge edit", "Sculptural seating and warm ambient light.", "https://www.routineandhaven.com/looks/the-retro-lounge-edit/"),
    ],
  },
  {
    themeId: "everyday-gratitude",
    dayIndex: 29,
    title: "Everyday Gratitude",
    status: "published",
    themeTags: ["evening-reflection", "journaling"],
    reflection: "Naming three small things that went well today is one of the simplest ways to close the day.",
    recommendations: [
      GLOW_REC("Dewi's everyday rituals", "Small sensory pleasures from morning to night.", "https://www.routineandglow.com/edits/dewi/"),
      RUNWAY_REC("Necklines & jewelry", "Wearing sentimental pieces with everyday outfits.", "https://www.routineandrunway.com/journal/jewelry-and-necklines/"),
      HAVEN_REC("Bedroom & bedding comfort", "Crisp sheets and calm proportions for better rest.", "https://www.routineandhaven.com/shop/bedroom-and-bedding/"),
    ],
  },
  {
    themeId: "horizon-view",
    dayIndex: 30,
    title: "Horizon View",
    status: "published",
    themeTags: ["creative-inspiration", "evening-reflection"],
    reflection: "Step back and look at the month as a whole—notice what energized you and what you are ready to carry forward.",
    recommendations: [
      GLOW_REC("The Daily Glow", "Ongoing inspiration for beauty and personal care.", "https://www.routineandglow.com/magazine/"),
      RUNWAY_REC("The Style Journal", "Thoughtful guides for personal wardrobe clarity.", "https://www.routineandrunway.com/journal/"),
      HAVEN_REC("The Haven Journal", "Practical guides to lighting, rooms, and everyday rituals.", "https://www.routineandhaven.com/journal/"),
    ],
  },
];

export const POST_READING_RECOMMENDATIONS: Record<string, PostReadingMapping> = {
  "daily-fortune": {
    realmKey: "daily-fortune",
    heading: "A Little Everyday Inspiration",
    subcopy: "If you enjoyed today's reflection, explore practical lifestyle ideas from our sister publications.",
    emporiumPath: "/shop/meditation-reflection",
    emporiumLabel: "Browse Reflection & Journals in the Emporium",
    recommendations: [
      GLOW_REC("Today's beauty discovery", "Simple personal care ideas on Routine & Glow.", "https://www.routineandglow.com/daily-discovery/"),
      RUNWAY_REC("Effortless daily style", "Wearable outfit inspiration on Routine & Runway.", "https://www.routineandrunway.com/looks/"),
      HAVEN_REC("A calm morning space", "Warm entryway and living ideas on Routine & Haven.", "https://www.routineandhaven.com/looks/the-warm-entryway-pause/"),
    ],
  },
  "western-zodiac": {
    realmKey: "western-zodiac",
    heading: "Take a Moment for Yourself",
    subcopy: "Complementary everyday inspiration from our sister lifestyle publications.",
    emporiumPath: "/shop/astrology-zodiac",
    emporiumLabel: "Explore Astrology Books & Gifts",
    recommendations: [
      GLOW_REC("Daily beauty rituals", "Considered skincare and fragrance notes on Glow.", "https://www.routineandglow.com/magazine/"),
      RUNWAY_REC("Personal style notes", "Capsule wardrobe ideas on Routine & Runway.", "https://www.routineandrunway.com/journal/capsule-wardrobe/"),
      HAVEN_REC("Warm home lighting", "Create a relaxing evening atmosphere on Haven.", "https://www.routineandhaven.com/journal/why-warm-lighting-changes-a-room-faster-than-new-furniture/"),
    ],
  },
  "tarot": {
    realmKey: "tarot",
    heading: "A Little Everyday Inspiration",
    subcopy: "Pair quiet reflection with a comfortable reading corner and thoughtful daily routines.",
    emporiumPath: "/shop/tarot-oracle",
    emporiumLabel: "Explore Tarot Decks & Guidebooks",
    recommendations: [
      HAVEN_REC("Design a peaceful reading corner", "Task lighting and comfortable seating on Routine & Haven.", "https://www.routineandhaven.com/looks/the-mid-century-reading-room/"),
      GLOW_REC("An unhurried evening ritual", "Simple, grounding skincare on Routine & Glow.", "https://www.routineandglow.com/magazine/less-is-more/"),
      RUNWAY_REC("Thoughtful everyday style", "Comfortable, considered pieces on Routine & Runway.", "https://www.routineandrunway.com/looks/sage-day/"),
    ],
  },
  "dream-interpreter": {
    realmKey: "dream-interpreter",
    heading: "Explore Beautiful Living",
    subcopy: "Create a restful bedroom environment and calming evening routine.",
    emporiumPath: "/shop/dream-journaling",
    emporiumLabel: "Browse Dream Journals & Guides",
    recommendations: [
      HAVEN_REC("The stillness bedroom", "Calm, low-contrast bedroom styling on Routine & Haven.", "https://www.routineandhaven.com/looks/the-stillness-bedroom/"),
      HAVEN_REC("Bedding & restful textiles", "Crisp, comfortable bedding ideas on Routine & Haven.", "https://www.routineandhaven.com/shop/bedroom-and-bedding/"),
      GLOW_REC("Evening beauty routines", "Gentle wind-down care on Routine & Glow.", "https://www.routineandglow.com/magazine/body-care/"),
    ],
  },
  "love-match": {
    realmKey: "love-match",
    heading: "You May Also Enjoy",
    subcopy: "Ideas for date-night style, personal fragrance, and warm dining spaces.",
    emporiumPath: "/shop/celestial-gifts",
    emporiumLabel: "Browse Meaningful Gifts in the Emporium",
    recommendations: [
      RUNWAY_REC("Date-night evening style", "Understated evening looks on Routine & Runway.", "https://www.routineandrunway.com/looks/after-dark/"),
      GLOW_REC("Fragrance families guide", "Explore floral, woody, and amber scents on Glow.", "https://www.routineandglow.com/magazine/fragrance-families/"),
      HAVEN_REC("Setting a calm dinner table", "Thoughtful dining-room styling on Routine & Haven.", "https://www.routineandhaven.com/journal/the-calm-table-setting-a-dinner-for-four/"),
    ],
  },
  "love-oracle": {
    realmKey: "love-oracle",
    heading: "You May Also Enjoy",
    subcopy: "Practical lifestyle inspiration for evenings out or quiet nights in.",
    emporiumPath: "/shop/celestial-gifts",
    emporiumLabel: "Browse Meaningful Gifts in the Emporium",
    recommendations: [
      RUNWAY_REC("Champagne evening style", "Timeless evening silhouettes on Routine & Runway.", "https://www.routineandrunway.com/looks/champagne-evening/"),
      GLOW_REC("Signature fragrances", "Discover everyday and evening scents on Glow.", "https://www.routineandglow.com/shop/fragrance/"),
      HAVEN_REC("The Haussmannian dining salon", "Warm candlelit dining inspiration on Haven.", "https://www.routineandhaven.com/looks/the-haussmannian-dining-salon/"),
    ],
  },
  "numerology": {
    realmKey: "numerology",
    heading: "Discover Something New",
    subcopy: "Explore symbolic jewelry, thoughtful gifts, and personal style.",
    emporiumPath: "/shop/celestial-gifts",
    emporiumLabel: "Explore Personalized & Symbolic Gifts",
    recommendations: [
      RUNWAY_REC("Symbolic jewelry & keepsakes", "Classic rings and pendants on Routine & Runway.", "https://www.routineandrunway.com/shop/jewelry/"),
      RUNWAY_REC("Jewelry and necklines", "Styling meaningful pieces effortlessly on Runway.", "https://www.routineandrunway.com/journal/jewelry-and-necklines/"),
      HAVEN_REC("Ceramics & decorative gifts", "Timeless objects for a home on Routine & Haven.", "https://www.routineandhaven.com/shop/ceramics-and-vases/"),
    ],
  },
  "palm-reading": {
    realmKey: "palm-reading",
    heading: "Take a Moment for Yourself",
    subcopy: "Hand care, rings, and considered everyday accessories.",
    emporiumPath: "/shop/crystals-symbolism",
    emporiumLabel: "Browse Symbolic Keepsakes in the Emporium",
    recommendations: [
      GLOW_REC("Hand & body care rituals", "Nourishing daily care on Routine & Glow.", "https://www.routineandglow.com/magazine/body-care/"),
      RUNWAY_REC("Rings & symbolic jewelry", "Timeless rings and bracelets on Routine & Runway.", "https://www.routineandrunway.com/shop/jewelry/"),
      HAVEN_REC("Small storage & trays", "Organize rings and keepsakes on Routine & Haven.", "https://www.routineandhaven.com/shop/storage-and-organization/"),
    ],
  },
  "birth-chart": {
    realmKey: "birth-chart",
    heading: "Explore Beautiful Living",
    subcopy: "Evening skincare, comfortable layers, and atmospheric lighting.",
    emporiumPath: "/shop/astrology-zodiac",
    emporiumLabel: "Explore Astrology Books & Guides",
    recommendations: [
      GLOW_REC("Evening skincare rituals", "Simple, restorative care on Routine & Glow.", "https://www.routineandglow.com/magazine/less-is-more/"),
      HAVEN_REC("Atmospheric home lighting", "Warm lamps and sconces on Routine & Haven.", "https://www.routineandhaven.com/shop/lighting/"),
      RUNWAY_REC("Comfortable relaxed style", "Easy everyday silhouettes on Routine & Runway.", "https://www.routineandrunway.com/looks/sage-day/"),
    ],
  },
  "chinese-zodiac": {
    realmKey: "chinese-zodiac",
    heading: "Discover Something New",
    subcopy: "Asian-inspired beauty, warm interiors, and seasonal style.",
    emporiumPath: "/shop/iching-runes",
    emporiumLabel: "Explore Eastern Philosophy & Classics",
    recommendations: [
      GLOW_REC("Asian beauty & skincare", "Thoughtful textures and rituals on Routine & Glow.", "https://www.routineandglow.com/magazine/korean-beauty/"),
      HAVEN_REC("Balinese warmth at home", "Teak, ceramics, and natural weaves on Routine & Haven.", "https://www.routineandhaven.com/journal/bringing-balinese-warmth-into-a-city-apartment/"),
      RUNWAY_REC("Dewi's editorial style", "Relaxed, considered fashion on Routine & Runway.", "https://www.routineandrunway.com/hosts/"),
    ],
  },
  "iching-oracle": {
    realmKey: "iching-oracle",
    heading: "Explore Beautiful Living",
    subcopy: "Japandi interiors, reflective spaces, and unhurried living.",
    emporiumPath: "/shop/iching-runes",
    emporiumLabel: "Explore I Ching & Classic Translations",
    recommendations: [
      HAVEN_REC("The Japandi sanctuary", "Natural materials and calm simplicity on Routine & Haven.", "https://www.routineandhaven.com/looks/the-japandi-sanctuary/"),
      HAVEN_REC("The quiet timber study", "A reflective workspace on Routine & Haven.", "https://www.routineandhaven.com/looks/the-quiet-timber-study/"),
      GLOW_REC("Less-is-more rituals", "A streamlined approach to daily care on Glow.", "https://www.routineandglow.com/magazine/less-is-more/"),
    ],
  },
  "runes": {
    realmKey: "runes",
    heading: "A Little Everyday Inspiration",
    subcopy: "Scandinavian interior inspiration, symbolic jewelry, and calm spaces.",
    emporiumPath: "/shop/iching-runes",
    emporiumLabel: "Explore Rune & Symbolism Books",
    recommendations: [
      HAVEN_REC("The Scandinavian Sunday", "Nordic light and natural wood on Routine & Haven.", "https://www.routineandhaven.com/looks/the-scandinavian-sunday/"),
      RUNWAY_REC("Symbolic jewelry", "Understated rings and pendants on Routine & Runway.", "https://www.routineandrunway.com/shop/jewelry/"),
      HAVEN_REC("The Nordic living room", "Warm, uncluttered living spaces on Routine & Haven.", "https://www.routineandhaven.com/looks/the-nordic-living-room-edit/"),
    ],
  },
  "crystal-ball": {
    realmKey: "crystal-ball",
    heading: "A Little Everyday Inspiration",
    subcopy: "Take a quiet moment with practical lifestyle ideas from our sister publications.",
    emporiumPath: "/shop/crystals-symbolism",
    emporiumLabel: "Browse Decorative Crystals & Books",
    recommendations: [
      HAVEN_REC("Home fragrance & candles", "Subtle scents for a calm room on Routine & Haven.", "https://www.routineandhaven.com/shop/home-fragrance/"),
      GLOW_REC("Evening beauty rituals", "Simple self-care routines on Routine & Glow.", "https://www.routineandglow.com/magazine/"),
      RUNWAY_REC("Everyday accessories", "Timeless personal pieces on Routine & Runway.", "https://www.routineandrunway.com/shop/accessories/"),
    ],
  },
  "magic-8-ball": {
    realmKey: "magic-8-ball",
    heading: "You May Also Enjoy",
    subcopy: "Lighthearted everyday inspiration from our sister lifestyle sites.",
    emporiumPath: "/shop/celestial-gifts",
    emporiumLabel: "Browse Curated Gifts in the Emporium",
    recommendations: [
      GLOW_REC("Daily beauty discovery", "Fresh personal care picks on Routine & Glow.", "https://www.routineandglow.com/daily-discovery/"),
      RUNWAY_REC("The style lookbook", "Quick outfit inspiration on Routine & Runway.", "https://www.routineandrunway.com/looks/"),
      HAVEN_REC("The Haven journal", "Practical home ideas on Routine & Haven.", "https://www.routineandhaven.com/journal/"),
    ],
  },
};

export function getDailyEditForDate(date: Date = new Date()): DailyEditEdition {
  const utcMidnight = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const epochDays = Math.floor(utcMidnight / 86_400_000);
  const index = ((epochDays % DAILY_EDIT_EDITIONS.length) + DAILY_EDIT_EDITIONS.length) % DAILY_EDIT_EDITIONS.length;
  return DAILY_EDIT_EDITIONS[index] || DAILY_EDIT_EDITIONS[0];
}

export function buildPublicEditorialManifest(date: Date = new Date()) {
  const todayEdition = getDailyEditForDate(date);
  const isoDate = date.toISOString().slice(0, 10);
  return {
    manifestVersion: MANIFEST_VERSION,
    generatedDate: isoDate,
    publisher: "Oracle Mirror",
    publications: ROUTINE_PUBLICATIONS,
    contributors: CONTRIBUTOR_ASSETS,
    todayDailyEdit: {
      ...todayEdition,
      publicationDate: isoDate,
    },
    dailyEditScheduleCount: DAILY_EDIT_EDITIONS.length,
    dailyEditSchedule: DAILY_EDIT_EDITIONS,
    postReadingMappings: POST_READING_RECOMMENDATIONS,
  };
}
