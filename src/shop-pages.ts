import {
  AMAZON_ASSOCIATES_DISCLOSURE,
  affiliateLinkAttributes,
  bountyLinkAttributes,
  DEFAULT_AFFILIATE_TAG,
} from "./affiliate.ts";
import {
  getCachedCatalogMap,
  getCatalogHealth,
  isAuthorizedAmazonImageUrl,
  type AmazonCreatorsEnv,
  type CatalogHealthSummary,
  type CatalogItemMetadata,
} from "./amazon-creators.ts";
import {
  BOUNTY_OFFERS,
  BUYING_GUIDES,
  GIFT_PERSONAS,
  REALM_SHOP_COLLECTIONS,
  SHOP_DEPARTMENTS,
  SHOP_PRODUCTS,
  departmentBySlug,
  getReadingLibraryProducts,
  getTarotDeckOfTheWeek,
  guideBySlug,
  productBySlug,
  productsByDepartment,
  productsForGiftPersona,
  productsForRealmShop,
  realmShopBySlug,
  relatedProductsFor,
  SOCIAL_CAMPAIGN_TEMPLATES,
  type BountyOffer,
  type BuyingGuide,
  type DepartmentSlug,
  type ShopDepartment,
  type ShopProduct,
} from "./shop-data.ts";

const HOST = "https://oraclemirror.com";
const LASTMOD = "2026-11-25";

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

function departmentName(slug: DepartmentSlug): string {
  return departmentBySlug(slug)?.name || slug;
}

function renderProductMedia(
  product: ShopProduct,
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): string {
  const meta = catalogMap.get(product.asin);
  const primary = meta?.primaryImage;
  if (primary && isAuthorizedAmazonImageUrl(primary.url)) {
    const widthAttr = primary.width ? ` width="${primary.width}"` : "";
    const heightAttr = primary.height ? ` height="${primary.height}"` : "";
    return `<div class="shop-photo-frame"><img class="shop-product-photo" src="${esc(primary.url)}" alt="${esc(product.title)} by ${esc(product.creator)}"${widthAttr}${heightAttr} loading="lazy" decoding="async"></div>`;
  }
  return `<div class="shop-text-only-media" role="img" aria-label="${esc(product.title)} — text-only listing">
    <span class="shop-text-only-badge">Text-Only Listing</span>
    <span class="shop-text-only-format">${esc(product.format)}</span>
    <span class="shop-text-only-note">Live Amazon image unavailable</span>
  </div>`;
}

function isProductAvailable(
  product: ShopProduct,
  catalogMap: Map<string, CatalogItemMetadata>,
): boolean {
  return catalogMap.get(product.asin)?.status !== "unavailable";
}

function affiliateCta(product: ShopProduct, label = "Check Current Price on Amazon"): string {
  const attrs = affiliateLinkAttributes(product.asin);
  return `<a class="shop-amazon-btn" href="${esc(attrs.href)}" target="${attrs.target}" rel="${attrs.rel}" data-affiliate-click data-shop-product="${esc(product.slug)}" data-shop-department="${esc(product.department)}" data-asin="${esc(product.asin)}" data-affiliate-tag="${DEFAULT_AFFILIATE_TAG}">${esc(label)} &#8599;</a>`;
}

function bountyCard(offer: BountyOffer): string {
  const attrs = bountyLinkAttributes(offer.amazonPath);
  return `<article class="shop-bounty-card">
    <p class="shop-kicker">${esc(offer.kicker)}</p>
    <h3>${esc(offer.programName)}</h3>
    <p class="shop-bounty-summary">${esc(offer.summary)}</p>
    <p class="shop-bounty-benefit">${esc(offer.customerBenefit)}</p>
    <p class="shop-bounty-eligibility"><small>${esc(offer.eligibilityNote)}</small></p>
    <a class="shop-amazon-btn" href="${esc(attrs.href)}" target="${attrs.target}" rel="${attrs.rel}" data-affiliate-click data-shop-product="${esc(offer.slug)}" data-shop-department="bounties" data-affiliate-tag="${DEFAULT_AFFILIATE_TAG}">${esc(offer.ctaLabel)} &#8599;</a>
  </article>`;
}

function productCard(
  product: ShopProduct,
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): string {
  return `<article class="shop-card" data-department="${esc(product.department)}" data-level="${esc(product.experienceLevel)}" data-format="${esc(product.format.toLowerCase())}" data-search="${esc(`${product.title} ${product.creator} ${product.summary}`.toLowerCase())}">
    <a class="shop-card-media" href="/shop/products/${esc(product.slug)}">${renderProductMedia(product, catalogMap)}</a>
    <div class="shop-card-body">
      <p class="shop-card-meta">${esc(departmentName(product.department))} &middot; ${esc(product.format)}</p>
      <h3><a href="/shop/products/${esc(product.slug)}">${esc(product.title)}</a></h3>
      <p class="shop-card-creator">By ${esc(product.creator)}</p>
      <p class="shop-card-summary">${esc(product.summary)}</p>
      <div class="shop-card-actions">
        ${affiliateCta(product)}
        <a class="shop-detail-link" href="/shop/products/${esc(product.slug)}">Details</a>
      </div>
    </div>
  </article>`;
}

function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Oracle Mirror", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${HOST}${item.path}`,
    })),
  };
}

function disclosureBanner(): string {
  return `<aside class="shop-disclosure" role="note" aria-label="Affiliate disclosure">
    <span class="shop-disclosure-mark" aria-hidden="true">&#10022;</span>
    <p><strong>Transparency Notice:</strong> ${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Product links open Amazon.com directly; live pricing and availability are confirmed on Amazon.</p>
  </aside>`;
}

function layout(options: {
  title: string;
  description: string;
  path: string;
  body: string;
  jsonLd?: unknown[];
  noindex?: boolean;
}): string {
  const canonical = `${HOST}${options.path}`;
  const robots = options.noindex ? "noindex,follow" : "index,follow,max-image-preview:large";
  const scripts = (options.jsonLd || [])
    .map((item) => `<script type="application/ld+json">${safeJson(item)}</script>`)
    .join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(options.title)}</title>
  <meta name="description" content="${esc(options.description)}">
  <meta name="robots" content="${robots}">
  <link rel="canonical" href="${esc(canonical)}">
  <link rel="alternate" hreflang="en" href="${esc(canonical)}">
  <link rel="alternate" hreflang="x-default" href="${esc(canonical)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <meta name="theme-color" content="#07050d">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Oracle Mirror">
  <meta property="og:title" content="${esc(options.title)}">
  <meta property="og:description" content="${esc(options.description)}">
  <meta property="og:url" content="${esc(canonical)}">
  <meta property="og:image" content="${HOST}/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/shop.css">
  ${scripts}
