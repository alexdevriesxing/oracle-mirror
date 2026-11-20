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

export function createAffiliateConfig(
  overrides: Partial<AffiliateConfig> = {},
): AffiliateConfig {
  return {
    defaultTag: overrides.defaultTag?.trim() || DEFAULT_AFFILIATE_TAG,
    marketplaceHost: overrides.marketplaceHost?.trim() || "https://www.amazon.com",
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
  const channelTag = config.channelTags[channel]?.trim();
  return channelTag || config.defaultTag;
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
