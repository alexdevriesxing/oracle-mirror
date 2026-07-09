// Server-rendered dream symbol guide pages: the /dreams hub and one page per
// symbol in the curated corpus (src/dream-data.ts). These are standalone HTML
// documents (not the SPA shell) built for SEO/GAIO: short answer up top,
// framework-by-framework meanings, reflection questions, related symbols, FAQ,
// and a call-to-action into the interactive /dream-interpreter tool.
//
// All copy is derived from DREAM_SYMBOLS so visible content and JSON-LD always
// agree, and no interpretation is invented beyond the curated corpus.

import { DREAM_SYMBOLS } from "./dream-data.ts";
import type { DreamSymbol } from "./dream-data.ts";

const CANONICAL_HOST = "https://oraclemirror.com";

/** Public URL slug per corpus symbol (keyword-oriented where they differ). */
const SLUG_BY_SYMBOL: Record<string, string> = {
  falling: "falling",
  flying: "flying",
  teeth: "teeth-falling-out",
  chased: "being-chased",
  water: "water",
  death: "death",
  naked: "being-naked",
  snake: "snakes",
  baby: "baby",
  house: "house",
  exam: "exams",
  lost: "being-lost",
  fire: "fire",
  "flying-animals": "birds",
  money: "money",
};

const SYMBOL_BY_SLUG: Record<string, DreamSymbol> = Object.fromEntries(
  DREAM_SYMBOLS.map((symbol) => [SLUG_BY_SYMBOL[symbol.symbol] ?? symbol.symbol, symbol])
);

export function dreamSymbolSlugs(): string[] {
  return DREAM_SYMBOLS.map((symbol) => SLUG_BY_SYMBOL[symbol.symbol] ?? symbol.symbol);
}

export function findDreamSymbolBySlug(slug: string): DreamSymbol | undefined {
  return SYMBOL_BY_SLUG[slug];
}

/** Guide-page path for a corpus symbol id, e.g. "teeth" -> "/dreams/teeth-falling-out". */
export function dreamGuidePath(symbolId: string): string {
  return `/dreams/${SLUG_BY_SYMBOL[symbolId] ?? symbolId}`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** "Teeth Falling Out" -> "teeth falling out" for mid-sentence use (all titles are common nouns). */
function lowerTitle(symbol: DreamSymbol): string {
  return symbol.title.toLowerCase();
}

function symbolUrl(symbol: DreamSymbol): string {
  return `${CANONICAL_HOST}/dreams/${SLUG_BY_SYMBOL[symbol.symbol] ?? symbol.symbol}`;
}

/** Three neighbouring symbols (wrap-around) for the related block. */
function relatedSymbols(symbol: DreamSymbol): DreamSymbol[] {
  const index = DREAM_SYMBOLS.findIndex((s) => s.symbol === symbol.symbol);
  return [1, 2, 3].map((offset) => DREAM_SYMBOLS[(index + offset) % DREAM_SYMBOLS.length]);
}

const GUIDE_DISCLAIMER =
  "Dream interpretation is reflective and symbolic, offered for entertainment and personal insight. It is not medical, psychological, or professional advice. If dreams or sleep are causing you real distress, speak with a qualified professional.";

type Faq = ReadonlyArray<[question: string, answer: string]>;

function symbolFaq(symbol: DreamSymbol): Faq {
  const name = lowerTitle(symbol);
  return [
    [`What does dreaming about ${name} mean?`, symbol.meaning],
    [
      `Is dreaming about ${name} a bad omen?`,
      `Folk tradition reads it this way: ${symbol.frameworks.cultural} Modern dream psychology is gentler — a dream is a reflection of your inner weather, not a prediction of events.`,
    ],
    [
      `Why do I keep dreaming about ${name}?`,
      `Recurring dreams usually mean the feeling underneath — here, ${symbol.frameworks.emotional.charAt(0).toLowerCase()}${symbol.frameworks.emotional.slice(1).replace(/\.\s*$/, "")} — has not yet been acknowledged in waking life. Recurring dreams tend to fade once the underlying emotion or situation is addressed.`,
    ],
  ];
}

const HUB_FAQ: Faq = [
  [
    "What does my dream mean?",
    "Most dreams speak in symbols: the mind processing emotion, memory, and unresolved situations through images. Start with the strongest image in your dream — falling, water, teeth, being chased — and read its common meanings, then weigh them against what is happening in your waking life.",
  ],
  [
    "Are dream meanings the same for everyone?",
    "No. A symbol carries common themes — snakes often point to transformation or hidden worry — but your associations and the feeling the dream left behind matter more than any dictionary entry. The dreamer is always the final interpreter.",
  ],
  [
    "What are the most common dreams?",
    "Falling, flying, teeth falling out, being chased, water, death of a loved one, being naked in public, snakes, exams you haven't studied for, and being lost are among the most commonly reported dreams across cultures.",
  ],
  [
    "Can I get a personal interpretation of my dream?",
    "Yes — Oracle Mirror's free Dream Interpreter lets you describe your dream to Morpheus the Dream-Walker, who asks two clarifying questions and then reads its symbols for you. No account is required.",
  ],
];

function faqJsonLd(faq: Faq): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };
}