</head>
<body class="shop-body">
  <header class="shop-header">
    <nav class="shop-nav" aria-label="Oracle Mirror Emporium navigation">
      <a class="shop-brand" href="/">&#10022; Oracle Mirror</a>
      <div class="shop-nav-links">
        <a href="/shop">Emporium</a>
        <a href="/shop/reading-library">Reading Library</a>
        <a href="/shop/tarot-deck-of-the-week">Deck of the Week</a>
        <a href="/shop/realms">Shop Your Realm</a>
        <a href="/shop/gift-finder">Gift Finder</a>
        <a href="/shop/guides">Buying Guides</a>
        <a href="/">Readings</a>
      </div>
    </nav>
  </header>
  <main class="shop-main">${options.body}</main>
  <footer class="shop-footer">
    <div class="shop-footer-links">
      <a href="/">Oracle Mirror</a>
      <a href="/shop">Emporium</a>
      <a href="/shop/realms">Shop Your Realm</a>
      <a href="/shop/guides">Buying Guides</a>
      <a href="/privacy-policy">Privacy Policy</a>
      <a href="/cookie-policy">Cookie Policy</a>
      <a href="/contact">Contact</a>
    </div>
    <p class="shop-footer-disclosure">${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Oracle Mirror readings remain completely free and never require a purchase.</p>
  </footer>
  <script type="module" src="/shop.js"></script>
</body>
</html>`;
}

function renderShopHome(catalogMap: Map<string, CatalogItemMetadata> = new Map()): Response {
  const title = "The Oracle Mirror Emporium — Tarot, Celestial Treasures & Ritual Essentials";
  const description = "Curated tarot decks, astrology books, dream journals, I Ching editions, Elder Futhark rune sets, and reflective gifts selected to complement Oracle Mirror.";
  const weeklyDeck = getTarotDeckOfTheWeek();
  const visibleCatalog = SHOP_PRODUCTS.filter((p) => isProductAvailable(p, catalogMap));
  const deptCards = SHOP_DEPARTMENTS.map((dept) => {
    const count = productsByDepartment(dept.slug).length;
    return `<a class="shop-dept-card" href="/shop/departments/${esc(dept.slug)}">
      <span class="shop-dept-glyph" aria-hidden="true">${esc(dept.glyph)}</span>
      <div>
        <p class="shop-kicker">${esc(dept.kicker)}</p>
        <h3>${esc(dept.name)}</h3>
        <p>${esc(dept.description)}</p>
        <span class="shop-dept-count">${count} curated items &#8594;</span>
      </div>
    </a>`;
  }).join("");

  const realmShelf = REALM_SHOP_COLLECTIONS.map((realm) => `<a class="shop-realm-pill" href="/shop/realms/${esc(realm.slug)}">
    <span aria-hidden="true">${esc(realm.glyph)}</span>
    <span><strong>${esc(realm.realmTitle)}</strong><small>${esc(realm.tagline)}</small></span>
  </a>`).join("");

  const deptOptions = SHOP_DEPARTMENTS.map((d) => `<option value="${esc(d.slug)}">${esc(d.name)}</option>`).join("");

  const body = `
    <section class="shop-hero">
      <p class="shop-kicker">The Oracle Mirror Emporium</p>
      <h1>Tarot, Celestial Treasures &amp; Ritual Essentials</h1>
      <p class="shop-hero-sub">An editorial collector's cabinet of ${SHOP_PRODUCTS.length} verified decks, classic translations, dream notebooks, and quiet study instruments—selected to accompany your reflections without ever gatekeeping free readings.</p>
      <div class="shop-hero-actions">
        <a class="btn-gold" href="#emporium-catalog">Browse the Cabinet</a>
        <a class="btn-ghost" href="/shop/reading-library">Oracle Reading Library</a>
        <a class="btn-ghost" href="/shop/tarot-deck-of-the-week">Tarot Deck of the Week</a>
        <a class="btn-ghost" href="/shop/gift-finder">Find Your Mystical Gift</a>
      </div>
    </section>

    ${disclosureBanner()}

    <section class="shop-section shop-spotlight" aria-labelledby="weekly-deck-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Weekly Editorial Spotlight</p>
          <h2 id="weekly-deck-heading">Tarot Deck of the Week: ${esc(weeklyDeck.title)}</h2>
        </div>
        <a class="shop-text-link" href="/shop/tarot-deck-of-the-week">Read weekly spotlight &#8594;</a>
      </div>
      <div class="shop-spotlight-grid">
        ${productCard(weeklyDeck, catalogMap)}
        <div class="shop-grounded-box">
          <h3>Why We Highlight One Deck Each Week</h3>
          <p>${esc(weeklyDeck.whyItFits)}</p>
          <p>${esc(weeklyDeck.groundedNote)}</p>
          <p><a class="shop-text-link" href="/shop/guides/how-to-choose-your-first-tarot-deck">Read: How to Choose Your First Tarot Deck &#8594;</a></p>
        </div>
      </div>
    </section>

    <section class="shop-section" aria-labelledby="shop-realms-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Signature Experience</p>
          <h2 id="shop-realms-heading">Shop Your Realm</h2>
        </div>
        <a class="shop-text-link" href="/shop/realms">Explore all 7 realms &#8594;</a>
      </div>
      <div class="shop-realm-strip">${realmShelf}</div>
    </section>

    <section class="shop-section" aria-labelledby="shop-depts-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Eight Curated Cabinets</p>
          <h2 id="shop-depts-heading">Departments</h2>
        </div>
      </div>
      <div class="shop-dept-grid">${deptCards}</div>
    </section>

    <section class="shop-section" aria-labelledby="shop-sister-collections-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Routine Lifestyle Collection &middot; Sister Publications</p>
          <h2 id="shop-sister-collections-heading">Complementary Lifestyle Collections</h2>
        </div>
        <a class="shop-text-link" href="/shop/gift-finder">Open The Gift Edit &#8594;</a>
      </div>
      <div class="shop-grounded-box" style="margin-bottom: 1rem;">
        <p>The cabinets above are Oracle Mirror Emporium's verified Amazon.com affiliate catalogue. For mainstream beauty, personal style, and home living inspiration, explore our independent sister publications:</p>
      </div>
      <div class="shop-dept-grid">
        <a class="shop-dept-card" href="https://www.routineandglow.com/shop/fragrance/" target="_blank" rel="noopener noreferrer">
          <span class="shop-dept-glyph" aria-hidden="true">&#10024;</span>
          <div>
            <p class="shop-kicker">Routine &amp; Glow</p>
            <h3>Beauty &amp; Fragrances</h3>
            <p>Skincare rituals, fragrance families, and everyday personal care edits.</p>
            <span class="shop-dept-count">Visit Routine &amp; Glow &#8599;</span>
          </div>
        </a>
        <a class="shop-dept-card" href="https://www.routineandrunway.com/shop/jewelry/" target="_blank" rel="noopener noreferrer">
          <span class="shop-dept-glyph" aria-hidden="true">&#128141;</span>
          <div>
            <p class="shop-kicker">Routine &amp; Runway</p>
            <h3>Jewelry &amp; Accessories</h3>
            <p>Timeless rings, pendants, handbags, and personal style guides.</p>
            <span class="shop-dept-count">Visit Routine &amp; Runway &#8599;</span>
          </div>
        </a>
        <a class="shop-dept-card" href="https://www.routineandhaven.com/shop/lighting/" target="_blank" rel="noopener noreferrer">
          <span class="shop-dept-glyph" aria-hidden="true">&#127969;</span>
          <div>
            <p class="shop-kicker">Routine &amp; Haven</p>
            <h3>Home D&eacute;cor &amp; Lighting</h3>
            <p>Warm lamps, ceramics, candles, and decorative accents for calm spaces.</p>
            <span class="shop-dept-count">Visit Routine &amp; Haven &#8599;</span>
          </div>
        </a>
      </div>
    </section>

    <section class="shop-section" id="emporium-catalog" aria-labelledby="shop-catalog-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Verified Amazon.com Editions</p>
          <h2 id="shop-catalog-heading">Complete Collector's Catalog (${visibleCatalog.length})</h2>
        </div>
      </div>
      <div class="shop-filters" role="region" aria-label="Filter catalog">
        <label class="shop-filter-field">
          <span>Search title or author</span>
          <input type="search" id="shop-search-input" placeholder="e.g. Rider-Waite, Jung, I Ching...">
        </label>
        <label class="shop-filter-field">
          <span>Department</span>
          <select id="shop-dept-filter">
            <option value="all">All 8 Departments</option>
            ${deptOptions}
          </select>
        </label>
        <label class="shop-filter-field">
          <span>Experience</span>
          <select id="shop-level-filter">
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="collector">Collector</option>
          </select>
        </label>
      </div>
      <p class="shop-results-count" id="shop-results-count" aria-live="polite">Showing ${visibleCatalog.length} verified items</p>
      <div class="shop-grid" id="shop-catalog-grid">
        ${visibleCatalog.map((p) => productCard(p, catalogMap)).join("")}
      </div>
    </section>

    <section class="shop-section" aria-labelledby="shop-bounties-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Reading &amp; Listening Companions</p>
          <h2 id="shop-bounties-heading">Audible, Kindle Unlimited &amp; Prime Offers</h2>
        </div>
        <a class="shop-text-link" href="/shop/reading-library">Visit Reading Library &#8594;</a>
      </div>
      <div class="shop-bounty-grid">${BOUNTY_OFFERS.map(bountyCard).join("")}</div>
    </section>

    <section class="shop-section" aria-labelledby="shop-guides-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Grounded Reference</p>
          <h2 id="shop-guides-heading">Editorial Buying Guides</h2>
        </div>
        <a class="shop-text-link" href="/shop/guides">All ${BUYING_GUIDES.length} guides &#8594;</a>
      </div>
      <div class="shop-guides-grid">
        ${BUYING_GUIDES.slice(0, 4).map((g) => `<a class="shop-guide-card" href="/shop/guides/${esc(g.slug)}">
          <p class="shop-kicker">${esc(g.kicker)}</p>
          <h3>${esc(g.title)}</h3>
          <p>${esc(g.description)}</p>
          <span class="shop-guide-meta">${esc(g.readingTime)} &#8594;</span>
        </a>`).join("")}
      </div>
    </section>
  `;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Oracle Mirror",
      url: HOST,
      logo: `${HOST}/og-image.png`,
    },
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "The Oracle Mirror Emporium",
      description,
      url: `${HOST}/shop`,
      isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST },
    },
    breadcrumbSchema([{ name: "Emporium", path: "/shop" }]),
  ];

  return new Response(layout({ title, description, path: "/shop", body, jsonLd }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=1800" },
  });
}

function renderDepartmentPage(
  dept: ShopDepartment,
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): Response {
  const items = productsByDepartment(dept.slug).filter((p) => isProductAvailable(p, catalogMap));
  const path = `/shop/departments/${dept.slug}`;
  const title = `${dept.name} — The Oracle Mirror Emporium`;
  const description = `${dept.description} Browse ${items.length} curated editions with direct Amazon.com links.`;

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><span>${esc(dept.name)}</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">${esc(dept.kicker)}</p>
      <h1>${esc(dept.glyph)} ${esc(dept.name)}</h1>
      <p class="shop-hero-sub">${esc(dept.editorialIntro)}</p>
    </section>
    ${disclosureBanner()}
    <div class="shop-filters" role="region" aria-label="Filter department items">
      <label class="shop-filter-field">
        <span>Search in ${esc(dept.name)}</span>
        <input type="search" id="shop-search-input" placeholder="Filter by title or creator...">
      </label>
      <label class="shop-filter-field">
        <span>Experience</span>
        <select id="shop-level-filter">
          <option value="all">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="collector">Collector</option>
        </select>
      </label>
    </div>
    <p class="shop-results-count" id="shop-results-count" aria-live="polite">Showing ${items.length} verified items</p>
    <div class="shop-grid" id="shop-catalog-grid">${items.map((p) => productCard(p, catalogMap)).join("")}</div>
  `;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: dept.name,
      description,
      url: `${HOST}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: `${HOST}/shop/products/${item.slug}`,
      })),
    },
    breadcrumbSchema([{ name: "Emporium", path: "/shop" }, { name: dept.name, path }]),
  ];

  return new Response(layout({ title, description, path, body, jsonLd }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=1800" },
  });
}

function renderProductPage(
  product: ShopProduct,
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): Response {
  const dept = departmentBySlug(product.department)!;
  const related = relatedProductsFor(product, 4).filter((p) => isProductAvailable(p, catalogMap));
  const path = `/shop/products/${product.slug}`;
  const title = `${product.title} — ${dept.name} | Oracle Mirror Emporium`;
  const description = `${product.title} by ${product.creator}. ${product.summary}`;
  const meta = catalogMap.get(product.asin);
  const variantGallery = (meta?.variantImages || [])
    .filter((v) => isAuthorizedAmazonImageUrl(v.url))
    .map((v, idx) => `<img class="shop-variant-thumb" src="${esc(v.url)}" alt="${esc(product.title)} alternate view ${idx + 1}"${v.width ? ` width="${v.width}"` : ""}${v.height ? ` height="${v.height}"` : ""} loading="lazy" decoding="async">`)
    .join("");

  const realmLinks = product.realms
    .map((slug) => realmShopBySlug(slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r))
    .map((r) => `<a class="shop-tag-link" href="/shop/realms/${esc(r.slug)}">${esc(r.glyph)} ${esc(r.realmTitle)}</a>`)
    .join("");

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb">
      <a href="/">Oracle Mirror</a><span>&#8250;</span>
      <a href="/shop">Emporium</a><span>&#8250;</span>
      <a href="/shop/departments/${esc(dept.slug)}">${esc(dept.name)}</a><span>&#8250;</span>
      <span>${esc(product.title)}</span>
    </nav>
    <article class="shop-product-detail" data-track-product-view="${esc(product.slug)}" data-shop-department="${esc(product.department)}">
      <div class="shop-product-hero">
        <div class="shop-product-art">
          ${renderProductMedia(product, catalogMap)}
          ${variantGallery ? `<div class="shop-variant-strip" aria-label="Additional Amazon product photos">${variantGallery}</div>` : ""}
        </div>
        <div class="shop-product-info">
          <p class="shop-kicker">${esc(dept.name)} &middot; ${esc(product.format)} &middot; ${esc(product.experienceLevel)}</p>
          <h1>${esc(product.title)}</h1>
          <p class="shop-product-creator">By ${esc(product.creator)}</p>
          <p class="shop-product-summary">${esc(product.summary)}</p>
          <dl class="shop-product-specs">
            <div><dt>Verified ASIN</dt><dd><code>${esc(product.asin)}</code></dd></div>
            <div><dt>Format</dt><dd>${esc(product.format)}</dd></div>
            <div><dt>Level</dt><dd>${esc(product.experienceLevel)}</dd></div>
          </dl>
          <div class="shop-product-cta-row">
            ${affiliateCta(product, "Check Current Price on Amazon")}
            <a class="btn-ghost" href="/shop/departments/${esc(dept.slug)}">Back to ${esc(dept.name)}</a>
          </div>
          <p class="shop-inline-disclosure">${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Pricing and stock are verified live on Amazon.com.</p>
        </div>
      </div>

      <div class="shop-product-notes">
        <section>
          <h2>Why it fits Oracle Mirror</h2>
          <p>${esc(product.whyItFits)}</p>
        </section>
        <section class="shop-grounded-box">
          <h2>Grounded perspective</h2>
          <p>${esc(product.groundedNote)}</p>
        </section>
      </div>

      ${realmLinks ? `<section class="shop-product-realms"><h2>Connected Realms</h2><div class="shop-tag-row">${realmLinks}</div></section>` : ""}
    </article>

    <section class="shop-section" aria-labelledby="related-products-heading">
      <h2 id="related-products-heading">Related Cabinet Selections</h2>
      <div class="shop-grid">${related.map((p) => productCard(p, catalogMap)).join("")}</div>
    </section>
  `;

  const schemaEntity = product.schemaType === "Book"
    ? {
      "@context": "https://schema.org",
      "@type": "Book",
      name: product.title,
      author: { "@type": "Person", name: product.creator },
      description: product.summary,
      url: `${HOST}${path}`,
      identifier: product.asin,
    }
    : {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      brand: { "@type": "Brand", name: product.creator },
      description: product.summary,
      sku: product.asin,
      url: `${HOST}${path}`,
    };

  const jsonLd = [
    schemaEntity,
    breadcrumbSchema([
      { name: "Emporium", path: "/shop" },
      { name: dept.name, path: `/shop/departments/${dept.slug}` },
      { name: product.title, path },
    ]),
  ];

  return new Response(layout({ title, description, path, body, jsonLd }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" },
  });
}

