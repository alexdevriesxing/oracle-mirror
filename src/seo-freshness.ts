const CANONICAL_HOST = "https://oraclemirror.com";
const PASS_DATE = "2026-09-04";
const WORLD_CUP_FINAL_DATE = "2026-07-19";

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

  // Keep the evergreen homepage focused on Oracle Mirror's core divination
  // experience. The World Cup remains accessible as a historical archive, but
  // is no longer promoted as a live/current feature.
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
      .replace("&#9889; World Cup Oracle", "&#9889; 2026 Archive")
      .replace(/World Cup 2026 Predictions/g, "World Cup 2026 Prediction Archive")
      .replace(
        "Seekers can consult ten mystical realms: Madame Fortuna's Crystal Ball, Astaria's Western Zodiac horoscope, Master Longwei's Chinese Zodiac Jade Pavilion, Seraphina's Tarot drawing, Rosalind's Love compatibility oracle, the new Temple of Matches (Love Match), the Cosmic Magic 8 Ball arcade, Pythius's life path Numerology calculator, and the Dawn Oracle's Daily Fortune scroll.",
        "Oracle Mirror spans crystal ball readings, dream interpretation, Western and Chinese zodiac guidance, Tarot, the Love Oracle and compatibility tools, Magic 8 Ball, numerology, daily fortunes, birth charts, palmistry, I Ching, and the Oracle of Olympus prediction archive."
      );
  }

  // The private browser journal is useful product UI, not a public search
  // landing page. Keep links crawlable while removing the shell from indexing.
  if (path === "/archive") {
    output = setMeta(output, "name", "robots", "noindex,follow");
  }

  if (path === "/oracle-of-olympus") {
    const title = "World Cup 2026 Prediction Archive — Oracle of Olympus | Oracle Mirror";
    const description =
      "Explore Oracle Mirror's archived FIFA World Cup 2026 group-stage predictions, predicted scores, win probabilities, oracle analysis, and final results where available.";
    output = setTitleFamily(output, title);
    output = setDescriptionFamily(output, description);
    output = output
      .replace(/World Cup 2026 Predictions/g, "World Cup 2026 Prediction Archive")
      .replace(/Mystical Sports Predictions/g, "Prediction Archive")
      .replace(
        "Free FIFA World Cup 2026 predictions for all 72 group stage matches — predicted scores, win probabilities, and oracle prophecies, refreshed automatically throughout the tournament. Select a fixture to view its statistical mirror and summon the oracle's prophecy.",
        "A retrospective archive of Oracle Mirror's FIFA World Cup 2026 predictions for all 72 group-stage matches — predicted scores, win probabilities, oracle prophecies, and final results where available. Select a fixture to compare what the mirror foresaw with what happened."
      )
      .replace(
        "Fixtures and statuses refresh automatically throughout the tournament.",
        "The archive preserves all 72 group-stage prediction pages alongside final results where available."
      )
      .replace(
        "Updated throughout the tournament.",
        "Preserved as a post-tournament archive."
      )
      .replace(
        "How does Oracle Mirror predict World Cup 2026 matches?",
        "How did Oracle Mirror predict World Cup 2026 matches?"
      )
      .replace(
        "Does Oracle Mirror cover every World Cup 2026 group stage match?",
        "Does the archive cover every World Cup 2026 group-stage match?"
      );
  }

  if (path.startsWith("/oracle-of-olympus/")) {
    output = output
      .replace(/<title>(.*?) Prediction — (.*?)<\/title>/s, "<title>$1 Archived Prediction — $2</title>")
      .replace(/content="([^"]*?) FIFA World Cup 2026 ([^"]*?) prediction:/g, 'content="$1 FIFA World Cup 2026 $2 archived prediction:')
      .replace(/AI oracle analysis\./g, "AI oracle analysis preserved for retrospective comparison.")
      .replace(
        '"eventStatus":"https://schema.org/EventScheduled"',
        '"eventStatus":"https://schema.org/EventCompleted"'
      );
  }

  return output;
}

function transformUrlBlock(block: string): string {
  const loc = block.match(/<loc>(.*?)<\/loc>/)?.[1] ?? "";

  if (loc === `${CANONICAL_HOST}/archive`) return "";

  if (loc === `${CANONICAL_HOST}/oracle-of-olympus`) {
    return block
      .replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${PASS_DATE}</lastmod>`)
      .replace(/<changefreq>.*?<\/changefreq>/, "<changefreq>monthly</changefreq>");
  }

  if (loc.startsWith(`${CANONICAL_HOST}/oracle-of-olympus/`)) {
    return block
      .replace(/<lastmod>.*?<\/lastmod>/, `<lastmod>${WORLD_CUP_FINAL_DATE}</lastmod>`)
      .replace(/<changefreq>.*?<\/changefreq>/, "<changefreq>yearly</changefreq>")
      .replace(/<priority>0\.6<\/priority>/, "<priority>0.5</priority>");
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
  return text
    .replace(
      "and FIFA World Cup 2026 match predictions from the Oracle of Olympus.",
      "and a retrospective FIFA World Cup 2026 prediction archive from the Oracle of Olympus."
    )
    .replace(
      /- \[World Cup 2026 Predictions\]\(https:\/\/oraclemirror\.com\/oracle-of-olympus\):[^\n]*/,
      "- [World Cup 2026 Prediction Archive](https://oraclemirror.com/oracle-of-olympus): Retrospective archive of all 72 group-stage predictions with predicted scores, win probabilities, confidence levels, oracle analysis, and final results where available."
    )
    .replace(
      "## World Cup 2026 Predictions (Oracle of Olympus)",
      "## World Cup 2026 Prediction Archive (Oracle of Olympus)"
    )
    .replace(
      "Every group stage match has its own prediction page with a predicted score, win/draw probabilities, confidence level, statistical reasoning, and an optional AI prophecy. Predictions are entertainment, not betting advice. Completed matches show the real final score.",
      "The archive preserves a prediction page for every group-stage match, including the original predicted score, win/draw probabilities, confidence level, statistical reasoning, optional AI prophecy, and final score where available. Predictions were entertainment, not betting advice."
    )
    .replace(/refreshed automatically during the tournament\./g, "preserved after the tournament for retrospective comparison.");
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
