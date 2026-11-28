export type AffiliateChannel =
  | "website"
  | "instagram"
  | "facebook"
  | "pinterest"
  | "threads"
  | "tiktok"
  | "youtube";

export interface AffiliateConfig {
  defaultTag: string;
  marketplaceHost: string;
  disclosureText: string;
  channelTags: Partial<Record<AffiliateChannel, string>>;
}

export const DEFAULT_AFFILIATE_TAG = "xelarindo-20";
export const AMAZON_ASSOCIATES_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";

const ASIN_PATTERN = /^[A-Z0-9]{10}$/;
const APPROVED_AMAZON_HOSTS = new Set(["www.amazon.com"]);
const SEARCH_PARAM_KEYS = new Set(["k", "field-keywords", "url", "rh", "keywords", "ref_"]);
const APPROVED_BOUNTY_PATHS = new Set([
  "/hz/audible/mlp/membership/standard",
  "/hz/audible/mlp/membership/premiumplus",
  "/kindle-dbs/hz/signup",
  "/kindle-dbs/hz/subscribe/ku",
  "/amazonprime",
]);

function normalizeMarketplaceHost(rawHost?: string): string {
  const candidate = rawHost?.trim() || "https://www.amazon.com";
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error(`Invalid Amazon marketplace host: "${candidate}"`);
  }
  if (parsed.protocol !== "https:" || !APPROVED_AMAZON_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`Unsupported Amazon marketplace host: "${candidate}"`);
  }
  return `https://${parsed.hostname.toLowerCase()}`;
}

export function createAffiliateConfig(
  overrides: Partial<AffiliateConfig> = {},
): AffiliateConfig {
  const marketplaceHost = normalizeMarketplaceHost(overrides.marketplaceHost);
  const requestedDefault = overrides.defaultTag?.trim();
  // Enforce xelarindo-20 on www.amazon.com so env/overrides cannot silently hijack the primary tag.
  const defaultTag =
    marketplaceHost === "https://www.amazon.com"
      ? DEFAULT_AFFILIATE_TAG
      : requestedDefault || DEFAULT_AFFILIATE_TAG;
  return {
    defaultTag,
    marketplaceHost,
    disclosureText: overrides.disclosureText?.trim() || AMAZON_ASSOCIATES_DISCLOSURE,
    channelTags: overrides.channelTags || {},
  };
}

export function isValidAsin(asin: string): boolean {
  return ASIN_PATTERN.test(asin.trim().toUpperCase());
}

export function resolveAffiliateTag(
  channel: AffiliateChannel = "website",
  config: AffiliateConfig = createAffiliateConfig(),
): string {
  if (channel === "website" && config.marketplaceHost === "https://www.amazon.com") {
    return DEFAULT_AFFILIATE_TAG;
  }
  const channelTag = config.channelTags[channel]?.trim();
  return channelTag || config.defaultTag;
}

export function validateAmazonProductUrl(
  rawUrl: string,
  expectedTag = DEFAULT_AFFILIATE_TAG,
): { valid: boolean; reason?: string; asin?: string; tag?: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: "invalid_url" };
  }
  if (parsed.protocol !== "https:") return { valid: false, reason: "non_https" };
  if (!APPROVED_AMAZON_HOSTS.has(parsed.hostname.toLowerCase())) {
    return { valid: false, reason: "unsupported_marketplace" };
  }
  if (parsed.pathname === "/s" || parsed.pathname.startsWith("/gp/search")) {
    return { valid: false, reason: "search_page_url" };
  }
  for (const key of parsed.searchParams.keys()) {
    if (SEARCH_PARAM_KEYS.has(key.toLowerCase())) {
      return { valid: false, reason: `forbidden_search_param:${key}` };
    }
  }
  const dpMatch = parsed.pathname.match(/^\/dp\/([A-Z0-9]{10})$/);
  if (!dpMatch) return { valid: false, reason: "invalid_dp_path" };
  const tags = parsed.searchParams.getAll("tag");
  if (tags.length !== 1) return { valid: false, reason: "invalid_tag_count" };
  if (tags[0] !== expectedTag) return { valid: false, reason: `wrong_tag:${tags[0]}` };
  if (Array.from(parsed.searchParams.keys()).some((k) => k !== "tag")) {
    return { valid: false, reason: "unexpected_query_params" };
  }
  return { valid: true, asin: dpMatch[1], tag: tags[0] };
}

export function validateAmazonBountyUrl(
  rawUrl: string,
  expectedTag = DEFAULT_AFFILIATE_TAG,
): { valid: boolean; reason?: string; path?: string; tag?: string } {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { valid: false, reason: "invalid_url" };
  }
  if (parsed.protocol !== "https:") return { valid: false, reason: "non_https" };
  if (!APPROVED_AMAZON_HOSTS.has(parsed.hostname.toLowerCase())) {
    return { valid: false, reason: "unsupported_marketplace" };
  }
  if (!APPROVED_BOUNTY_PATHS.has(parsed.pathname)) {
    return { valid: false, reason: `unapproved_bounty_path:${parsed.pathname}` };
  }
  const tags = parsed.searchParams.getAll("tag");
  if (tags.length !== 1 || tags[0] !== expectedTag) {
    return { valid: false, reason: "invalid_bounty_tag" };
  }
  return { valid: true, path: parsed.pathname, tag: tags[0] };
}

export function buildAmazonProductUrl(
  asin: string,
  options: {
    channel?: AffiliateChannel;
    config?: AffiliateConfig;
    variantAsin?: string;
  } = {},
): string {
  const targetAsin = (options.variantAsin || asin).trim().toUpperCase();
  if (!isValidAsin(targetAsin)) {
    throw new Error(`Invalid Amazon ASIN: "${targetAsin}"`);
  }
  const config = options.config || createAffiliateConfig();
  const tag = resolveAffiliateTag(options.channel || "website", config);
  const url = new URL(`/dp/${targetAsin}`, config.marketplaceHost);
  url.searchParams.set("tag", tag);
  return url.toString();
}

export function affiliateLinkAttributes(
  asin: string,
  options: {
    channel?: AffiliateChannel;
    config?: AffiliateConfig;
    variantAsin?: string;
  } = {},
): {
  href: string;
  target: "_blank";
  rel: "nofollow sponsored noopener noreferrer";
} {
  return {
    href: buildAmazonProductUrl(asin, options),
    target: "_blank",
    rel: "nofollow sponsored noopener noreferrer",
  };
}

export function buildAmazonBountyUrl(
  path: string,
  options: {
    channel?: AffiliateChannel;
    config?: AffiliateConfig;
  } = {},
): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const config = options.config || createAffiliateConfig();
  const tag = resolveAffiliateTag(options.channel || "website", config);
  const url = new URL(cleanPath, config.marketplaceHost);
  url.searchParams.set("tag", tag);
  return url.toString();
}

export function bountyLinkAttributes(
  path: string,
  options: {
    channel?: AffiliateChannel;
    config?: AffiliateConfig;
  } = {},
): {
  href: string;
  target: "_blank";
  rel: "nofollow sponsored noopener noreferrer";
} {
  return {
    href: buildAmazonBountyUrl(path, options),
    target: "_blank",
    rel: "nofollow sponsored noopener noreferrer",
  };
}
