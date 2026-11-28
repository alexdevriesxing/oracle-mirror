import { AMAZON_ASSOCIATES_DISCLOSURE } from "./affiliate.ts";
import { CONTRIBUTOR_ASSETS, ROUTINE_PUBLICATIONS, getDailyEditForDate } from "./routine-manifest.ts";

const HOST = "https://oraclemirror.com";
const PUBLISHED_DATE = "2026-11-28";

export interface EditorialArticle {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  readingTime: string;
  datePublished: string;
  dateModified: string;
  paragraphs: string[];
  distinctionNote: string;
  sisterLink: {
    siteName: string;
    label: string;
    url: string;
  };
  emporiumLink: {
    label: string;
    path: string;
  };
}

export const EDITORIAL_ARTICLES: EditorialArticle[] = [
  {
    slug: "bringing-personal-reflection-into-everyday-life",
    title: "Bringing Personal Reflection Into Everyday Life",
    kicker: "Everyday Reflection",
    description: "How brief, unhurried moments of journaling and symbolic reflection can sit naturally beside practical daily routines.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "Personal reflection does not require an elaborate schedule or a quiet weekend retreat. For most people, it works best when woven gently into moments that already exist—waiting for morning coffee to brew, stepping outside for fresh air between tasks, or winding down before sleep.",
      "Across cultures and centuries, people have used storytelling, seasonal calendars, and symbolic traditions as mirrors for their own thoughts. When approached as personal reflection rather than literal prediction, a daily prompt simply gives structure to questions you may already be carrying.",
      "Pairing a five-minute reflection with a tangible sensory cue—dimming overhead lights, applying a familiar evening moisturizer, or sitting in a comfortable reading chair—helps signal to your mind that the pace of the day has shifted.",
    ],
    distinctionNote: "Oracle Mirror presents symbolic tools for personal reflection and entertainment. They are not scientifically validated predictive methods or substitutes for professional guidance.",
    sisterLink: {
      siteName: "Routine & Haven",
      label: "Explore peaceful reading corners on Routine & Haven",
      url: "https://www.routineandhaven.com/looks/the-mid-century-reading-room/",
    },
    emporiumLink: {
      label: "Browse Reflection Journals in the Emporium",
      path: "/shop/meditation-reflection",
    },
  },
  {
    slug: "evening-reflection-ritual",
    title: "Creating Your Own Evening Reflection Ritual",
    kicker: "Evening Routines",
    description: "Practical ideas for combining a calm evening skincare routine, warm lighting, and three quiet lines in a notebook.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "An evening ritual works best when it is simple enough to repeat on an ordinary Tuesday. Rather than adding a long checklist, start by choosing two or three small actions that mark the boundary between work and rest.",
      "In the home, replacing bright overhead lighting with a warm bedside lamp changes the mood of a room within seconds. In personal care, a consistent three-step cleanse and moisturizer routine offers a calm, predictable rhythm.",
      "Once the room feels settled, jotting down three brief observations—one thing that went well, one question on your mind, and one intention for tomorrow—helps clear mental clutter before sleep.",
    ],
    distinctionNote: "Evening routines support personal comfort and relaxation; for persistent sleep or health concerns, consult a qualified healthcare professional.",
    sisterLink: {
      siteName: "Routine & Glow",
      label: "Read Less Is More skincare rituals on Routine & Glow",
      url: "https://www.routineandglow.com/magazine/less-is-more/",
    },
    emporiumLink: {
      label: "Explore Ritual & Atmosphere Essentials",
      path: "/shop/ritual-atmosphere",
    },
  },
  {
    slug: "tarot-as-a-creative-reflection-tool",
    title: "Tarot as a Creative Reflection Tool",
    kicker: "Cultural History & Symbolism",
    description: "Distinguishing the fifteenth-century Italian origins of tarot cards from modern creative journaling and personal reflection.",
    readingTime: "5 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "Historically, tarot began in fifteenth-century northern Italy as a trick-taking card game known as tarocchi, long before its imagery was adapted for esoteric interpretation in the late eighteenth and nineteenth centuries.",
      "Today, many readers enjoy tarot not as a claim of fortune-telling certainty, but as a visual vocabulary for creative thinking. Drawing three cards—Past, Present, and Future—invites you to look at a familiar situation from an unexpected angle.",
      "When treated as a creative prompt rather than a fixed forecast, tarot pairs naturally with journaling, quiet reading spaces, and unhurried conversation.",
    ],
    distinctionNote: "Historical fact: tarot originated as a card game in Renaissance Italy. Modern symbolic readings on Oracle Mirror are intended for entertainment and personal reflection.",
    sisterLink: {
      siteName: "Routine & Haven",
      label: "Explore quiet study spaces on Routine & Haven",
      url: "https://www.routineandhaven.com/looks/the-quiet-timber-study/",
    },
    emporiumLink: {
      label: "Browse Tarot Decks & Guidebooks",
      path: "/shop/tarot-oracle",
    },
  },
  {
    slug: "cultural-history-of-birthstones",
    title: "The Cultural History of Birthstones",
    kicker: "Cultural Traditions",
    description: "How ancient lapidary traditions and modern jewellers shaped the twelve-month birthstone calendar we recognize today.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "The custom of associating gemstones with calendar months has roots in ancient Near Eastern and Mediterranean traditions, later popularized in Europe during the eighteenth century and standardized for modern jewellers in 1912.",
      "Across history, stones such as garnet, amethyst, emerald, and sapphire were admired for their colour, durability, and cultural storytelling. Today, birthstone jewelry remains a popular way to mark birthdays, anniversaries, and personal milestones.",
      "Whether worn as a subtle pendant or a classic ring, symbolic jewelry is best appreciated as craft, personal style, and sentimental memory rather than a promise of supernatural effect.",
    ],
    distinctionNote: "Oracle Mirror presents crystals and gemstones as decorative, cultural, and personal-interest items without medical or supernatural claims.",
    sisterLink: {
      siteName: "Routine & Runway",
      label: "Explore symbolic jewelry on Routine & Runway",
      url: "https://www.routineandrunway.com/shop/jewelry/",
    },
    emporiumLink: {
      label: "Browse Decorative Crystals & Symbolism",
      path: "/shop/crystals-symbolism",
    },
  },
  {
    slug: "understanding-symbolism-of-the-moon",
    title: "Understanding the Symbolism of the Moon",
    kicker: "Astronomy & Culture",
    description: "Separating the astronomical science of lunar phases from centuries of poetic, calendrical, and cultural symbolism.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "Astronomically, the Moon's phases—from New Moon to Full Moon and back—are caused by the changing angle of sunlight illuminating the lunar surface as it orbits Earth roughly every 29.5 days.",
      "Because this cycle is regular and visible to the naked eye, nearly every human civilization built early calendars, agricultural rhythms, and poetic metaphors around it.",
      "Using the lunar cycle as a gentle monthly check-in—a reminder to pause, tidy your space, or review personal goals—is a charming cultural habit, distinct from astronomical science.",
    ],
    distinctionNote: "Scientific context: lunar phases reflect orbital geometry, not personal destiny. Moon astrology on Oracle Mirror is symbolic entertainment.",
    sisterLink: {
      siteName: "Routine & Haven",
      label: "Explore warm evening lighting on Routine & Haven",
      url: "https://www.routineandhaven.com/shop/lighting/",
    },
    emporiumLink: {
      label: "Explore Astrology & Lunar Books",
      path: "/shop/astrology-zodiac",
    },
  },
  {
    slug: "creating-a-beautiful-dream-journal",
    title: "Creating a Beautiful Dream Journal",
    kicker: "Dream Reflection",
    description: "Simple habits for keeping a bedside notebook and creating a restful, uncluttered bedroom environment.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "Dreams fade quickly within minutes of waking. Keeping a dedicated notebook and a reliable pen on your nightstand makes it easy to capture fragments—colours, places, or emotions—before the morning rush begins.",
      "Psychologists and sleep researchers note that dreams reflect memory consolidation and emotional processing during REM sleep rather than literal prophecies. Reviewing dream notes over time often reveals recurring everyday themes.",
      "A calm, comfortable bedroom—cool breathable bedding, soft bedside lighting, and a clutter-free nightstand—supports both better rest and a more pleasant morning routine.",
    ],
    distinctionNote: "Dream interpretation on Oracle Mirror is symbolic and creative. It is not psychological therapy or medical sleep advice.",
    sisterLink: {
      siteName: "Routine & Haven",
      label: "Explore The Stillness Bedroom on Routine & Haven",
      url: "https://www.routineandhaven.com/looks/the-stillness-bedroom/",
    },
    emporiumLink: {
      label: "Browse Dream Journals in the Emporium",
      path: "/shop/dream-journaling",
    },
  },
  {
    slug: "art-of-thoughtful-gift-giving",
    title: "The Art of Thoughtful Gift Giving",
    kicker: "Gift Inspiration",
    description: "How to choose meaningful gifts—from classic books and journals to fragrance, jewelry, and homeware—based on how someone actually lives.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "The most memorable gifts rarely depend on price alone; they reflect attention to someone's everyday habits. A friend who loves quiet Sunday mornings might treasure a ceramic vase or a hardcover classic, while someone who enjoys evening outings may appreciate a signature fragrance or timeless earrings.",
      "If you are shopping for a milestone birthday or anniversary, pairing a practical lifestyle piece with a small symbolic detail—such as a zodiac-themed book or a handwritten note—adds personal warmth without feeling excessive.",
      "Our Gift Edit lets you filter voluntarily by recipient, occasion, budget, and personal interest across both Oracle Mirror Emporium and our sister Routine publications.",
    ],
    distinctionNote: "Oracle Mirror never uses private reading inputs to suggest gifts, and makes no claim that any gift influences luck or future events.",
    sisterLink: {
      siteName: "Routine & Glow",
      label: "Explore fragrance & beauty gifts on Routine & Glow",
      url: "https://www.routineandglow.com/shop/fragrance/",
    },
    emporiumLink: {
      label: "Open The Gift Edit",
      path: "/shop/gift-finder",
    },
  },
  {
    slug: "creating-a-welcoming-space-for-reflection",
    title: "Creating a Welcoming Space for Reflection",
    kicker: "Home & Atmosphere",
    description: "Borrowing principles from Japandi and Scandinavian design to make a quiet corner of your home feel calm and inviting.",
    readingTime: "4 min read",
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    paragraphs: [
      "You do not need a spare room to create a reflective corner. A single armchair near a window, a small side table for tea or a journal, and a warm-toned lamp can define a peaceful zone inside a busy apartment.",
      "Design traditions such as Japandi and Scandinavian minimalism emphasize natural timber, tactile linen, and uncluttered surfaces—choices that reduce visual noise and help a space feel restful.",
      "Whether you spend ten minutes reading, journaling, or simply enjoying quiet music, an intentional corner makes daily reflection feel effortless.",
    ],
    distinctionNote: "Interior styling ideas are presented for everyday living inspiration in collaboration with Routine & Haven.",
    sisterLink: {
      siteName: "Routine & Haven",
      label: "Explore The Japandi Sanctuary on Routine & Haven",
      url: "https://www.routineandhaven.com/looks/the-japandi-sanctuary/",
    },
    emporiumLink: {
      label: "Browse Meditation & Reflection Tools",
      path: "/shop/meditation-reflection",
    },
  },
];

