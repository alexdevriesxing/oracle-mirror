import { isValidAsin } from "./affiliate.ts";

export interface AmazonCreatorsEnv {
  ORACLE_KV?: KVNamespace;
  AMAZON_CREDENTIAL_ID?: string;
  AMAZON_CREDENTIAL_SECRET?: string;
  AMAZON_APPLICATION_ID?: string;
  AMAZON_CREDENTIAL_VERSION?: string;
  AMAZON_PARTNER_TAG?: string;
  AMAZON_MARKETPLACE?: string;
}

export interface AmazonImageResource {
  url: string;
  width?: number;
  height?: number;
}

export interface CatalogItemMetadata {
  asin: string;
  marketplace: string;
  title: string | null;
  creator: string | null;
  detailPageUrl: string | null;
  primaryImage: AmazonImageResource | null;
  variantImages: AmazonImageResource[];
  available: boolean;
  status: "ok" | "unavailable" | "error";
  errorCode?: string;
  fetchedAt: number;
}

export interface CatalogHealthSummary {
  configured: boolean;
  version: string;
  marketplace: string;
  totalTracked: number;
  cachedCount: number;
  withImageCount: number;
  unavailableCount: number;
  errorCount: number;
  cacheTtlHours: number;
  lastError: string | null;
}

export const CREATORS_API_CATALOG_URL = "https://creatorsapi.amazon/catalog/v1/getItems";
export const CREATORS_API_SEARCH_URL = "https://creatorsapi.amazon/catalog/v1/searchItems";
export const MAX_METADATA_AGE_MS = 24 * 60 * 60 * 1000;
export const KV_METADATA_TTL_SECONDS = 12 * 60 * 60; // 12h (< 24h Amazon limit)
const TOKEN_SAFETY_MARGIN_SECONDS = 300;
const MIN_REQUEST_INTERVAL_MS = 1050;
const MAX_ASINS_PER_BATCH = 10;

const ALLOWED_AMAZON_IMAGE_HOSTS = [
  ".media-amazon.com",
  ".ssl-images-amazon.com",
  ".images-amazon.com",
];

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let memoryTokenCache: { key: string; token: CachedToken } | null = null;
let lastApiCallMs = 0;

export function resolveAuthConfig(version = "3.1"): {
  tokenUrl: string;
  scope: string;
  version: string;
} {
  const normalized = (version || "3.1").trim();
  switch (normalized) {
    case "3.2":
      return { tokenUrl: "https://api.amazon.co.uk/auth/o2/token", scope: "creatorsapi::default", version: "3.2" };
    case "3.3":
      return { tokenUrl: "https://api.amazon.co.jp/auth/o2/token", scope: "creatorsapi::default", version: "3.3" };
    case "2.1":
      return { tokenUrl: "https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token", scope: "creatorsapi/default", version: "2.1" };
    case "2.2":
      return { tokenUrl: "https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token", scope: "creatorsapi/default", version: "2.2" };
    case "2.3":
      return { tokenUrl: "https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token", scope: "creatorsapi/default", version: "2.3" };
    case "3.1":
    default:
      return { tokenUrl: "https://api.amazon.com/auth/o2/token", scope: "creatorsapi::default", version: "3.1" };
  }
}

export function isAuthorizedAmazonImageUrl(rawUrl: string | undefined | null): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "https:") return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_AMAZON_IMAGE_HOSTS.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

export function hasCreatorsCredentials(env: AmazonCreatorsEnv): boolean {
  return Boolean(env.AMAZON_CREDENTIAL_ID?.trim() && env.AMAZON_CREDENTIAL_SECRET?.trim());
}

function itemCacheKey(marketplace: string, asin: string): string {
  return `amazon:item:v1:${marketplace.toLowerCase()}:${asin.toUpperCase()}`;
}

function tokenCacheKey(version: string, marketplace: string): string {
  return `amazon:oauth:v1:${version}:${marketplace.toLowerCase()}`;
}

