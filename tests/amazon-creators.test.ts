import test from "node:test";
import assert from "node:assert/strict";
import {
  CREATORS_API_CATALOG_URL,
  KV_METADATA_TTL_SECONDS,
  MAX_METADATA_AGE_MS,
  fetchCatalogBatch,
  getCachedCatalogMap,
  getCatalogHealth,
  getCreatorsAccessToken,
  isAuthorizedAmazonImageUrl,
  resolveAuthConfig,
  type AmazonCreatorsEnv,
  type CatalogItemMetadata,
} from "../src/amazon-creators.ts";
import { BOUNTY_OFFERS, BUYING_GUIDES, getTarotDeckOfTheWeek } from "../src/shop-data.ts";
import { handleShopRouteAsync, shopSitemapUrls } from "../src/shop-pages.ts";
import { bountyLinkAttributes } from "../src/affiliate.ts";

function createMemoryKv(): KVNamespace {
  const store = new Map<string, string>();
  return {
    async get(key: string, type?: string) {
      const val = store.get(key);
      if (val === undefined) return null;
      return type === "json" ? JSON.parse(val) : val;
    },
    async put(key: string, value: string) {
      store.set(key, value);
    },
    async delete(key: string) {
      store.delete(key);
    },
    async list() {
      return { keys: [], list_complete: true, cacheStatus: null };
    },
    async getWithMetadata() {
      return { value: null, metadata: null, cacheStatus: null };
    },
  } as unknown as KVNamespace;
}

test("Creators API resolves version-appropriate OAuth 2.0 endpoints", () => {
  assert.deepEqual(resolveAuthConfig("3.1"), {
    tokenUrl: "https://api.amazon.com/auth/o2/token",
    scope: "creatorsapi::default",
    version: "3.1",
  });
  assert.equal(resolveAuthConfig("3.2").tokenUrl, "https://api.amazon.co.uk/auth/o2/token");
  assert.equal(resolveAuthConfig("3.3").tokenUrl, "https://api.amazon.co.jp/auth/o2/token");
  assert.equal(
    resolveAuthConfig("2.1").tokenUrl,
    "https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token",
  );
});

test("Amazon image URL validation allows authorized HTTPS Amazon hosts only", () => {
  assert.equal(isAuthorizedAmazonImageUrl("https://m.media-amazon.com/images/I/81abc.jpg"), true);
  assert.equal(isAuthorizedAmazonImageUrl("https://images-na.ssl-images-amazon.com/images/I/81abc.jpg"), true);
  assert.equal(isAuthorizedAmazonImageUrl("http://m.media-amazon.com/images/I/81abc.jpg"), false);
  assert.equal(isAuthorizedAmazonImageUrl("https://evil.example.com/fake.jpg"), false);
  assert.equal(isAuthorizedAmazonImageUrl(null), false);
});