function breadcrumbJsonLd(items: ReadonlyArray<[name: string, url: string]>): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, url], index) => ({
      "@type": "ListItem",
      position: index + 1,
      name,
      item: url,
    })),
  };
}

function jsonLdScripts(nodes: object[]): string {
  return nodes.map((node) => `<script type="application/ld+json">${JSON.stringify(node)}</script>`).join("\n    ");
}

function faqHtml(faq: Faq): string {
  return faq
    .map(
      ([question, answer]) => `<div class="faq-item">
            <h3>${escapeHtml(question)}</h3>
            <p>${escapeHtml(answer)}</p>
          </div>`
    )
    .join("\n          ");
}

type GuidePage = {
  path: string;
  title: string;
  description: string;
  breadcrumbHtml: string;
  bodyHtml: string;
  jsonLd: object[];
};

function renderGuideDocument(page: GuidePage): string {
  const canonical = `${CANONICAL_HOST}${page.path}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="robots" content="index,follow,max-image-preview:large" />
    <meta name="theme-color" content="#05030d" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="Oracle Mirror" />
    <meta property="og:title" content="${title}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${CANONICAL_HOST}/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${CANONICAL_HOST}/og-image.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&display=swap"
      rel="stylesheet"
    />
    <link rel="stylesheet" href="/styles.css" />
    ${jsonLdScripts(page.jsonLd)}
  </head>
  <body class="guide-body">
    <header>
      <nav class="nav-container">
        <a href="/" class="nav-logo">
          <span class="logo-icon">&#9788;</span>
          <span class="logo-text">Oracle Mirror</span>
        </a>
        <div class="guide-nav">
          <a href="/dreams">Dream Symbols</a>
          <a href="/dream-interpreter">&#127769; Dream Interpreter</a>
          <a href="/">All Realms</a>
        </div>
      </nav>
    </header>
    <main class="guide-main">
      <nav class="guide-breadcrumbs" aria-label="Breadcrumb">${page.breadcrumbHtml}</nav>
      ${page.bodyHtml}
      <p class="realm-disclaimer">${escapeHtml(GUIDE_DISCLAIMER)}</p>
    </main>
    <footer>
      <div class="footer-links" aria-label="Legal links">
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/cookie-policy">Cookie Policy</a>
        <a href="/contact">Contact</a>
        <a href="/mystics">Meet the Mystics</a>
      </div>
      <p class="footer-copy">&copy; 2026 Oracle Mirror. This site is for entertainment purposes only.</p>
    </footer>
  </body>
</html>`;
}

const FRAMEWORK_LABELS: ReadonlyArray<[key: keyof DreamSymbol["frameworks"], label: string]> = [
  ["emotional", "Emotional context"],
  ["jungian", "Jungian view"],
  ["freudian", "Freudian view"],
  ["cultural", "Folklore & cultural meaning"],
];

