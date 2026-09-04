const CANONICAL_HOST = "https://oraclemirror.com";
const PASS_DATE = "2026-09-04";
const RETIRED_EVENT_PATH = "/oracle-of-olympus";

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function setTitle(html: string, title: string): string {
  return html.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
}

function setMeta(html: string, attribute: "name" | "property", key: string, value: string): string {
  const escapedKey = escapeRegExp(key);
  const pattern = new RegExp(`<meta\\s+${attribute}="${escapedKey}"[^>]*>`, "s");
  const replacement = `<meta ${attribute}="${key}" content="${value}" />`;
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function setDescriptionFamily(html: string, description: string): string {
  let output = setMeta(html, "name", "description", description);
  output = setMeta(output, "property", "og:description", description);
  output = setMeta(output, "name", "twitter:description", description);
  return output;
}

function setTitleFamily(html: string, title: string): string {
  let output = setTitle(html, title);
  output = setMeta(output, "property", "og:title", title);
  output = setMeta(output, "name", "twitter:title", title);
  return output;
}

export function rewriteHtmlFreshness(html: string, pathname: string): string {
  const path = normalizePath(pathname);
  let output = html;

  if (path === "/") {
    output = setTitleFamily(output, "Free Tarot, Horoscopes & Mystical Readings | Oracle Mirror");
    output = setDescriptionFamily(
      output,
      "Explore free tarot readings, daily horoscopes, dream interpretation, numerology, crystal ball guidance, love compatibility, birth charts, palmistry, and I Ching inside Oracle Mirror."
    );
  }

  if (path === "/archive") {
    output = setMeta(output, "name", "robots", "noindex,follow");
  }

  return output;
}

function transformUrlBlock(block: string): string {
  const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? "";
  if (loc === `${CANONICAL_HOST}/archive`) return "";
  if (loc === `${CANONICAL_HOST}${RETIRED_EVENT_PATH}` || loc.startsWith(`${CANONICAL_HOST}${RETIRED_EVENT_PATH}/`)) return "";
  if (loc === `${CANONICAL_HOST}/`) {
    return block.replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${PASS_DATE}</lastmod>`);
  }
  return block;
}

export function rewriteSitemapFreshness(xml: string): string {
  return xml.replace(/\s*<url>[\s\S]*?<\/url>/g, (block) => {
    const transformed = transformUrlBlock(block.trim());
    return transformed ? `\n${transformed}` : "";
  });
}

export function isRetiredEventPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === RETIRED_EVENT_PATH
    || path.startsWith(`${RETIRED_EVENT_PATH}/`)
    || path === "/api/oracle-of-olympus/matches"
    || path === "/api/oracle-of-olympus/predict";
}

export function isHtmlResponse(response: Response): boolean {
  return (response.headers.get("content-type") || "").includes("text/html");
}

export function isSitemapResponse(pathname: string, response: Response): boolean {
  return normalizePath(pathname) === "/sitemap.xml" && response.ok;
}