function esc(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[char] || char));
}

function safeJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

function editorialLayout(options: {
  title: string;
  description: string;
  path: string;
  body: string;
  jsonLd?: unknown[];
}): string {
  const canonical = `${HOST}${options.path}`;
  const schemas = (options.jsonLd || [])
    .map((s) => `<script type="application/ld+json">${safeJson(s)}</script>`)
    .join("\n  ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(options.title)}</title>
  <meta name="description" content="${esc(options.description)}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <link rel="canonical" href="${esc(canonical)}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Oracle Mirror" />
  <meta property="og:title" content="${esc(options.title)}" />
  <meta property="og:description" content="${esc(options.description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${HOST}/og-image.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(options.title)}" />
  <meta name="twitter:description" content="${esc(options.description)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/styles.css" />
  <link rel="stylesheet" href="/shop.css" />
  <link rel="stylesheet" href="/routine.css" />
  ${schemas}
</head>
<body class="shop-body">
  <header>
    <div class="nav-container">
      <a href="/" class="nav-logo">
        <span class="logo-icon">&#128302;</span>
        <span class="logo-text">Oracle Mirror</span>
      </a>
      <nav class="nav-links" aria-label="Primary navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/tarot" class="nav-link">Tarot</a>
        <a href="/western-zodiac" class="nav-link">Horoscopes</a>
        <a href="/editorial" class="nav-link">Editorial</a>
        <a href="/shop" class="nav-link">Emporium</a>
        <a href="/shop/gift-finder" class="nav-link">The Gift Edit</a>
      </nav>
    </div>
  </header>
  <main class="shop-main">
    ${options.body}
  </main>
  <footer>
    <div class="footer-sister-publications" aria-label="Sister lifestyle publications">
      <span class="footer-sister-label">Routine Lifestyle Collection:</span>
      ${ROUTINE_PUBLICATIONS.map((p) => `<a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">${esc(p.name)}</a>`).join("")}
    </div>
    <div class="footer-links" aria-label="Legal and editorial links">
      <a href="/about">About Us</a>
      <a href="/editorial">Editorial Journal</a>
      <a href="/editorial-policy">Editorial Policy</a>
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/cookie-policy">Cookie Policy</a>
      <a href="/contact">Contact</a>
    </div>
    <p class="footer-disclaimer">${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Oracle Mirror offers readings and editorial features for entertainment and personal reflection only.</p>
    <p class="footer-copy">&copy; 2026 Oracle Mirror.</p>
  </footer>
  <script src="/routine.js" defer></script>
</body>
</html>`;
}

function breadcrumb(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Oracle Mirror", path: "/" }, ...items].map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: `${HOST}${item.path}`,
    })),
  };
}

export function isEditorialRoute(pathname: string): boolean {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return (
    path === "/editorial" ||
    path === "/about" ||
    path === "/editorial-policy" ||
    path.startsWith("/editorial/")
  );
}

export function handleEditorialRoute(pathname: string): Response {
  const path = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  if (path === "/about") {
    const body = `
      <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><span>About Us</span></nav>
      <section class="shop-hero shop-hero-compact">
        <p class="shop-kicker">About Oracle Mirror</p>
        <h1>Astrology, Divination &amp; Personal Reflection</h1>
        <p class="shop-hero-sub">Oracle Mirror is an independent interactive entertainment and symbolic reflection destination—free to explore, privacy-first, and thoughtfully paired with our sister Routine lifestyle publications.</p>
      </section>
      <section class="shop-section">
        <div class="shop-grounded-box">
          <h2>What Oracle Mirror Offers</h2>
          <p>Visitors can explore interactive tarot spreads, daily horoscopes, Chinese zodiac guidance, numerology, I Ching coin casting, Elder Futhark runes, palmistry, dream symbolism, and birth chart overviews. All readings are free and stored only in your browser.</p>
          <p>We clearly distinguish historical and cultural context from modern symbolic interpretation and scientific fact. Oracle Mirror does not present divination as a scientifically validated predictive method or offer medical, legal, financial, or psychological advice.</p>
        </div>
      </section>
      <section class="shop-section">
        <h2>Our Sister Lifestyle Publications</h2>
        <p class="routine-subcopy" style="margin:0 0 1rem; text-align:left;">Oracle Mirror collaborates editorially with three independent mainstream lifestyle publications:</p>
        <div class="shop-dept-grid">
          ${ROUTINE_PUBLICATIONS.map((p) => `<a class="shop-dept-card" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">
            <div>
              <p class="shop-kicker">${esc(p.tagline)}</p>
              <h3>${esc(p.name)}</h3>
              <p>${esc(p.description)}</p>
              <span class="shop-dept-count">${esc(p.ctaLabel)} &#8599;</span>
            </div>
          </a>`).join("")}
        </div>
      </section>
      <section class="shop-section">
        <h2>Guest Lifestyle Contributors: Dewi &amp; Eileen</h2>
        <div class="contributors-grid">
          ${CONTRIBUTOR_ASSETS.map((c) => `<article class="contributor-card">
            <img class="contributor-avatar" src="${esc(c.avatarPath)}" alt="${esc(c.name)}, guest lifestyle contributor" width="160" height="160" loading="lazy" decoding="async" />
            <div class="contributor-body">
              <span class="contributor-kicker">${esc(c.siteName)}</span>
              <h3>${esc(c.featureTitle)}</h3>
              <p class="contributor-bio">${esc(c.bio)}</p>
              <p class="contributor-disclosure">${esc(c.disclosure)}</p>
            </div>
          </article>`).join("")}
        </div>
      </section>
    `;
    return new Response(
      editorialLayout({
        title: "About Oracle Mirror — Mission, Mystics & Sister Publications",
        description: "Learn about Oracle Mirror's free interactive divination entertainment, privacy-first design, editorial standards, and sister Routine lifestyle publications.",
        path: "/about",
        body,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            name: "About Oracle Mirror",
            url: `${HOST}/about`,
            mainEntity: {
              "@type": "Organization",
              name: "Oracle Mirror",
              url: HOST,
              sameAs: ROUTINE_PUBLICATIONS.map((p) => p.url),
            },
          },
          breadcrumb([{ name: "About Us", path: "/about" }]),
        ],
      }),
      { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } },
    );
  }

  if (path === "/editorial-policy") {
    const body = `
      <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><span>Editorial Policy</span></nav>
      <section class="shop-hero shop-hero-compact">
        <p class="shop-kicker">Transparency &amp; Standards</p>
        <h1>Editorial Policy, Disclosures &amp; Corrections</h1>
        <p class="shop-hero-sub">Last updated: ${PUBLISHED_DATE}. How Oracle Mirror separates entertainment, historical context, privacy, and affiliate recommendations.</p>
      </section>
      <section class="shop-section">
        <div class="shop-grounded-box">
          <h2>1. Entertainment &amp; Symbolic Framing</h2>
          <p>All horoscopes, tarot readings, numerology profiles, dream interpretations, palmistry guides, rune casts, and I Ching consultations on Oracle Mirror are provided for entertainment, creative reflection, and cultural exploration. They are not scientifically validated predictive methods and must never be used as medical, legal, financial, or psychological advice.</p>
          <h2 style="margin-top:1.25rem;">2. Privacy &amp; Data Separation</h2>
          <p>Oracle Mirror never shares names, exact dates of birth, birth times, birth locations, dream descriptions, relationship details, personal questions, or private reading outcomes with sister publications, affiliate partners, or analytics systems. Contextual lifestyle recommendations use only generic experience categories.</p>
          <h2 style="margin-top:1.25rem;">3. Affiliate &amp; Advertising Disclosure</h2>
          <p>${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Product links in the Oracle Mirror Emporium link directly to verified Amazon listings using <code>rel="nofollow sponsored noopener noreferrer"</code>. Commercial recommendations are kept visually and functionally separate from reading results, and no purchase is ever claimed to influence a reading or future outcome.</p>
          <h2 style="margin-top:1.25rem;">4. Fictional Personas &amp; Guest Contributors</h2>
          <p>Oracle Mirror's mystics (such as Madame Fortuna, Astaria, Seraphina, and Morpheus Vey) are fictional storytelling personas. Guest lifestyle contributors Dewi and Eileen are fictional, AI-created editorial hosts shared with Routine &amp; Glow, Routine &amp; Runway, and Routine &amp; Haven; they provide everyday lifestyle inspiration only and do not represent licensed professionals.</p>
          <h2 style="margin-top:1.25rem;">5. Corrections Policy</h2>
          <p>If you spot a factual, historical, or broken-link error in any guide or product listing, please reach out via our <a href="/contact">Contact page</a>. Verified corrections are applied promptly and reflected in the page's updated date.</p>
        </div>
      </section>
    `;
    return new Response(
      editorialLayout({
        title: "Editorial Policy, Entertainment Disclaimer & Corrections | Oracle Mirror",
        description: "Oracle Mirror's editorial standards, entertainment disclaimer, privacy separation commitment, Amazon Associates disclosure, and corrections policy.",
        path: "/editorial-policy",
        body,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Editorial Policy & Disclosures",
            url: `${HOST}/editorial-policy`,
            dateModified: PUBLISHED_DATE,
          },
          breadcrumb([{ name: "Editorial Policy", path: "/editorial-policy" }]),
        ],
      }),
      { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } },
    );
  }

  if (path === "/editorial") {
    const todayEdit = getDailyEditForDate();
    const body = `
      <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><span>Editorial Journal</span></nav>
      <section class="shop-hero shop-hero-compact">
        <p class="shop-kicker">Oracle Mirror Journal</p>
        <h1>Reflections, Cultural History &amp; Everyday Inspiration</h1>
        <p class="shop-hero-sub">Original magazine-style essays bridging symbolic traditions, historical context, and practical everyday living.</p>
      </section>
      <section class="shop-section">
        <div class="daily-edit-box" style="margin-bottom:1.75rem;">
          <div class="daily-edit-theme">
            <span class="daily-edit-badge">Today's Daily Edit &middot; ${esc(todayEdit.title)}</span>
            <p>&ldquo;${esc(todayEdit.reflection)}&rdquo;</p>
          </div>
          <div class="daily-edit-recs">
            ${todayEdit.recommendations.map((rec) => `<a class="daily-edit-rec-card" href="${esc(rec.url)}" target="_blank" rel="noopener noreferrer">
              <span class="daily-edit-site">${esc(rec.siteName)}</span>
              <strong>${esc(rec.headline)}</strong>
              <span class="daily-edit-rec-desc">${esc(rec.description)}</span>
              <span class="daily-edit-rec-link">Explore &#8599;</span>
            </a>`).join("")}
          </div>
        </div>
        <div class="shop-dept-grid">
          ${EDITORIAL_ARTICLES.map((art) => `<a class="shop-dept-card" href="/editorial/${esc(art.slug)}">
            <div>
              <p class="shop-kicker">${esc(art.kicker)} &middot; ${esc(art.readingTime)}</p>
              <h3>${esc(art.title)}</h3>
              <p>${esc(art.description)}</p>
              <span class="shop-dept-count">Read essay &#8594;</span>
            </div>
          </a>`).join("")}
        </div>
      </section>
    `;
    return new Response(
      editorialLayout({
        title: "Editorial Journal — Cultural History & Everyday Reflection | Oracle Mirror",
        description: "Read original essays on tarot history, birthstones, lunar symbolism, dream journaling, and creating calm everyday reflection rituals.",
        path: "/editorial",
        body,
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Oracle Mirror Editorial Journal",
            url: `${HOST}/editorial`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: EDITORIAL_ARTICLES.map((art, idx) => ({
                "@type": "ListItem",
                position: idx + 1,
                name: art.title,
                url: `${HOST}/editorial/${art.slug}`,
              })),
            },
          },
          breadcrumb([{ name: "Editorial Journal", path: "/editorial" }]),
        ],
      }),
      { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } },
    );
  }

  const slug = path.replace(/^\/editorial\//, "");
  const article = EDITORIAL_ARTICLES.find((a) => a.slug === slug);
  if (!article) {
    return new Response("<!doctype html><html lang=\"en\"><head><meta name=\"robots\" content=\"noindex,follow\"><title>Article Not Found | Oracle Mirror</title></head><body><main><h1>Article not found</h1><p><a href=\"/editorial\">Browse the Editorial Journal</a></p></main></body></html>", {
      status: 404,
      headers: { "Content-Type": "text/html; charset=UTF-8" },
    });
  }

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/editorial">Editorial Journal</a><span>&#8250;</span><span>${esc(article.title)}</span></nav>
    <article class="shop-hero shop-hero-compact" style="text-align:left; max-width:820px; margin:0 auto;">
      <p class="shop-kicker">${esc(article.kicker)} &middot; ${esc(article.readingTime)} &middot; Updated ${esc(article.dateModified)}</p>
      <h1>${esc(article.title)}</h1>
      <p class="shop-hero-sub" style="margin-left:0;">${esc(article.description)}</p>
      <div class="shop-grounded-box" style="margin-top:1.5rem;">
        ${article.paragraphs.map((p) => `<p style="margin-bottom:1rem;">${esc(p)}</p>`).join("")}
        <p style="margin-top:1.25rem; font-size:0.9rem; opacity:0.88;"><strong>Editorial Note:</strong> ${esc(article.distinctionNote)}</p>
      </div>
      <div class="post-reading-inspiration" style="margin-top:1.5rem;">
        <p class="post-reading-kicker">Continue Exploring</p>
        <h3>Everyday Inspiration &amp; Related Reading</h3>
        <div class="post-reading-footer" style="border-top:none; padding-top:0.25rem;">
          <a href="${esc(article.sisterLink.url)}" target="_blank" rel="noopener noreferrer">${esc(article.sisterLink.label)} &#8599;</a>
          <a href="${esc(article.emporiumLink.path)}">${esc(article.emporiumLink.label)} &rarr;</a>
        </div>
      </div>
    </article>
  `;

  return new Response(
    editorialLayout({
      title: `${article.title} | Oracle Mirror Editorial`,
      description: article.description,
      path: `/editorial/${article.slug}`,
      body,
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: article.title,
          description: article.description,
          datePublished: article.datePublished,
          dateModified: article.dateModified,
          author: { "@type": "Organization", name: "Oracle Mirror Editorial" },
          publisher: { "@type": "Organization", name: "Oracle Mirror", url: HOST },
          mainEntityOfPage: `${HOST}/editorial/${article.slug}`,
        },
        breadcrumb([
          { name: "Editorial Journal", path: "/editorial" },
          { name: article.title, path: `/editorial/${article.slug}` },
        ]),
      ],
    }),
    { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } },
  );
}

