const CANONICAL_HOST = "https://oraclemirror.com";
const PASS_DATE = "2026-09-04";
const OLYMPUS_PATH = "/oracle-of-olympus";

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

function rewriteJsonLdWithoutOlympus(html: string): string {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g, (full, rawJson) => {
    try {
      const data = JSON.parse(rawJson);
      if (data?.["@type"] === "ItemList" && Array.isArray(data.itemListElement)) {
        data.itemListElement = data.itemListElement
          .filter((item: { url?: string }) => !item?.url?.includes(OLYMPUS_PATH))
          .map((item: Record<string, unknown>, index: number) => ({ ...item, position: index + 1 }));
        return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
      }
    } catch {
      // Preserve hand-authored JSON-LD formatting when it is not parseable here.
    }
    return full;
  });
}

function removeOlympusLinks(html: string): string {
  // Removes navigation, homepage card, footer link, and any other direct public
  // entry points to the retired feature. The underlying legacy DOM may remain
  // temporarily during the monolith decomposition, but there is no public route.
  return html.replace(/<a\b[^>]*href="\/oracle-of-olympus"[^>]*>[\s\S]*?<\/a>/g, "");
}

export function rewriteHtmlFreshness(html: string, pathname: string): string {
  const path = normalizePath(pathname);
  let output = removeOlympusLinks(rewriteJsonLdWithoutOlympus(html));

  if (path === "/") {
    const title = "Free Tarot, Horoscopes & Mystical Readings | Oracle Mirror";
    const description =
      "Explore free tarot readings, daily horoscopes, dream interpretation, numerology, crystal ball guidance, love compatibility, birth charts, palmistry, and I Ching inside Oracle Mirror.";
    output = setTitleFamily(output, title);
    output = setDescriptionFamily(output, description);
    output = output
      .replace(
        "Free interactive tarot readings, daily horoscopes, numerology, crystal ball answers, love compatibility, AI Soulmate Vision, and World Cup 2026 match predictions.",
        "Free interactive tarot readings, daily horoscopes, dream interpretation, numerology, crystal ball answers, love compatibility, birth charts, palmistry, I Ching, and AI Soulmate Vision."
      )
      .replace(
        "Seekers can consult ten mystical realms: Madame Fortuna's Crystal Ball, Astaria's Western Zodiac horoscope, Master Longwei's Chinese Zodiac Jade Pavilion, Seraphina's Tarot drawing, Rosalind's Love compatibility oracle, the new Temple of Matches (Love Match), the Cosmic Magic 8 Ball arcade, Pythius's life path Numerology calculator, and the Dawn Oracle's Daily Fortune scroll.",
        "Oracle Mirror offers crystal ball readings, dream interpretation, Western and Chinese zodiac guidance, Tarot, the Love Oracle and compatibility tools, Magic 8 Ball, numerology, daily fortunes, birth charts, palmistry, and I Ching."
      );
  }

  // The private browser journal is useful product UI, not a public search
  // landing page. Keep its internal links crawlable while removing it from the index.
  if (path === "/archive") {
    output = setMeta(output, "name", "robots", "noindex,follow");
  }

  return output;
}

function transformUrlBlock(block: string): string {
  const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? "";

  if (loc === `${CANONICAL_HOST}/archive`) return "";
  if (loc === `${CANONICAL_HOST}${OLYMPUS_PATH}` || loc.startsWith(`${CANONICAL_HOST}${OLYMPUS_PATH}/`)) {
    return "";
  }

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

export function rewriteLlmsFreshness(text: string): string {
  let output = text
    .replace(/, and FIFA World Cup 2026 match predictions from the Oracle of Olympus/g, "")
    .replace(/, and a retrospective FIFA World Cup 2026 prediction archive from the Oracle of Olympus/g, "")
    .replace(/\n- \[World Cup 2026[^\n]*\n/g, "\n")
    .replace(/\n## World Cup 2026[^\n]*\n[\s\S]*?(?=\n## Key Facts)/, "\n")
    .replace(/\n- \[Oracle of Olympus[^\n]*\n/g, "\n");

  // Safety net for generated group links should upstream wording change.
  output = output
    .split("\n")
    .filter((line) => !line.includes(OLYMPUS_PATH))
    .join("\n");

  return output;
}

export function isRemovedWorldCupPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === OLYMPUS_PATH
    || path.startsWith(`${OLYMPUS_PATH}/`)
    || path === "/api/oracle-of-olympus/matches"
    || path === "/api/oracle-of-olympus/predict";
}

export function isHtmlResponse(response: Response): boolean {
  return (response.headers.get("content-type") || "").includes("text/html");
}

export function isSitemapResponse(pathname: string, response: Response): boolean {
  return normalizePath(pathname) === "/sitemap.xml" && response.ok;
}

export function isLlmsResponse(pathname: string, response: Response): boolean {
  return normalizePath(pathname) === "/llms.txt" && response.ok;
}