function renderRealmsIndex(): Response {
  const title = "Shop Your Realm — Curated Collections by Oracle Persona | Oracle Mirror";
  const description = "Explore physical books, decks, journals, and study instruments paired with Seraphina, Madame Fortuna, Astaria, Master Longwei, Morpheus Vey, Pythius, and the Rune Chamber.";

  const cards = REALM_SHOP_COLLECTIONS.map((realm) => {
    const count = productsForRealmShop(realm.slug).length;
    return `<article class="shop-realm-card">
      <span class="shop-dept-glyph" aria-hidden="true">${esc(realm.glyph)}</span>
      <p class="shop-kicker">${esc(realm.personaName)}</p>
      <h2><a href="/shop/realms/${esc(realm.slug)}">${esc(realm.realmTitle)}</a></h2>
      <p>${esc(realm.description)}</p>
      <div class="shop-realm-card-foot">
        <a class="btn-gold" href="/shop/realms/${esc(realm.slug)}">Browse ${count} Items</a>
        <a class="btn-ghost" href="${esc(realm.realmPath)}">Visit Free Realm</a>
      </div>
    </article>`;
  }).join("");

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><span>Shop Your Realm</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">Signature Experience</p>
      <h1>Shop Your Realm</h1>
      <p class="shop-hero-sub">Each Oracle Mirror realm has a matching cabinet of books, decks, and tactile instruments. Recommendations are based strictly on the public topic of each realm—never on your private questions, birth dates, or journal entries.</p>
    </section>
    ${disclosureBanner()}
    <div class="shop-realm-grid">${cards}</div>
  `;

  return new Response(
    layout({
      title,
      description,
      path: "/shop/realms",
      body,
      jsonLd: [breadcrumbSchema([{ name: "Emporium", path: "/shop" }, { name: "Shop Your Realm", path: "/shop/realms" }])],
    }),
    { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=1800" } },
  );
}

function renderRealmCollectionPage(
  slug: string,
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): Response | null {
  const realm = realmShopBySlug(slug);
  if (!realm) return null;
  const items = productsForRealmShop(realm.slug).filter((p) => isProductAvailable(p, catalogMap));
  const path = `/shop/realms/${realm.slug}`;
  const title = `${realm.realmTitle} — Shop Your Realm | Oracle Mirror Emporium`;
  const description = realm.description;

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><a href="/shop/realms">Shop Your Realm</a><span>&#8250;</span><span>${esc(realm.realmTitle)}</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">${esc(realm.personaName)} &middot; Curated Realm Shelf</p>
      <h1>${esc(realm.glyph)} ${esc(realm.realmTitle)}</h1>
      <p class="shop-hero-sub">${esc(realm.description)}</p>
      <p class="shop-curatorial-note">${esc(realm.curatorialNote)}</p>
      <div class="shop-hero-actions">
        <a class="btn-ghost" href="${esc(realm.realmPath)}">Open Free ${esc(realm.personaName)} Experience</a>
      </div>
    </section>
    ${disclosureBanner()}
    <div class="shop-grid">${items.map((p) => productCard(p, catalogMap)).join("")}</div>
  `;

  return new Response(
    layout({
      title,
      description,
      path,
      body,
      jsonLd: [
        breadcrumbSchema([
          { name: "Emporium", path: "/shop" },
          { name: "Shop Your Realm", path: "/shop/realms" },
          { name: realm.realmTitle, path },
        ]),
      ],
    }),
    { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=1800" } },
  );
}

function renderGiftFinderPage(catalogMap: Map<string, CatalogItemMetadata> = new Map()): Response {
  const title = "The Gift Edit — Curated Gift Discovery | Oracle Mirror";
  const description = "Voluntary, privacy-respecting gift discovery across Oracle Mirror Emporium and the Routine Lifestyle Collection. Filter by recipient, occasion, budget, personal interest, and optional zodiac sign.";

  const personaButtons = GIFT_PERSONAS.map(
    (p, idx) => `<button type="button" class="gift-persona-btn${idx === 0 ? " active" : ""}" data-gift-persona="${esc(p.slug)}" aria-pressed="${idx === 0 ? "true" : "false"}">
      <span aria-hidden="true">${esc(p.glyph)}</span>
      <strong>${esc(p.title)}</strong>
      <small>${esc(p.description)}</small>
    </button>`,
  ).join("");

  const availableProducts = SHOP_PRODUCTS.filter((p) => isProductAvailable(p, catalogMap));
  const preloaded = safeJson(
    availableProducts.map((p) => ({
      slug: p.slug,
      asin: p.asin,
      title: p.title,
      creator: p.creator,
      department: p.department,
      departmentName: departmentName(p.department),
      format: p.format,
      experienceLevel: p.experienceLevel,
      giftPersonas: p.giftPersonas,
      summary: p.summary,
      amazonUrl: affiliateLinkAttributes(p.asin).href,
      imageUrl: catalogMap.get(p.asin)?.primaryImage?.url || null,
    })),
  );

  const initialItems = productsForGiftPersona("tarot-beginner")
    .filter((p) => isProductAvailable(p, catalogMap))
    .slice(0, 6);

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><span>The Gift Edit</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">The Gift Edit &middot; Voluntary &amp; Privacy-Safe</p>
      <h1>The Gift Edit</h1>
      <p class="shop-hero-sub">Choose a recipient, occasion, budget, and personal interest to discover thoughtful gifts from Oracle Mirror Emporium and our sister Routine publications. No private reading data is used and no gift claims to alter fortune.</p>
    </section>
    ${disclosureBanner()}
    <section class="gift-finder-panel" aria-labelledby="gift-finder-step1">
      <h2 id="gift-finder-step1">1. Choose a Gift Edit Interest or Mystical Profile</h2>
      <div class="gift-controls-row" style="margin-bottom: 1.25rem;">
        <label class="shop-filter-field">
          <span>Recipient</span>
          <select id="gift-recipient-select">
            <option value="partner">Partner</option>
            <option value="friend" selected>Friend</option>
            <option value="family">Family Member</option>
            <option value="colleague">Colleague</option>
            <option value="self">Personal Treat</option>
          </select>
        </label>
        <label class="shop-filter-field">
          <span>Occasion</span>
          <select id="gift-occasion-select">
            <option value="birthday">Birthday</option>
            <option value="anniversary">Anniversary</option>
            <option value="holiday">Holiday</option>
            <option value="housewarming">Housewarming</option>
            <option value="thank-you">Thank You</option>
            <option value="just-because">Just Because</option>
          </select>
        </label>
        <label class="shop-filter-field">
          <span>Budget</span>
          <select id="gift-budget-select">
            <option value="all">Any Budget</option>
            <option value="under-25">Under $25</option>
            <option value="25-50">$25 &ndash; $50</option>
            <option value="50-100">$50 &ndash; $100</option>
            <option value="100-plus">Luxury ($100+)</option>
          </select>
        </label>
        <label class="shop-filter-field">
          <span>Personal Interest</span>
          <select id="gift-interest-select">
            <option value="astrology">Astrology-Related Gifts (Emporium)</option>
            <option value="books">Books &amp; Classics (Emporium)</option>
            <option value="journaling">Journaling &amp; Reflection (Emporium)</option>
            <option value="symbolic-jewelry">Symbolic Jewelry (Emporium &amp; Runway)</option>
            <option value="beauty">Beauty &amp; Fragrance (Routine &amp; Glow)</option>
            <option value="fashion">Fashion &amp; Accessories (Routine &amp; Runway)</option>
            <option value="home-decor">Home D&eacute;cor &amp; Lighting (Routine &amp; Haven)</option>
          </select>
        </label>
        <label class="shop-filter-field">
          <span>Birth Month / Zodiac (Optional)</span>
          <select id="gift-zodiac-select">
            <option value="none">No preference</option>
            <option value="aries">March/April &middot; Aries</option>
            <option value="taurus">April/May &middot; Taurus</option>
            <option value="gemini">May/June &middot; Gemini</option>
            <option value="cancer">June/July &middot; Cancer</option>
            <option value="leo">July/August &middot; Leo</option>
            <option value="virgo">August/September &middot; Virgo</option>
            <option value="libra">September/October &middot; Libra</option>
            <option value="scorpio">October/November &middot; Scorpio</option>
            <option value="sagittarius">November/December &middot; Sagittarius</option>
            <option value="capricorn">December/January &middot; Capricorn</option>
            <option value="aquarius">January/February &middot; Aquarius</option>
            <option value="pisces">February/March &middot; Pisces</option>
          </select>
        </label>
      </div>
      <div class="gift-persona-grid" role="group" aria-label="Gift interest profiles">
        ${personaButtons}
      </div>
      <div class="gift-controls-row">
        <label class="shop-filter-field">
          <span>Experience Level</span>
          <select id="gift-level-select">
            <option value="all">Any Experience Level</option>
            <option value="beginner">Beginner-Friendly</option>
            <option value="intermediate">Intermediate</option>
            <option value="collector">Collector's Edition</option>
          </select>
        </label>
        <label class="shop-filter-field">
          <span>Preferred Format</span>
          <select id="gift-format-select">
            <option value="all">All Formats</option>
            <option value="Deck & Guidebook">Decks &amp; Guidebooks</option>
            <option value="Paperback">Paperback Books</option>
            <option value="Hardcover">Hardcover Books</option>
            <option value="Journal">Journals</option>
            <option value="Boxed Kit">Boxed Kits</option>
            <option value="Physical Instrument">Instruments &amp; Cushions</option>
          </select>
        </label>
      </div>
      <div id="gift-sister-recommendations" class="shop-grounded-box" hidden style="margin-bottom: 1.25rem;"></div>
      <p class="shop-results-count" id="gift-results-count" aria-live="polite">Showing ${initialItems.length} curated matches for Tarot Beginner</p>
      <div class="shop-grid" id="gift-results-grid">
        ${initialItems.map((p) => productCard(p, catalogMap)).join("")}
      </div>
      <script id="gift-catalog-data" type="application/json">${preloaded}</script>
    </section>
  `;

  return new Response(
    layout({
      title,
      description,
      path: "/shop/gift-finder",
      body,
      jsonLd: [breadcrumbSchema([{ name: "Emporium", path: "/shop" }, { name: "The Gift Edit", path: "/shop/gift-finder" }])],
    }),
    { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=1800" } },
  );
}

function renderGuidesIndex(): Response {
  const title = "Editorial Buying Guides — Tarot, I Ching, Runes, Dreams & Crystals | Oracle Mirror";
  const description = `${BUYING_GUIDES.length} grounded buying guides explaining how to choose tarot decks, Rider-Waite-Smith symbolism, oracle cards, numerology, I Ching translations, rune sets, dream journals, and astrology books.`;

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><span>Buying Guides</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">Editorial Reference</p>
      <h1>Emporium Buying Guides</h1>
      <p class="shop-hero-sub">Practical, historically grounded guides to help you choose physical decks, translations, notebooks, and study tools without hype or overstated claims.</p>
    </section>
    <div class="shop-guides-grid">
      ${BUYING_GUIDES.map((g) => `<a class="shop-guide-card" href="/shop/guides/${esc(g.slug)}">
        <p class="shop-kicker">${esc(g.kicker)}</p>
        <h2>${esc(g.title)}</h2>
        <p>${esc(g.description)}</p>
        <span class="shop-guide-meta">${esc(g.readingTime)} &#8594;</span>
      </a>`).join("")}
    </div>
  `;

  return new Response(
    layout({
      title,
      description,
      path: "/shop/guides",
      body,
      jsonLd: [breadcrumbSchema([{ name: "Emporium", path: "/shop" }, { name: "Buying Guides", path: "/shop/guides" }])],
    }),
    { headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" } },
  );
}

function renderGuidePage(
  guide: BuyingGuide,
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): Response {
  const path = `/shop/guides/${guide.slug}`;
  const title = `${guide.title} | Oracle Mirror Emporium`;
  const recs = guide.recommendedSlugs
    .map((slug) => productBySlug(slug))
    .filter((p): p is ShopProduct => Boolean(p))
    .filter((p) => isProductAvailable(p, catalogMap));

  const answerFirstHtml = guide.answerFirst
    ? `<section class="shop-answer-first" aria-label="Quick summary"><h2>Quick Summary</h2><p>${esc(guide.answerFirst)}</p></section>`
    : "";

  const historyHtml = guide.historicalContext
    ? `<section class="shop-history-box"><h2>Historical &amp; Cultural Context</h2><p>${esc(guide.historicalContext)}</p></section>`
    : "";

  const tableHtml = guide.comparisonTable
    ? `<section class="shop-table-wrap"><h2>At-a-Glance Comparison</h2><table class="shop-comparison-table"><thead><tr>${guide.comparisonTable.headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${guide.comparisonTable.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></section>`
    : "";

  const faqHtml = guide.faq?.length
    ? `<section class="shop-faq-section"><h2>Frequently Asked Questions</h2><dl class="shop-faq-list">${guide.faq.map((f) => `<div><dt>${esc(f.question)}</dt><dd>${esc(f.answer)}</dd></div>`).join("")}</dl></section>`
    : "";

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><a href="/shop/guides">Buying Guides</a><span>&#8250;</span><span>${esc(guide.title)}</span></nav>
    <article class="shop-guide-article">
      <header>
        <p class="shop-kicker">${esc(guide.kicker)} &middot; ${esc(guide.readingTime)}</p>
        <h1>${esc(guide.title)}</h1>
        <p class="shop-hero-sub">${esc(guide.description)}</p>
      </header>
      ${answerFirstHtml}
      ${historyHtml}
      ${tableHtml}
      ${guide.sections.map((s) => `<section><h2>${esc(s.heading)}</h2><p>${esc(s.body)}</p></section>`).join("")}
      ${faqHtml}
      <section class="shop-grounded-box">
        <h2>Grounded scope</h2>
        <p>${esc(guide.groundedBoundary)}</p>
      </section>
    </article>
    ${disclosureBanner()}
    <section class="shop-section" aria-labelledby="guide-recs-heading">
      <h2 id="guide-recs-heading">Verified Editions Mentioned in This Guide</h2>
      <div class="shop-grid">${recs.map((p) => productCard(p, catalogMap)).join("")}</div>
    </section>
  `;

  const jsonLd: unknown[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: guide.title,
      description: guide.description,
      mainEntityOfPage: `${HOST}${path}`,
      isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST },
    },
    breadcrumbSchema([
      { name: "Emporium", path: "/shop" },
      { name: "Buying Guides", path: "/shop/guides" },
      { name: guide.title, path },
    ]),
  ];

  if (guide.faq?.length) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }

  return new Response(layout({ title, description: guide.description, path, body, jsonLd }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" },
  });
}

function renderSocialWorkflowPage(): Response {
  const title = "Social-Commerce Editorial Studio | Oracle Mirror Emporium";
  const description = "Editable social campaign templates for Instagram, Facebook, Pinterest, Threads, TikTok, and short-form video.";

  const cards = SOCIAL_CAMPAIGN_TEMPLATES.map((t) => `<article class="shop-social-card">
    <p class="shop-kicker">${esc(t.platforms.join(" · "))}</p>
    <h2>${esc(t.formatName)}</h2>
    <p><strong>Visual Concept (Original Art Only):</strong> ${esc(t.visualConcept)}</p>
    <p><strong>Landing URL:</strong> <a href="${esc(t.landingPath)}">${esc(t.landingPath)}</a></p>
    <label class="shop-social-field">
      <span>Editable Caption (includes required Amazon disclosure)</span>
      <textarea rows="3" readonly>${esc(t.caption)}</textarea>
    </label>
    <label class="shop-social-field">
      <span>Short-Form Video Script</span>
      <textarea rows="2" readonly>${esc(t.videoScript)}</textarea>
    </label>
    <p class="shop-social-tags">${esc(t.hashtags.join(" "))}</p>
  </article>`).join("");

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/shop">Emporium</a><span>&#8250;</span><span>Social Editorial Studio</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">Manual Approval Required &middot; No Auto-Publishing</p>
      <h1>Social-Commerce Editorial Workflow</h1>
      <p class="shop-hero-sub">Ready-to-adapt editorial formats for Instagram, Facebook, Pinterest, Threads, and TikTok. Never reuse unauthorized Amazon product images in social graphics—pair these captions with original Oracle Mirror artwork or photography.</p>
    </section>
    <div class="shop-social-grid">${cards}</div>
  `;

  return new Response(layout({ title, description, path: "/shop/social", body, noindex: true }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" },
  });
}

function renderTarotDeckOfTheWeekPage(
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): Response {
  const deck = getTarotDeckOfTheWeek();
  const related = relatedProductsFor(deck, 4).filter((p) => isProductAvailable(p, catalogMap));
  const path = "/shop/tarot-deck-of-the-week";
  const title = `Tarot Deck of the Week: ${deck.title} | Oracle Mirror Emporium`;
  const description = `Weekly tarot editorial spotlight featuring ${deck.title} by ${deck.creator}. Chosen for symbolic clarity, durability, and beginner-to-collector study.`;

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><span>Tarot Deck of the Week</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">Weekly Editorial Spotlight</p>
      <h1>Tarot Deck of the Week: ${esc(deck.title)}</h1>
      <p class="shop-hero-sub">${esc(deck.summary)}</p>
    </section>
    ${disclosureBanner()}
    <article class="shop-product-detail" data-track-product-view="${esc(deck.slug)}" data-shop-department="${esc(deck.department)}">
      <div class="shop-product-hero">
        <div class="shop-product-art">${renderProductMedia(deck, catalogMap)}</div>
        <div class="shop-product-info">
          <p class="shop-kicker">${esc(deck.format)} &middot; ${esc(deck.experienceLevel)}</p>
          <h2>${esc(deck.title)}</h2>
          <p class="shop-product-creator">By ${esc(deck.creator)}</p>
          <p class="shop-product-summary">${esc(deck.whyItFits)}</p>
          <div class="shop-product-cta-row">
            ${affiliateCta(deck, "Check Current Price on Amazon")}
            <a class="btn-ghost" href="/shop/products/${esc(deck.slug)}">Full Edition Details</a>
          </div>
          <p class="shop-inline-disclosure">${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Free 78-card readings on Oracle Mirror never require purchasing a physical deck.</p>
        </div>
      </div>
      <div class="shop-grounded-box">
        <h2>Editorial Selection Criteria &amp; Grounded Note</h2>
        <p>${esc(deck.groundedNote)} Every weekly selection is rotated deterministically from our curated tarot cabinet based on card readability, illustration craft, and companion documentation—never on private reading inputs.</p>
      </div>
    </article>
    <section class="shop-section" aria-labelledby="weekly-related-heading">
      <h2 id="weekly-related-heading">Companion Books &amp; Decks</h2>
      <div class="shop-grid">${related.map((p) => productCard(p, catalogMap)).join("")}</div>
    </section>
  `;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      mainEntityOfPage: `${HOST}${path}`,
      isPartOf: { "@type": "WebSite", name: "Oracle Mirror", url: HOST },
    },
    breadcrumbSchema([
      { name: "Emporium", path: "/shop" },
      { name: "Tarot Deck of the Week", path },
    ]),
  ];

  return new Response(layout({ title, description, path, body, jsonLd }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=3600" },
  });
}

function renderReadingLibraryPage(
  catalogMap: Map<string, CatalogItemMetadata> = new Map(),
): Response {
  const books = getReadingLibraryProducts().filter((p) => isProductAvailable(p, catalogMap));
  const path = "/shop/reading-library";
  const title = "Oracle Reading Library — Tarot, Astrology, Dream & Mythology Books | Oracle Mirror";
  const description = `Curated library of ${books.length} verified books, study manuals, classical translations, and reflective journals, paired with Audible and Kindle Unlimited options.`;

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/">Oracle Mirror</a><span>&#8250;</span><a href="/shop">Emporium</a><span>&#8250;</span><span>Oracle Reading Library</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">Curated Study Shelf</p>
      <h1>Oracle Reading Library</h1>
      <p class="shop-hero-sub">Respected tarot study manuals, natal astrology guides, I Ching translations, Jungian dream classics, astronomy field guides, and archival journals.</p>
    </section>
    ${disclosureBanner()}
    <section class="shop-section" aria-labelledby="library-books-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Verified Print &amp; Journal Editions</p>
          <h2 id="library-books-heading">Library Catalog (${books.length} Titles)</h2>
        </div>
        <a class="shop-text-link" href="/shop/guides">Read Editorial Guides &#8594;</a>
      </div>
      <div class="shop-grid">${books.map((p) => productCard(p, catalogMap)).join("")}</div>
    </section>
    <section class="shop-section" aria-labelledby="library-bounties-heading">
      <div class="shop-section-head">
        <div>
          <p class="shop-kicker">Digital &amp; Audio Subscriptions</p>
          <h2 id="library-bounties-heading">Audible, Kindle Unlimited &amp; Prime</h2>
        </div>
      </div>
      <div class="shop-bounty-grid">${BOUNTY_OFFERS.map(bountyCard).join("")}</div>
    </section>
  `;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Oracle Reading Library",
      description,
      url: `${HOST}${path}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: books.length,
      itemListElement: books.map((book, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: book.title,
        url: `${HOST}/shop/products/${book.slug}`,
      })),
    },
    breadcrumbSchema([
      { name: "Emporium", path: "/shop" },
      { name: "Oracle Reading Library", path },
    ]),
  ];

  return new Response(layout({ title, description, path, body, jsonLd }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=1800" },
  });
}

function renderAnalyticsReportPage(health?: CatalogHealthSummary): Response {
  const title = "Emporium Reporting View | Oracle Mirror";
  const description = "Privacy-compliant local and session reporting for Oracle Mirror Emporium views and outbound Amazon clicks.";
  const apiStatusHtml = health
    ? `<section class="shop-analytics-grid" aria-label="Creators API catalog diagnostics">
      <div class="shop-stat-card"><h3>Creators API Credentials</h3><p>${health.configured ? "Configured" : "Not Configured"}</p><small>OAuth 2.0 v${esc(health.version)} · ${esc(health.marketplace)}</small></div>
      <div class="shop-stat-card"><h3>Cached ASINs (&le;${health.cacheTtlHours}h)</h3><p>${health.cachedCount} / ${health.totalTracked}</p><small>KV metadata cache within 24h limit</small></div>
      <div class="shop-stat-card"><h3>Live Product Images</h3><p>${health.withImageCount}</p><small>Authorized Amazon image URLs cached</small></div>
      <div class="shop-stat-card"><h3>Unavailable / Last Error</h3><p>${health.unavailableCount}</p><small>${esc(health.lastError || "No active API error")}</small></div>
    </section>`
    : "";

  const body = `
    <nav class="shop-crumb" aria-label="Breadcrumb"><a href="/shop">Emporium</a><span>&#8250;</span><span>Emporium Reporting</span></nav>
    <section class="shop-hero shop-hero-compact">
      <p class="shop-kicker">Privacy-Compliant Telemetry</p>
      <h1>Emporium Analytics &amp; Attribution View</h1>
      <p class="shop-hero-sub">Displays coarse, non-personal shop metrics recorded in this browser session alongside Cloudflare Analytics Engine event schemas. Outbound Amazon clicks are measured on Oracle Mirror; confirmed orders and commissions must be checked inside Amazon Associates Central.</p>
    </section>
    <section class="shop-analytics-grid" id="shop-analytics-root">
      <div class="shop-stat-card"><h3>Default Tracking Tag</h3><p><code>${DEFAULT_AFFILIATE_TAG}</code></p><small>Website channel default (configurable)</small></div>
      <div class="shop-stat-card"><h3>Catalog Size</h3><p>${SHOP_PRODUCTS.length}</p><small>Verified ASINs across ${SHOP_DEPARTMENTS.length} departments</small></div>
      <div class="shop-stat-card"><h3>Session Shop Views</h3><p id="stat-shop-views">0</p><small>Recorded locally when analytics consent is granted</small></div>
      <div class="shop-stat-card"><h3>Session Outbound Clicks</h3><p id="stat-outbound-clicks">0</p><small>Clicks on Amazon.com links (not confirmed sales)</small></div>
    </section>
    ${apiStatusHtml}
    <section class="shop-grounded-box">
      <h2>Important Attribution Distinction</h2>
      <p>Oracle Mirror never fabricates conversion rates, order counts, or commission totals. Outbound clicks indicate visitor interest; actual qualifying purchases and earnings are reported exclusively by Amazon Associates Central.</p>
    </section>
  `;

  return new Response(layout({ title, description, path: "/shop/analytics", body, noindex: true }), {
    headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" },
  });
}

export function isShopRoute(pathname: string): boolean {
  return pathname === "/shop" || pathname === "/shop/" || pathname.startsWith("/shop/");
}

function routeShopWithCatalog(
  pathname: string,
  catalogMap: Map<string, CatalogItemMetadata>,
  health?: CatalogHealthSummary,
): Response {
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  if (normalized === "/shop") return renderShopHome(catalogMap);
  if (normalized === "/shop/reading-library") return renderReadingLibraryPage(catalogMap);
  if (normalized === "/shop/tarot-deck-of-the-week") return renderTarotDeckOfTheWeekPage(catalogMap);
  if (normalized === "/shop/realms") return renderRealmsIndex();
  if (normalized === "/shop/gift-finder") return renderGiftFinderPage(catalogMap);
  if (normalized === "/shop/guides") return renderGuidesIndex();
  if (normalized === "/shop/social") return renderSocialWorkflowPage();
  if (normalized === "/shop/analytics") return renderAnalyticsReportPage(health);

  if (normalized.startsWith("/shop/departments/")) {
    const slug = normalized.slice("/shop/departments/".length);
    const dept = departmentBySlug(slug);
    if (dept) return renderDepartmentPage(dept, catalogMap);
  }
  if (normalized.startsWith("/shop/products/")) {
    const slug = normalized.slice("/shop/products/".length);
    const product = productBySlug(slug);
    if (product) return renderProductPage(product, catalogMap);
  }
  if (normalized.startsWith("/shop/realms/")) {
    const slug = normalized.slice("/shop/realms/".length);
    const response = renderRealmCollectionPage(slug, catalogMap);
    if (response) return response;
  }
  if (normalized.startsWith("/shop/guides/")) {
    const slug = normalized.slice("/shop/guides/".length);
    const guide = guideBySlug(slug);
    if (guide) return renderGuidePage(guide, catalogMap);
  }

  return new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><title>Emporium Item Not Found | Oracle Mirror</title></head><body><main><h1>Item not found in The Oracle Mirror Emporium</h1><p><a href="/shop">Return to The Oracle Mirror Emporium</a></p></main></body></html>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=UTF-8" } },
  );
}

export function handleShopRoute(pathname: string): Response {
  return routeShopWithCatalog(pathname, new Map());
}

export async function handleShopRouteAsync(
  pathname: string,
  env: AmazonCreatorsEnv,
): Promise<Response> {
  const normalized = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const allAsins = SHOP_PRODUCTS.map((p) => p.asin);
  if (normalized === "/shop/analytics") {
    const health = await getCatalogHealth(env, allAsins);
    return routeShopWithCatalog(pathname, new Map(), health);
  }
  const catalogMap = await getCachedCatalogMap(env, allAsins);
  return routeShopWithCatalog(pathname, catalogMap);
}

export function shopSitemapUrls(): string[] {
  return [
    "/shop",
    "/shop/reading-library",
    "/shop/tarot-deck-of-the-week",
    "/shop/realms",
    "/shop/gift-finder",
    "/shop/guides",
    ...SHOP_DEPARTMENTS.map((d) => `/shop/departments/${d.slug}`),
    ...REALM_SHOP_COLLECTIONS.map((r) => `/shop/realms/${r.slug}`),
    ...BUYING_GUIDES.map((g) => `/shop/guides/${g.slug}`),
    ...SHOP_PRODUCTS.map((p) => `/shop/products/${p.slug}`),
  ];
}

export function augmentSitemapWithShop(xml: string): string {
  if (!xml.includes("</urlset>") || xml.includes(`${HOST}/shop</loc>`)) return xml;
  const additions = shopSitemapUrls()
    .map((path) => {
      const priority = path === "/shop" ? "0.85" : path.startsWith("/shop/departments/") || path.startsWith("/shop/realms/") || path === "/shop/reading-library" || path === "/shop/tarot-deck-of-the-week" ? "0.75" : "0.60";
      return `  <url><loc>${HOST}${path}</loc><lastmod>${LASTMOD}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`;
    })
    .join("\n");
  return xml.replace("</urlset>", `${additions}\n</urlset>`);
}

export function augmentLlmsWithShop(text: string): string {
  if (text.includes(`${HOST}/shop`)) return text;
  return `${text.trimEnd()}\n\n## The Oracle Mirror Emporium\n- Curated shop: ${HOST}/shop — Tarot, Celestial Treasures & Ritual Essentials (${SHOP_PRODUCTS.length} verified editions).\n- Oracle Reading Library: ${HOST}/shop/reading-library — curated tarot, astrology, dream, I Ching, rune, and numerology books.\n- Tarot Deck of the Week: ${HOST}/shop/tarot-deck-of-the-week — weekly tarot deck spotlight.\n- Shop Your Realm: ${HOST}/shop/realms — curated collections paired with Oracle Mirror realms.\n- Gift Discovery: ${HOST}/shop/gift-finder — voluntary, privacy-safe mystical gift matcher.\n- Buying Guides: ${HOST}/shop/guides — ${BUYING_GUIDES.length} grounded editorial guides.\n- Disclosure: ${AMAZON_ASSOCIATES_DISCLOSURE}\n`;
}

export function injectShopDiscovery(html: string): string {
  if (!html || html.includes('href="/shop"')) return html;
  let next = html;
  next = next.replace(
    '<a href="/archive" class="nav-link" data-nav="archive">Archive</a>',
    '<a href="/shop" class="nav-link nav-link-shop">Emporium</a>\n          <a href="/archive" class="nav-link" data-nav="archive">Archive</a>',
  );
  const weeklyDeck = getTarotDeckOfTheWeek();
  const teaser = `<section id="emporium-teaser" class="emporium-teaser" aria-labelledby="emporium-teaser-title">
        <div class="section-divider">&#10022; &#9830; &#10022;</div>
        <p class="emporium-teaser-kicker">The Oracle Mirror Emporium</p>
        <h2 id="emporium-teaser-title">Tarot, Celestial Treasures &amp; Ritual Essentials</h2>
        <p class="section-subtitle">Explore curated physical tarot decks, I Ching translations, Elder Futhark sets, dream journals, and stargazing guides—optional companions to your free readings. Featured this week: <strong>${esc(weeklyDeck.title)}</strong>.</p>
        <div class="emporium-teaser-actions">
          <a href="/shop" class="btn-gold">Visit the Emporium</a>
          <a href="/shop/tarot-deck-of-the-week" class="btn-ghost">Tarot Deck of the Week</a>
          <a href="/shop/reading-library" class="btn-ghost">Oracle Reading Library</a>
          <a href="/shop/gift-finder" class="btn-ghost">Find Your Mystical Gift</a>
        </div>
        <p class="emporium-teaser-disclosure">${esc(AMAZON_ASSOCIATES_DISCLOSURE)}</p>
      </section>\n\n      <!-- Choose Your Realm -->`;
  if (next.includes("<!-- Choose Your Realm -->")) {
    next = next.replace("<!-- Choose Your Realm -->", teaser);
  }
  return next;
}

export function renderEditorialShopCallout(pathname: string): string {
  // Subtle contextual recommendation strip for public educational/reference pages only.
  let realmSlug: string | null = null;
  let label = "Explore The Oracle Mirror Emporium";
  if (pathname.startsWith("/tarot/") && pathname !== "/tarot/advanced") {
    realmSlug = "seraphina-tarot-library";
    label = "Explore Tarot Decks & Study Books in Seraphina's Shelf";
  } else if (pathname.startsWith("/divination/crystals")) {
    realmSlug = "madame-fortuna-crystal-ball";
    label = "Browse Crystal Reference Guides in Madame Fortuna's Cabinet";
  } else if (pathname.startsWith("/iching/") && pathname !== "/iching/advanced") {
    realmSlug = "master-longwei-jade-pavilion";
    label = "Explore Classical I Ching Translations in Master Longwei's Shelf";
  } else if (pathname.startsWith("/runes/")) {
    realmSlug = "elder-futhark-rune-chamber";
    label = "Explore Physical Rune Sets & Handbooks in the Rune Chamber";
  } else if (pathname.startsWith("/dreams/")) {
    realmSlug = "morpheus-vey-dream-library";
    label = "Explore Bedside Dream Journals in Morpheus Vey's Shelf";
  } else if (pathname.startsWith("/astrology")) {
    realmSlug = "astaria-celestial-observatory";
    label = "Explore Star Atlases & Astrology Books in Astaria's Observatory";
  } else if (pathname.startsWith("/numerology/") && pathname !== "/numerology/advanced") {
    realmSlug = "pythius-numerology-chamber";
    label = "Explore Numerology & Reflection Companions in Pythius's Shelf";
  }
  if (!realmSlug) return "";
  return `<aside class="oracle-editorial-shop" aria-label="Related Emporium shelf">
    <p><strong>Curated Reading &amp; Keepsakes:</strong> <a href="/shop/realms/${realmSlug}">${esc(label)} &#8594;</a></p>
    <small>${esc(AMAZON_ASSOCIATES_DISCLOSURE)} Readings and reference guides are always free.</small>
  </aside>`;
}