export function renderDreamSymbolPage(slug: string): string | undefined {
  const symbol = SYMBOL_BY_SLUG[slug];
  if (!symbol) return undefined;

  const name = lowerTitle(symbol);
  const path = `/dreams/${slug}`;
  const canonical = `${CANONICAL_HOST}${path}`;
  const faq = symbolFaq(symbol);
  const related = relatedSymbols(symbol);

  const meaningCards = FRAMEWORK_LABELS.map(
    ([key, label]) => `<article class="overview-item">
            <h3>${escapeHtml(label)}</h3>
            <p>${escapeHtml(symbol.frameworks[key])}</p>
          </article>`
  ).join("\n          ");

  const questions = [...symbol.questionHints, "What happened in your waking life the day before this dream?"]
    .map((question) => `<li>${escapeHtml(question)}</li>`)
    .join("\n          ");

  const relatedCards = related
    .map(
      (rel) => `<a href="/dreams/${SLUG_BY_SYMBOL[rel.symbol] ?? rel.symbol}" class="related-realm-card">
              <strong>${escapeHtml(rel.title)}</strong>
              <span>${escapeHtml(rel.meaning)}</span>
            </a>`
    )
    .join("\n            ");

  const bodyHtml = `<article class="guide-article">
        <h1>What Does Dreaming About ${escapeHtml(symbol.title)} Mean?</h1>
        <section class="guide-short-answer" aria-label="Short answer">
          <p class="overview-kicker">Short answer</p>
          <p class="guide-answer-text">${escapeHtml(symbol.meaning)}</p>
        </section>

        <section aria-labelledby="meanings-title">
          <h2 id="meanings-title">Common Meanings of ${escapeHtml(symbol.title)} Dreams</h2>
          <p>Dream interpretation reads the same image through several lenses. Here is how the major traditions read dreams about ${escapeHtml(name)}:</p>
          <div class="overview-grid">
          ${meaningCards}
          </div>
        </section>

        <section aria-labelledby="questions-title">
          <h2 id="questions-title">Questions to Ask Yourself</h2>
          <p>The details of your dream — and the feeling it left behind — matter more than any dictionary meaning. Reflect on these:</p>
          <ul class="guide-question-list">
          ${questions}
          </ul>
        </section>

        <section class="guide-cta" aria-label="Get a personal interpretation">
          <h2>Get a Personal Interpretation of Your Dream</h2>
          <p>A symbol is only one thread. Tell Morpheus the Dream-Walker your whole dream and receive a free, personal interpretation — he asks two clarifying questions, then reads its meaning.</p>
          <a href="/dream-interpreter" class="btn-gold guide-cta-btn">Interpret My Dream Free</a>
        </section>

        <section class="realm-faq" aria-label="${escapeHtml(symbol.title)} dream FAQ">
          <h2>${escapeHtml(symbol.title)} Dream FAQ</h2>
          ${faqHtml(faq)}
        </section>

        <section aria-labelledby="related-title">
          <h2 id="related-title" class="guide-related-title">Related Dream Symbols</h2>
          <div class="related-realms guide-related">
            ${relatedCards}
          </div>
          <p class="guide-hub-link"><a href="/dreams">Browse all dream symbols and meanings &rarr;</a></p>
        </section>
      </article>`;

  return renderGuideDocument({
    path,
    title: `${symbol.title} Dream Meaning & Interpretation | Oracle Mirror`,
    description: `${symbol.meaning} Explore Jungian, Freudian, emotional, and folklore meanings of ${name} dreams, plus questions for reflection.`,
    breadcrumbHtml: `<a href="/">Oracle Mirror</a> <span aria-hidden="true">&rsaquo;</span> <a href="/dreams">Dream Symbols</a> <span aria-hidden="true">&rsaquo;</span> <span>${escapeHtml(symbol.title)}</span>`,
    bodyHtml,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${canonical}#article`,
        headline: `What Does Dreaming About ${symbol.title} Mean?`,
        description: symbol.meaning,
        url: canonical,
        inLanguage: "en",
        author: { "@type": "Organization", name: "Oracle Mirror", url: `${CANONICAL_HOST}/` },
        publisher: { "@type": "Organization", name: "Oracle Mirror", url: `${CANONICAL_HOST}/` },
        image: `${CANONICAL_HOST}/og-image.png`,
        mainEntityOfPage: canonical,
      },
      breadcrumbJsonLd([
        ["Oracle Mirror", `${CANONICAL_HOST}/`],
        ["Dream Symbols", `${CANONICAL_HOST}/dreams`],
        [symbol.title, canonical],
      ]),
      faqJsonLd(faq),
    ],
  });
}

