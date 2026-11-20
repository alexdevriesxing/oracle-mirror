import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  AMAZON_ASSOCIATES_DISCLOSURE,
  DEFAULT_AFFILIATE_TAG,
  affiliateLinkAttributes,
  buildAmazonProductUrl,
  createAffiliateConfig,
  isValidAsin,
} from "../src/affiliate.ts";
import {
  BUYING_GUIDES,
  GIFT_PERSONAS,
  REALM_SHOP_COLLECTIONS,
  SHOP_DEPARTMENTS,
  SHOP_PRODUCTS,
  SOCIAL_CAMPAIGN_TEMPLATES,
} from "../src/shop-data.ts";
import {
  augmentLlmsWithShop,
  augmentSitemapWithShop,
  handleShopRoute,
  injectShopDiscovery,
  isShopRoute,
  renderEditorialShopCallout,
  shopSitemapUrls,
} from "../src/shop-pages.ts";

test("affiliate link utility validates ASINs, applies tracking tag, and sets sponsored attributes", () => {
  assert.equal(DEFAULT_AFFILIATE_TAG, "xelarindo-20");
  assert.equal(isValidAsin("091386613X"), true);
  assert.equal(isValidAsin("B092DWCLYJ"), true);
  assert.equal(isValidAsin("BAD"), false);

  const url = buildAmazonProductUrl("091386613X");
  assert.equal(url, "https://www.amazon.com/dp/091386613X?tag=xelarindo-20");

  const customConfig = createAffiliateConfig({
    channelTags: { instagram: "xelarindo-ig-20" },
  });
  assert.equal(
    buildAmazonProductUrl("091386613X", { channel: "instagram", config: customConfig }),
    "https://www.amazon.com/dp/091386613X?tag=xelarindo-ig-20",
  );

  const attrs = affiliateLinkAttributes("B09N21ZD7B");
  assert.equal(attrs.target, "_blank");
  assert.equal(attrs.rel, "nofollow sponsored noopener noreferrer");
  assert.match(attrs.href, /^https:\/\/www\.amazon\.com\/dp\/B09N21ZD7B\?tag=xelarindo-20$/);
});

test("Emporium catalog has 8 departments, 50+ verified products, unique slugs, and valid ASINs", () => {
  assert.equal(SHOP_DEPARTMENTS.length, 8);
  assert.ok(SHOP_PRODUCTS.length >= 50 && SHOP_PRODUCTS.length <= 80, `Expected 50-80 products, got ${SHOP_PRODUCTS.length}`);

  const slugs = new Set<string>();
  const deptSlugs = new Set(SHOP_DEPARTMENTS.map((d) => d.slug));
  for (const product of SHOP_PRODUCTS) {
    assert.ok(!slugs.has(product.slug), `Duplicate slug: ${product.slug}`);
    slugs.add(product.slug);
    assert.ok(isValidAsin(product.asin), `Invalid ASIN for ${product.slug}: ${product.asin}`);
    assert.ok(deptSlugs.has(product.department), `Unknown department ${product.department}`);
  }
});

test("Shop Your Realm, Gift Finder, Buying Guides, and Social templates are complete", () => {
  assert.equal(REALM_SHOP_COLLECTIONS.length, 7);
  assert.equal(GIFT_PERSONAS.length, 6);
  assert.equal(BUYING_GUIDES.length, 8);
  assert.equal(SOCIAL_CAMPAIGN_TEMPLATES.length, 7);

  for (const template of SOCIAL_CAMPAIGN_TEMPLATES) {
    assert.match(template.caption, /As an Amazon Associate I earn from qualifying purchases\./);
  }
});