export function augmentSitemapWithEditorial(xml: string): string {
  const routes = [
    "/editorial",
    "/about",
    "/editorial-policy",
    ...EDITORIAL_ARTICLES.map((a) => `/editorial/${a.slug}`),
  ];
  const newBlocks = routes
    .filter((r) => !xml.includes(`<loc>${HOST}${r}</loc>`))
    .map(
      (r) => `  <url>
    <loc>${HOST}${r}</loc>
    <lastmod>${PUBLISHED_DATE}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
    )
    .join("\n");
  if (!newBlocks) return xml;
  return xml.replace("</urlset>", `${newBlocks}\n</urlset>`);
}

export function augmentLlmsWithEditorial(text: string): string {
  if (text.includes("## Editorial Journal & Standards")) return text;
  return `${text.trimEnd()}

## Editorial Journal & Standards
- [About Oracle Mirror](${HOST}/about): Mission, privacy-first architecture, and sister Routine lifestyle publications.
- [Editorial Policy & Disclosures](${HOST}/editorial-policy): Entertainment framing, privacy separation, Amazon Associates disclosure, and corrections policy.
- [Editorial Journal](${HOST}/editorial): Original essays on reflection rituals, tarot history, birthstones, lunar symbolism, and dream journaling.
- [Editorial Manifest API](${HOST}/api/editorial-manifest.json): Public non-sensitive JSON manifest for The Daily Edit and Routine Lifestyle Collection.
`;
}