export function renderDreamHubPage(): string {
  const path = "/dreams";
  const canonical = `${CANONICAL_HOST}${path}`;

  const symbolCards = DREAM_SYMBOLS.map(
    (symbol) => `<a href="/dreams/${SLUG_BY_SYMBOL[symbol.symbol] ?? symbol.symbol}" class="related-realm-card">
              <strong>${escapeHtml(symbol.title)}</strong>
              <span>${escapeHtml(symbol.meaning)}</span>
            </a>`
  ).join("\n            ");

  const bodyHtml = `<article class="guide-article">
        <h1>Dream Symbols and Meanings — Free Dream Dictionary</h1>
        <section class="guide-short-answer" aria-label="Short answer">
          <p class="overview-kicker">Short answer</p>
          <p class="guide-answer-text">Dreams speak in symbols: the mind processing emotion and memory through images. This free dream dictionary explains the most common dream symbols — falling, flying, teeth falling out, being chased, water, snakes, and more — through Jungian, Freudian, emotional, and folklore lenses.</p>
        </section>

        <section aria-labelledby="symbols-title">
          <h2 id="symbols-title">Common Dream Symbols</h2>
          <p>Choose the strongest image from your dream to read its common meanings, emotional context, and questions for reflection:</p>
          <div class="related-realms guide-related guide-symbol-grid">
            ${symbolCards}
          </div>
        </section>

        <section class="guide-cta" aria-label="Get a personal interpretation">
          <h2>What Does <em>Your</em> Dream Mean?</h2>
          <p>A dictionary reads symbols; the Dream-Walker reads dreams. Describe your dream to Morpheus and receive a free, personal interpretation grounded in classic dream symbolism.</p>
          <a href="/dream-interpreter" class="btn-gold guide-cta-btn">Interpret My Dream Free</a>
        </section>

        <section class="realm-faq" aria-label="Dream meanings FAQ">
          <h2>Dream Meanings FAQ</h2>
          ${faqHtml(HUB_FAQ)}
        </section>
      </article>`;

  return renderGuideDocument({
    path,
    title: "Dream Symbols and Meanings — Free Dream Dictionary | Oracle Mirror",
    description:
      "What does your dream mean? Free dream dictionary covering falling, flying, teeth falling out, being chased, snakes, water, and more — with Jungian, Freudian, and folklore meanings.",
    breadcrumbHtml: `<a href="/">Oracle Mirror</a> <span aria-hidden="true">&rsaquo;</span> <span>Dream Symbols</span>`,
    bodyHtml,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${canonical}#collection`,
        name: "Dream Symbols and Meanings",
        description: "A free dream dictionary of common dream symbols and their meanings.",
        url: canonical,
        inLanguage: "en",
        isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: `${CANONICAL_HOST}/` },
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Common Dream Symbols",
        itemListElement: DREAM_SYMBOLS.map((symbol, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: symbol.title,
          url: symbolUrl(symbol),
        })),
      },
      breadcrumbJsonLd([
        ["Oracle Mirror", `${CANONICAL_HOST}/`],
        ["Dream Symbols", canonical],
      ]),
      faqJsonLd(HUB_FAQ),
    ],
  });
}