async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastApiCallMs;
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - elapsed));
  }
  lastApiCallMs = Date.now();
}

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  fetchImpl: typeof fetch = fetch,
  maxRetries = 2,
): Promise<Response> {
  let lastResponse: Response | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetchImpl(url, init);
    if (response.status !== 429 && response.status < 500) {
      return response;
    }
    lastResponse = response;
    if (attempt < maxRetries) {
      const backoffMs = Math.min(4000, 500 * Math.pow(2, attempt));
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
  return lastResponse!;
}

export async function getCreatorsAccessToken(
  env: AmazonCreatorsEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: true; accessToken: string } | { ok: false; errorCode: string }> {
  const clientId = env.AMAZON_CREDENTIAL_ID?.trim();
  const clientSecret = env.AMAZON_CREDENTIAL_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return { ok: false, errorCode: "missing_credentials" };
  }

  const version = env.AMAZON_CREDENTIAL_VERSION?.trim() || "3.1";
  const marketplace = env.AMAZON_MARKETPLACE?.trim() || "www.amazon.com";
  const auth = resolveAuthConfig(version);
  const memKey = tokenCacheKey(auth.version, marketplace);

  if (memoryTokenCache && memoryTokenCache.key === memKey && memoryTokenCache.token.expiresAt > Date.now()) {
    return { ok: true, accessToken: memoryTokenCache.token.accessToken };
  }

  if (env.ORACLE_KV) {
    try {
      const cached = await env.ORACLE_KV.get<CachedToken>(memKey, "json");
      if (cached?.accessToken && cached.expiresAt > Date.now()) {
        memoryTokenCache = { key: memKey, token: cached };
        return { ok: true, accessToken: cached.accessToken };
      }
    } catch {
      // Non-fatal KV read failure
    }
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    scope: auth.scope,
  });

  try {
    const response = await fetchWithRetry(
      auth.tokenUrl,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
      fetchImpl,
      1,
    );

    const payload = (await response.json().catch(() => ({}))) as {
      access_token?: string;
      expires_in?: number;
      error?: string;
    };

    if (!response.ok || !payload.access_token) {
      return {
        ok: false,
        errorCode: payload.error || `oauth_http_${response.status}`,
      };
    }

    const expiresIn = Math.max(120, Number(payload.expires_in) || 3600);
    const effectiveTtlSeconds = Math.max(60, expiresIn - TOKEN_SAFETY_MARGIN_SECONDS);
    const token: CachedToken = {
      accessToken: payload.access_token,
      expiresAt: Date.now() + effectiveTtlSeconds * 1000,
    };
    memoryTokenCache = { key: memKey, token };

    if (env.ORACLE_KV) {
      try {
        await env.ORACLE_KV.put(memKey, JSON.stringify(token), {
          expirationTtl: effectiveTtlSeconds,
        });
      } catch {
        // Non-fatal KV write failure
      }
    }

    return { ok: true, accessToken: token.accessToken };
  } catch {
    return { ok: false, errorCode: "oauth_network_error" };
  }
}

function normalizeImageResource(img: unknown): AmazonImageResource | null {
  if (!img || typeof img !== "object") return null;
  const record = img as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url : typeof record.URL === "string" ? record.URL : null;
  if (!isAuthorizedAmazonImageUrl(url)) return null;
  const width = typeof record.width === "number" ? record.width : typeof record.Width === "number" ? record.Width : undefined;
  const height = typeof record.height === "number" ? record.height : typeof record.Height === "number" ? record.Height : undefined;
  return { url: url!, width, height };
}