test("Creators API OAuth caches tokens, fetches GetItems, and enforces <= 24h KV TTL", async () => {
  assert.ok(KV_METADATA_TTL_SECONDS <= 24 * 60 * 60);
  const kv = createMemoryKv();
  let tokenCalls = 0;
  let catalogCalls = 0;

  const mockFetch: typeof fetch = async (input) => {
    const url = String(input);
    if (url === "https://api.amazon.com/auth/o2/token") {
      tokenCalls += 1;
      return new Response(
        JSON.stringify({ access_token: "test-access-token", expires_in: 3600, token_type: "bearer" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    if (url === CREATORS_API_CATALOG_URL) {
      catalogCalls += 1;
      return new Response(
        JSON.stringify({
          itemsResult: {
            items: [
              {
                asin: "091386613X",
                itemInfo: {
                  title: { displayValue: "The Rider-Waite Tarot Deck" },
                  byLineInfo: { contributors: [{ name: "Arthur Edward Waite" }] },
                },
                images: {
                  primary: {
                    large: {
                      url: "https://m.media-amazon.com/images/I/81riderwaite.jpg",
                      width: 500,
                      height: 500,
                    },
                  },
                  variants: [
                    {
                      large: {
                        url: "https://m.media-amazon.com/images/I/81riderwaite-back.jpg",
                        width: 500,
                        height: 500,
                      },
                    },
                  ],
                },
              },
            ],
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response("Not Found", { status: 404 });
  };

  const env: AmazonCreatorsEnv = {
    ORACLE_KV: kv,
    AMAZON_CREDENTIAL_ID: "test-client-id",
    AMAZON_CREDENTIAL_SECRET: "test-client-secret",
    AMAZON_CREDENTIAL_VERSION: "3.1",
    AMAZON_PARTNER_TAG: "xelarindo-20",
    AMAZON_MARKETPLACE: "www.amazon.com",
  };

  const batch = await fetchCatalogBatch(env, ["091386613X", "1454938684"], { fetchImpl: mockFetch });
  assert.equal(tokenCalls, 1);
  assert.equal(catalogCalls, 1);
  assert.equal(batch.items.get("091386613X")?.primaryImage?.url, "https://m.media-amazon.com/images/I/81riderwaite.jpg");
  assert.equal(batch.items.get("091386613X")?.variantImages.length, 1);
  assert.equal(batch.items.get("1454938684")?.status, "unavailable");

  // Second token lookup should reuse cached token without hitting OAuth endpoint
  const secondToken = await getCreatorsAccessToken(env, mockFetch);
  assert.equal(secondToken.ok, true);
  assert.equal(tokenCalls, 1);

  // Stale entries (>24h) must not be returned from getCachedCatalogMap
  const staleEntry: CatalogItemMetadata = {
    asin: "0062466593",
    marketplace: "www.amazon.com",
    title: "Stale",
    creator: null,
    detailPageUrl: null,
    primaryImage: { url: "https://m.media-amazon.com/images/I/stale.jpg" },
    variantImages: [],
    available: true,
    status: "ok",
    fetchedAt: Date.now() - MAX_METADATA_AGE_MS - 1000,
  };
  await kv.put("amazon:item:v1:www.amazon.com:0062466593", JSON.stringify(staleEntry));
  const cached = await getCachedCatalogMap(env, ["091386613X", "0062466593"]);
  assert.equal(cached.has("091386613X"), true);
  assert.equal(cached.has("0062466593"), false);

  // Health diagnostics never expose secrets
  const health = await getCatalogHealth(env, ["091386613X", "1454938684"]);
  assert.equal(health.configured, true);
  assert.equal(health.withImageCount, 1);
  assert.equal(health.unavailableCount, 1);
  assert.doesNotMatch(JSON.stringify(health), /test-client-secret/);
});

test("SSR shop renders real cached Amazon images and falls back to text-only when unavailable", async () => {
  const kv = createMemoryKv();
  await kv.put(
    "amazon:item:v1:www.amazon.com:091386613X",
    JSON.stringify({
      asin: "091386613X",
      marketplace: "www.amazon.com",
      title: "The Rider-Waite Tarot Deck",
      creator: "Arthur Edward Waite",
      detailPageUrl: null,
      primaryImage: { url: "https://m.media-amazon.com/images/I/81riderwaite.jpg", width: 500, height: 500 },
      variantImages: [{ url: "https://m.media-amazon.com/images/I/81back.jpg", width: 500, height: 500 }],
      available: true,
      status: "ok",
      fetchedAt: Date.now(),
    } satisfies CatalogItemMetadata),
  );

  const productWithImage = await handleShopRouteAsync("/shop/products/rider-waite-tarot-deck", { ORACLE_KV: kv });
  const withImgHtml = await productWithImage.text();
  assert.match(withImgHtml, /https:\/\/m\.media-amazon\.com\/images\/I\/81riderwaite\.jpg/);
  assert.match(withImgHtml, /https:\/\/m\.media-amazon\.com\/images\/I\/81back\.jpg/);
  assert.doesNotMatch(withImgHtml, /celestial cabinet illustration/);

  const productWithoutImage = await handleShopRouteAsync("/shop/products/modern-witch-tarot-deck", { ORACLE_KV: kv });
  const textOnlyHtml = await productWithoutImage.text();
  assert.match(textOnlyHtml, /Text-Only Listing/);
  assert.doesNotMatch(textOnlyHtml, /celestial cabinet illustration/);
});

test("Bounties, Tarot Deck of the Week, Reading Library, and 12 guides are compliant and routed", async () => {
  assert.equal(BOUNTY_OFFERS.length, 4);
  for (const offer of BOUNTY_OFFERS) {
    const attrs = bountyLinkAttributes(offer.amazonPath);
    assert.equal(attrs.rel, "nofollow sponsored noopener noreferrer");
    assert.match(attrs.href, /tag=xelarindo-20/);
  }
  assert.ok(BUYING_GUIDES.length >= 12);
  const deck = getTarotDeckOfTheWeek(new Date("2026-11-25T12:00:00Z"));
  assert.equal(deck.department, "tarot-oracle");

  const urls = shopSitemapUrls();
  assert.ok(urls.includes("/shop/tarot-deck-of-the-week"));
  assert.ok(urls.includes("/shop/reading-library"));

  const libraryRes = await handleShopRouteAsync("/shop/reading-library", {});
  assert.equal(libraryRes.status, 200);
  const libraryHtml = await libraryRes.text();
  assert.match(libraryHtml, /Audible Standard/);
  assert.match(libraryHtml, /Kindle Unlimited/);
  assert.match(libraryHtml, /Not every book in the Oracle Reading Library is included/);

  const weeklyRes = await handleShopRouteAsync("/shop/tarot-deck-of-the-week", {});
  assert.equal(weeklyRes.status, 200);

  // Unavailable product suppresses purchase CTA instead of falling back to Amazon search
  const kv = createMemoryKv();
  await kv.put(
    "amazon:item:v1:www.amazon.com:1454938684",
    JSON.stringify({
      asin: "1454938684",
      marketplace: "www.amazon.com",
      title: "The Modern Witch Tarot Deck",
      creator: "Lisa Sterle",
      detailPageUrl: null,
      primaryImage: null,
      variantImages: [],
      available: false,
      status: "unavailable",
      fetchedAt: Date.now(),
    } satisfies CatalogItemMetadata),
  );
  const unavailableRes = await handleShopRouteAsync("/shop/products/modern-witch-tarot-deck", { ORACLE_KV: kv });
  const unavailableHtml = await unavailableRes.text();
  assert.match(unavailableHtml, /Currently unavailable on Amazon/);
  assert.doesNotMatch(unavailableHtml, /data-shop-product="modern-witch-tarot-deck"/);
});