test("SSR shop routes return valid HTML with disclosure, Check Current Price on Amazon, and no fake pricing", async () => {
  assert.equal(isShopRoute("/shop"), true);
  assert.equal(isShopRoute("/shop/products/rider-waite-tarot-deck"), true);
  assert.equal(isShopRoute("/tarot"), false);

  const home = handleShopRoute("/shop");
  assert.equal(home.status, 200);
  const homeHtml = await home.text();
  assert.match(homeHtml, /The Oracle Mirror Emporium/);
  assert.match(homeHtml, /Tarot, Celestial Treasures &amp; Ritual Essentials/);
  assert.match(homeHtml, new RegExp(AMAZON_ASSOCIATES_DISCLOSURE.replace(".", "\\.")));
  assert.match(homeHtml, /Check Current Price on Amazon/);
  assert.match(homeHtml, /rel="nofollow sponsored noopener noreferrer"/);

  const product = handleShopRoute("/shop/products/rider-waite-tarot-deck");
  assert.equal(product.status, 200);
  const productHtml = await product.text();
  assert.match(productHtml, /091386613X/);
  assert.match(productHtml, /https:\/\/www\.amazon\.com\/dp\/091386613X\?tag=xelarindo-20/);
  assert.doesNotMatch(productHtml, /"aggregateRating"/);
  assert.doesNotMatch(productHtml, /"priceCurrency"/);

  const giftFinder = handleShopRoute("/shop/gift-finder");
  assert.equal(giftFinder.status, 200);

  const guide = handleShopRoute("/shop/guides/how-to-choose-your-first-tarot-deck");
  assert.equal(guide.status, 200);

  const analytics = handleShopRoute("/shop/analytics");
  assert.equal(analytics.status, 200);
  assert.match(await analytics.text(), /noindex,follow/);

  const missing = handleShopRoute("/shop/products/does-not-exist");
  assert.equal(missing.status, 404);
});

test("sitemap, llms.txt, homepage discovery, and editorial callouts integrate cleanly", () => {
  const urls = shopSitemapUrls();
  assert.ok(urls.includes("/shop"));
  assert.ok(urls.includes("/shop/gift-finder"));
  assert.ok(!urls.includes("/shop/analytics"));
  assert.ok(!urls.includes("/shop/social"));

  const baseXml = "<urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>";
  const expandedXml = augmentSitemapWithShop(baseXml);
  assert.match(expandedXml, /https:\/\/oraclemirror\.com\/shop<\/loc>/);
  assert.equal(augmentSitemapWithShop(expandedXml), expandedXml);

  const baseLlms = "# Oracle Mirror\n";
  const expandedLlms = augmentLlmsWithShop(baseLlms);
  assert.match(expandedLlms, /The Oracle Mirror Emporium/);
  assert.equal(augmentLlmsWithShop(expandedLlms), expandedLlms);

  const baseHome = '<nav><a href="/archive" class="nav-link" data-nav="archive">Archive</a></nav><!-- Choose Your Realm -->';
  const expandedHome = injectShopDiscovery(baseHome);
  assert.match(expandedHome, /href="\/shop"/);
  assert.match(expandedHome, /emporium-teaser/);
  assert.equal(injectShopDiscovery(expandedHome), expandedHome);

  assert.match(renderEditorialShopCallout("/tarot/cards/the-fool"), /seraphina-tarot-library/);
  assert.equal(renderEditorialShopCallout("/tarot/advanced"), "");
});

test("advertising and telemetry enforce GDPR/ePrivacy consent choices", async () => {
  const adConfig = await readFile(new URL("../public/ad-config.js", import.meta.url), "utf8");
  const adsJs = await readFile(new URL("../public/ads.js", import.meta.url), "utf8");
  const telemetryJs = await readFile(new URL("../public/telemetry.js", import.meta.url), "utf8");

  assert.match(adConfig, /consentRequired:\s*true/);
  assert.match(adConfig, /contextualAdsWithoutConsent:\s*false/);
  assert.match(adsJs, /renderConsentBanner/);
  assert.match(adsJs, /openCookiePreferences/);
  assert.match(adsJs, /consent_rejected/);
  assert.match(telemetryJs, /hasAnalyticsConsent/);
});