function parseCreatorsItem(raw: unknown, marketplace: string, fetchedAt: number): CatalogItemMetadata | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const asin = typeof item.asin === "string" ? item.asin.trim().toUpperCase() : typeof item.ASIN === "string" ? item.ASIN.trim().toUpperCase() : "";
  if (!isValidAsin(asin)) return null;

  const itemInfo = (item.itemInfo || item.ItemInfo || {}) as Record<string, unknown>;
  const titleObj = (itemInfo.title || itemInfo.Title) as Record<string, unknown> | undefined;
  const title = typeof titleObj?.displayValue === "string"
    ? titleObj.displayValue
    : typeof titleObj?.DisplayValue === "string"
      ? titleObj.DisplayValue
      : null;

  const byLine = (itemInfo.byLineInfo || itemInfo.ByLineInfo) as Record<string, unknown> | undefined;
  const contributors = Array.isArray(byLine?.contributors) ? byLine.contributors : [];
  const firstContributor = contributors[0] as Record<string, unknown> | undefined;
  const brandObj = byLine?.brand as Record<string, unknown> | undefined;
  const creator = typeof firstContributor?.name === "string"
    ? firstContributor.name
    : typeof brandObj?.displayValue === "string"
      ? brandObj.displayValue
      : null;

  const images = (item.images || item.Images || {}) as Record<string, unknown>;
  const primary = (images.primary || images.Primary || {}) as Record<string, unknown>;
  const primaryImage = normalizeImageResource(primary.large || primary.Large || primary.medium || primary.Medium);

  const variantsRaw = Array.isArray(images.variants) ? images.variants : Array.isArray(images.Variants) ? images.Variants : [];
  const variantImages = variantsRaw
    .map((v) => {
      const rec = v as Record<string, unknown>;
      return normalizeImageResource(rec.large || rec.Large || rec.medium || rec.Medium);
    })
    .filter((v): v is AmazonImageResource => v !== null)
    .slice(0, 4);

  const detailPageUrl = typeof item.detailPageURL === "string"
    ? item.detailPageURL
    : typeof item.DetailPageURL === "string"
      ? item.DetailPageURL
      : null;

  return {
    asin,
    marketplace,
    title,
    creator,
    detailPageUrl,
    primaryImage,
    variantImages,
    available: true,
    status: "ok",
    fetchedAt,
  };
}

export async function getCachedCatalogMap(
  env: AmazonCreatorsEnv,
  asins: string[],
  marketplace = env.AMAZON_MARKETPLACE?.trim() || "www.amazon.com",
): Promise<Map<string, CatalogItemMetadata>> {
  const result = new Map<string, CatalogItemMetadata>();
  if (!env.ORACLE_KV) return result;

  const now = Date.now();
  const unique = Array.from(new Set(asins.map((a) => a.trim().toUpperCase()).filter(isValidAsin)));

  await Promise.all(
    unique.map(async (asin) => {
      try {
        const entry = await env.ORACLE_KV!.get<CatalogItemMetadata>(itemCacheKey(marketplace, asin), "json");
        if (entry && typeof entry.fetchedAt === "number" && now - entry.fetchedAt < MAX_METADATA_AGE_MS) {
          result.set(asin, entry);
        }
      } catch {
        // Ignore individual KV read failures
      }
    }),
  );

  return result;
}

export async function fetchCatalogBatch(
  env: AmazonCreatorsEnv,
  asins: string[],
  options: {
    marketplace?: string;
    partnerTag?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<{
  items: Map<string, CatalogItemMetadata>;
  errorCode: string | null;
}> {
  const marketplace = options.marketplace || env.AMAZON_MARKETPLACE?.trim() || "www.amazon.com";
  const partnerTag = options.partnerTag || env.AMAZON_PARTNER_TAG?.trim() || "xelarindo-20";
  const fetchImpl = options.fetchImpl || fetch;
  const validAsins = Array.from(new Set(asins.map((a) => a.trim().toUpperCase()).filter(isValidAsin)));
  const items = new Map<string, CatalogItemMetadata>();

  if (validAsins.length === 0) {
    return { items, errorCode: null };
  }

  const tokenResult = await getCreatorsAccessToken(env, fetchImpl);
  if (!tokenResult.ok) {
    return { items, errorCode: tokenResult.errorCode };
  }

  let lastError: string | null = null;
  for (let i = 0; i < validAsins.length; i += MAX_ASINS_PER_BATCH) {
    const batch = validAsins.slice(i, i + MAX_ASINS_PER_BATCH);
    await waitForRateLimit();

    try {
      const response = await fetchWithRetry(
        CREATORS_API_CATALOG_URL,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenResult.accessToken}`,
            "Content-Type": "application/json",
            "x-marketplace": marketplace,
          },
          body: JSON.stringify({
            itemIds: batch,
            itemIdType: "ASIN",
            marketplace,
            partnerTag,
            resources: [
              "itemInfo.title",
              "itemInfo.byLineInfo",
              "images.primary.large",
              "images.primary.medium",
              "images.variants.large",
            ],
          }),
        },
        fetchImpl,
        2,
      );

      const payload = (await response.json().catch(() => ({}))) as {
        itemsResult?: { items?: unknown[] };
        errors?: Array<{ code?: string; message?: string }>;
      };

      if (!response.ok) {
        lastError = payload.errors?.[0]?.code || `catalog_http_${response.status}`;
        continue;
      }

      const now = Date.now();
      const returnedAsins = new Set<string>();
      for (const rawItem of payload.itemsResult?.items || []) {
        const parsed = parseCreatorsItem(rawItem, marketplace, now);
        if (parsed) {
          returnedAsins.add(parsed.asin);
          items.set(parsed.asin, parsed);
          if (env.ORACLE_KV) {
            await env.ORACLE_KV.put(itemCacheKey(marketplace, parsed.asin), JSON.stringify(parsed), {
              expirationTtl: KV_METADATA_TTL_SECONDS,
            }).catch(() => undefined);
          }
        }
      }

      if (payload.errors?.length) {
        lastError = payload.errors[0].code || "partial_catalog_error";
      }

      // Mark unreturned ASINs in this batch as unavailable for short diagnostic visibility
      for (const asin of batch) {
        if (!returnedAsins.has(asin)) {
          const unavailable: CatalogItemMetadata = {
            asin,
            marketplace,
            title: null,
            creator: null,
            detailPageUrl: null,
            primaryImage: null,
            variantImages: [],
            available: false,
            status: "unavailable",
            errorCode: lastError || "not_returned",
            fetchedAt: now,
          };
          items.set(asin, unavailable);
          if (env.ORACLE_KV) {
            await env.ORACLE_KV.put(itemCacheKey(marketplace, asin), JSON.stringify(unavailable), {
              expirationTtl: 3600,
            }).catch(() => undefined);
          }
        }
      }
    } catch {
      lastError = "catalog_network_error";
    }
  }

  return { items, errorCode: lastError };
}

export async function getCatalogHealth(
  env: AmazonCreatorsEnv,
  asins: string[],
): Promise<CatalogHealthSummary> {
  const version = env.AMAZON_CREDENTIAL_VERSION?.trim() || "3.1";
  const marketplace = env.AMAZON_MARKETPLACE?.trim() || "www.amazon.com";
  const cached = await getCachedCatalogMap(env, asins, marketplace);

  let withImageCount = 0;
  let unavailableCount = 0;
  let errorCount = 0;
  let lastError: string | null = null;

  for (const item of cached.values()) {
    if (item.primaryImage) withImageCount += 1;
    if (item.status === "unavailable") unavailableCount += 1;
    if (item.status === "error") errorCount += 1;
    if (item.errorCode) lastError = item.errorCode;
  }

  return {
    configured: hasCreatorsCredentials(env),
    version,
    marketplace,
    totalTracked: asins.length,
    cachedCount: cached.size,
    withImageCount,
    unavailableCount,
    errorCount,
    cacheTtlHours: KV_METADATA_TTL_SECONDS / 3600,
    lastError,
  };
}
