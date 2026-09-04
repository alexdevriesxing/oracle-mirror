from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def write(path: str, text: str) -> None:
    (ROOT / path).write_text(text, encoding="utf-8")


def must_sub(text: str, pattern: str, replacement: str, label: str, flags: int = 0, count: int = 1) -> str:
    result, changed = re.subn(pattern, replacement, text, count=count, flags=flags)
    if changed != count:
        raise RuntimeError(f"{label}: expected {count} replacement(s), got {changed}")
    return result


def strip_line(text: str, literal: str, label: str) -> str:
    if literal not in text:
        raise RuntimeError(f"{label}: missing expected line {literal!r}")
    return text.replace(literal, "", 1)


# ---------------------------------------------------------------------------
# Worker source
# ---------------------------------------------------------------------------
index = read("src/index.ts")
for line, label in [
    ('import { WC2026_GROUP_FIXTURES, fixtureMatchId, deriveMatchStatus } from "./olympus-data.ts";\n', "fixture import"),
    ('import type { MatchData } from "./olympus-data.ts";\n', "match type import"),
    ('import { getOlympusMatches, syncOlympusFixtures } from "./olympus-sync.ts";\n', "sync import"),
    ('export { deriveMatchStatus } from "./olympus-data.ts";\n', "fixture export"),
    ('export type { MatchData, MatchStatus, Probabilities } from "./olympus-data.ts";\n', "match type export"),
    ('  ORACLE_KV?: KVNamespace;\n', "KV env"),
    ('  CLOUDFLARE_ACCOUNT_ID?: string;\n', "provider account env"),
    ('  CLOUDFLARE_AI_GATEWAY_ID?: string;\n', "provider gateway env"),
    ('  AI_PROVIDER?: string;\n', "provider env"),
    ('  AI_MODEL?: string;\n', "provider model env"),
    ('  AI_API_KEY?: string;\n', "provider key env"),
    ('  FOOTBALL_DATA_API_KEY?: string;\n', "football env"),
    ('  ORACLE_ALLOWED_ORIGIN?: string;\n', "prediction CORS env"),
    ('  ORACLE_CACHE_TTL_SECONDS?: string;\n', "prediction cache env"),
    ('  "/oracle-of-olympus": "World Cup 2026 Predictions",\n', "breadcrumb entry"),
    ('  "/oracle-of-olympus": "olympus",\n', "page route entry"),
    ('  olympus: "page-olympus",\n', "page section entry"),
    ('  ["/oracle-of-olympus", "World Cup 2026 Predictions"],\n', "home realm card entry"),
]:
    index = strip_line(index, line, label)

index = index.replace(
    "Get free tarot card readings, daily horoscopes, numerology, crystal ball answers, love compatibility, AI Soulmate Vision, and World Cup 2026 predictions — all inside Oracle Mirror.",
    "Get free tarot card readings, daily horoscopes, dream interpretation, numerology, crystal ball guidance, love compatibility, birth charts, palmistry, and I Ching — all inside Oracle Mirror.",
)

index = must_sub(
    index,
    r'\n  "/oracle-of-olympus": \{[\s\S]*?\n  \},(?=\n  "/birth-chart")',
    "",
    "retired APP_ROUTES block",
)
index = must_sub(
    index,
    r'\nfunction olympusMatchMeta\([\s\S]*?(?=// Mirrors the visible FAQ rendered in the dream-interpreter section)',
    "\n",
    "retired SSR/structured-data functions",
)

index = must_sub(
    index,
    r'async function serveAppShell\(\n  request: Request,\n  env: Env,\n  pathname: string,\n  meta: AppRouteMeta,\n  olympusMatch\?: MatchData,\n  allMatches\?: Record<string, MatchData>\n\)',
    'async function serveAppShell(\n  request: Request,\n  env: Env,\n  pathname: string,\n  meta: AppRouteMeta\n)',
    "serveAppShell signature",
)
index = index.replace(
    "  // The static shell carries the home-page FAQPage schema; Google allows only\n"
    "  // one FAQPage per URL, so swap it out on Olympus routes (landing gets the\n"
    "  // football FAQ, match pages get none — SportsEvent is the star there).\n",
    "  // The static shell carries the home-page FAQPage schema; route-specific\n"
    "  // realms replace it with their own visible FAQ where appropriate.\n",
)
index = strip_line(index, '  const isOlympusLanding = normalized === "/oracle-of-olympus";\n', "Olympus landing flag")
index = must_sub(
    index,
    r'\n  if \(isOlympusLanding \|\| olympusMatch\) \{[\s\S]*?\n  const headers = new Headers\(response\.headers\);',
    '\n  const headers = new Headers(response.headers);',
    "Olympus serveAppShell branches",
)
index = must_sub(
    index,
    r'\n    \.concat\(\n      WC2026_GROUP_FIXTURES\.map\([\s\S]*?\n    \)\n    \.join\("\\n"\);',
    '\n    .join("\\n");',
    "World Cup sitemap expansion",
)

llms = '''function llmsTxtResponse(): Response {
  return new Response(`# Oracle Mirror

> Oracle Mirror (https://oraclemirror.com) is a free, interactive fortune-telling site. Visitors can explore tarot readings, daily horoscopes, Chinese zodiac fortunes, numerology life path readings, crystal ball guidance, dream interpretation, palm readings, I Ching consultations, birth chart interpretations, love compatibility, and an AI-generated Soulmate Vision portrait. Readings are generated on demand, free to use, and saved only in the visitor's own browser. The site is for entertainment purposes.

## Readings

- [Crystal Ball Reading](https://oraclemirror.com/crystal-ball): Ask Madame Fortuna a question and receive a poetic, personalized prophecy.
- [Dream Interpretation](https://oraclemirror.com/dream-interpreter): Describe a dream to Morpheus Vey, who asks clarifying questions before offering an interpretation grounded in classic dream symbolism.
- [Dream Symbols & Meanings](https://oraclemirror.com/dreams): A dream dictionary with dedicated guides for common symbols and reflection questions.
- [Daily Horoscope](https://oraclemirror.com/western-zodiac): Pick one of the 12 zodiac signs for a horoscope covering love, career, health, and a lucky number.
- [Chinese Zodiac](https://oraclemirror.com/chinese-zodiac): Enter a birth year to find the matching zodiac animal and receive a fortune on personality, destiny, and compatibility.
- [Tarot Reading](https://oraclemirror.com/tarot): Draw a free 3-card Past-Present-Future spread from the Major Arcana.
- [Magic 8 Ball](https://oraclemirror.com/magic-8-ball): Instant yes-or-no answers with a mystical elaboration.
- [Numerology](https://oraclemirror.com/numerology): Calculate a life path number from a birth date, including master numbers 11, 22, and 33.
- [Daily Fortune](https://oraclemirror.com/daily-fortune): A daily cosmic theme, advice, lucky number, color, element, and affirmation.
- [Love Compatibility](https://oraclemirror.com/love-match): Zodiac, numerology, tarot, quiz, and omen frameworks combine into a Cosmic Chemistry Score plus Soulmate Vision.
- [Love Oracle](https://oraclemirror.com/love-oracle): Ask Rosalind a relationship question about romance, compatibility, timing, or emotional uncertainty.
- [Birth Chart](https://oraclemirror.com/birth-chart): Sun, Moon, Ascendant, Mercury, Venus, and Mars placements with an interpretation.
- [Palm Reading](https://oraclemirror.com/palm-reading): Palmistry reading of the heart, head, life, and fate lines.
- [I Ching](https://oraclemirror.com/iching-oracle): Cast three coins six times to build a hexagram and consult the Book of Changes.

## Key Facts

- All readings are free; no account or sign-up is required.
- Reading history is stored only in the visitor's browser (localStorage).
- Readings are AI-assisted, presented through fortune-teller personas, and intended for entertainment.
- Canonical host: https://oraclemirror.com (www redirects here).

## Pages

- [Meet the Mystics](https://oraclemirror.com/mystics): The personas behind each realm.
- [Privacy Policy](https://oraclemirror.com/privacy-policy)
- [Contact](https://oraclemirror.com/contact)
`, {
    headers: { "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": "public, max-age=3600" },
  });
}

'''
index = must_sub(
    index,
    r'function llmsTxtResponse\([\s\S]*?(?=const MADAME_FORTUNA_SYSTEM)',
    llms,
    "llms World Cup content",
)

index = must_sub(
    index,
    r'function checkAllowedOrigin\([\s\S]*?(?=export default \{)',
    "",
    "prediction-only backend helpers and handler",
)
index = must_sub(
    index,
    r'    if \(url\.pathname === "/llms\.txt"\) \{\n      const stored = await getOlympusMatches\(env\);\n      return llmsTxtResponse\(stored\.matches\);\n    \}',
    '    if (url.pathname === "/llms.txt") {\n      return llmsTxtResponse();\n    }',
    "llms route",
)
index = must_sub(
    index,
    r'\n      if \(url\.pathname === "/api/oracle-of-olympus/matches"\) \{[\s\S]*?\n      if \(request\.method !== "POST"\)',
    '\n      if (request.method !== "POST")',
    "retired API routes",
)
index = must_sub(
    index,
    r'\n    if \(normalizedPath === "/oracle-of-olympus"\) \{[\s\S]*?\n    // Server-rendered dream symbol guide pages',
    '\n    // Server-rendered dream symbol guide pages',
    "retired public routes",
)
index = must_sub(
    index,
    r',\n\n  async scheduled\(_controller: ScheduledController, env: Env, ctx: ExecutionContext\): Promise<void> \{\n    ctx\.waitUntil\(syncOlympusFixtures\(env\)\);\n  \},\n\} satisfies ExportedHandler<Env>;',
    '\n} satisfies ExportedHandler<Env>;',
    "legacy scheduled sync",
)

for forbidden in ["olympus", "World Cup 2026", "WC2026", "FOOTBALL_DATA", "Pythia Nikephoros", "sports predictions"]:
    if forbidden.lower() in index.lower():
        raise RuntimeError(f"src/index.ts still contains retired marker: {forbidden}")
write("src/index.ts", index)

# ---------------------------------------------------------------------------
# Client application
# ---------------------------------------------------------------------------
script = read("public/script.js")
for line, label in [
    ('  olympus: "/oracle-of-olympus",\n', "client route"),
    ('  "olympus",\n', "realm set"),
]:
    script = strip_line(script, line, label)
script = must_sub(
    script,
    r'\n  olympus: \{\n    title: "Oracle of Olympus \| Mystical Sports Predictions \| Oracle Mirror",\n    description: "Summon Pythia Nikephoros for divine verdicts, omens, and football match outcomes\.",\n  \},',
    "",
    "client Olympus metadata",
)
script = must_sub(
    script,
    r'\n  if \(normalized\.startsWith\("/oracle-of-olympus"\)\) \{[\s\S]*?\n  \}',
    "",
    "client retired route parser",
)
script = must_sub(
    script,
    r'  const targetId = pageId === "olympus" \? "page-olympus" : `page-\$\{pageId\}`;',
    '  const targetId = `page-${pageId}`;',
    "client target id",
)
script = must_sub(
    script,
    r'  const routePath = options\.routePath\n    \|\| \(options\.matchId\n      \? `/oracle-of-olympus/\$\{options\.matchId\}`\n      : \(isResult \? RESULT_ROUTE_BY_REALM\[pageId\] : ROUTE_BY_PAGE\[pageId\] \|\| "/"\)\);',
    '  const routePath = options.routePath || (isResult ? RESULT_ROUTE_BY_REALM[pageId] : ROUTE_BY_PAGE[pageId] || "/");',
    "client route construction",
)
script = must_sub(
    script,
    r'\n  if \(pageId === "olympus" && options\.matchId\) \{[\s\S]*?\n  if \(pageId === "love-match"',
    '\n  if (pageId === "love-match"',
    "client match page branches",
)
script = script.replace('    matchId: route.matchId,\n', '')
script = must_sub(
    script,
    r'\n  if \(route\.pageId === "olympus"\) \{[\s\S]*?\n  \}',
    "",
    "popstate Olympus branch",
)
script = must_sub(
    script,
    r'\n// =========================================================\n// ORACLE OF OLYMPUS \(Mystical Sports Predictions\)\n// =========================================================[\s\S]*?(?=\n// --- Boot ---)',
    "\n",
    "client sports feature section",
)
script = must_sub(
    script,
    r'\n// Olympus events wireup[\s\S]*?(?=\nconst initialRoute = getRouteState\(\);)',
    "\n",
    "client Olympus boot wiring",
)
script = script.replace('  matchId: initialRoute.matchId,\n', '')
script = must_sub(
    script,
    r'\nif \(initialRoute\.pageId === "olympus"\) \{[\s\S]*?\n\}',
    "",
    "client initial Olympus route",
)
for forbidden in ["olympus", "World Cup 2026", "Pythia Nikephoros", "sports predictions"]:
    if forbidden.lower() in script.lower():
        raise RuntimeError(f"public/script.js still contains retired marker: {forbidden}")
write("public/script.js", script)

# ---------------------------------------------------------------------------
# Static HTML
# ---------------------------------------------------------------------------
html = read("public/index.html")
old_description = "Get free tarot card readings, daily horoscopes, numerology, crystal ball answers, love compatibility, AI Soulmate Vision, and World Cup 2026 predictions — all inside Oracle Mirror."
new_description = "Explore free tarot readings, daily horoscopes, dream interpretation, numerology, crystal ball guidance, love compatibility, birth charts, palmistry, I Ching, and AI Soulmate Vision inside Oracle Mirror."
html = html.replace(old_description, new_description)
html = html.replace(
    '"description": "Free interactive tarot readings, daily horoscopes, numerology, crystal ball answers, love compatibility, AI Soulmate Vision, and World Cup 2026 match predictions.",',
    '"description": "Free interactive tarot readings, daily horoscopes, dream interpretation, numerology, crystal ball guidance, love compatibility, birth charts, palmistry, I Ching, and AI Soulmate Vision.",',
)
html = re.sub(r'^\s*<a href="/oracle-of-olympus" class="dropdown-item"[^\n]*\n', '', html, flags=re.M)
html = re.sub(r'^\s*<a href="/oracle-of-olympus" class="nav-link[^\n]*\n', '', html, flags=re.M)
html = must_sub(
    html,
    r'\n\s*<a href="/oracle-of-olympus" class="card card-olympus"[\s\S]*?</a>',
    "",
    "homepage retired card",
)
html = must_sub(
    html,
    r'\n    <!-- ===== ORACLE OF OLYMPUS \(Mystical Sports Predictions\) ===== -->[\s\S]*?(?=\n    <aside\n      class="oracle-ad oracle-ad-footer")',
    "",
    "retired HTML realm",
)
html = re.sub(r'^\s*<a href="/oracle-of-olympus" data-nav="olympus">[^\n]*\n', '', html, flags=re.M)
for forbidden in ["olympus", "World Cup 2026", "Pythia Nikephoros", "sports predictions"]:
    if forbidden.lower() in html.lower():
        raise RuntimeError(f"public/index.html still contains retired marker: {forbidden}")
write("public/index.html", html)

# ---------------------------------------------------------------------------
# CSS dedicated to the retired realm
# ---------------------------------------------------------------------------
css = read("public/styles.css")
css = must_sub(
    css,
    r'/\* =========================================================\n   ORACLE OF OLYMPUS \(Mystical Sports Predictions\)\n   ========================================================= \*/[\s\S]*?(?=/\* =========================================================\n   DREAM INTERPRETER)',
    "",
    "retired sports CSS",
)
for forbidden in ["olympus", "sports predictions"]:
    if forbidden.lower() in css.lower():
        raise RuntimeError(f"public/styles.css still contains retired marker: {forbidden}")
write("public/styles.css", css)

# ---------------------------------------------------------------------------
# SSR route map and documentation comments
# ---------------------------------------------------------------------------
ssr = read("src/ssr-shell.ts")
ssr = strip_line(ssr, '  "page-olympus",\n', "SSR page id")
ssr = strip_line(ssr, '  if (path === "/oracle-of-olympus" || path.startsWith("/oracle-of-olympus/")) return "page-olympus";\n', "SSR retired path")
write("src/ssr-shell.ts", ssr)

realm = read("src/realm-content.ts")
realm = realm.replace(
    "// medical/legal/financial claims. Dream Interpreter and Oracle of Olympus keep\n",
    "// medical/legal/financial claims. Dream Interpreter keeps\n",
)
write("src/realm-content.ts", realm)

# ---------------------------------------------------------------------------
# Retired route tombstone: keep only the historical URL signal needed for 410s.
# ---------------------------------------------------------------------------
seo = '''const CANONICAL_HOST = "https://oraclemirror.com";
const PASS_DATE = "2026-09-04";
const RETIRED_EVENT_PATH = "/oracle-of-olympus";

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&");
}

function setTitle(html: string, title: string): string {
  return html.replace(/<title>.*?<\\/title>/s, `<title>${title}</title>`);
}

function setMeta(html: string, attribute: "name" | "property", key: string, value: string): string {
  const escapedKey = escapeRegExp(key);
  const pattern = new RegExp(`<meta\\\\s+${attribute}="${escapedKey}"[^>]*>`, "s");
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
  const loc = block.match(/<loc>(.*?)<\\/loc>/)?.[1] ?? "";
  if (loc === `${CANONICAL_HOST}/archive`) return "";
  if (loc === `${CANONICAL_HOST}${RETIRED_EVENT_PATH}` || loc.startsWith(`${CANONICAL_HOST}${RETIRED_EVENT_PATH}/`)) return "";
  if (loc === `${CANONICAL_HOST}/`) {
    return block.replace(/<lastmod>.*?<\\/lastmod>/, `<lastmod>${PASS_DATE}</lastmod>`);
  }
  return block;
}

export function rewriteSitemapFreshness(xml: string): string {
  return xml.replace(/\\s*<url>[\\s\\S]*?<\\/url>/g, (block) => {
    const transformed = transformUrlBlock(block.trim());
    return transformed ? `\\n${transformed}` : "";
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
'''
write("src/seo-freshness.ts", seo)

v2 = read("src/v2-index.ts")
v2 = v2.replace("  isLlmsResponse,\n  isRemovedWorldCupPath,\n", "  isRetiredEventPath,\n")
v2 = v2.replace("  rewriteLlmsFreshness,\n", "")
v2 = v2.replace("function removedWorldCupResponse(request: Request): Response {", "function removedLegacyEventResponse(request: Request): Response {")
v2 = must_sub(
    v2,
    r'\n  if \(isLlmsResponse\(url\.pathname, response\)\) \{[\s\S]*?\n  \}',
    "",
    "legacy llms freshness transform",
)
v2 = v2.replace("if (isRemovedWorldCupPath(url.pathname)) {\n      return withSecurityHeaders(removedWorldCupResponse(request));", "if (isRetiredEventPath(url.pathname)) {\n      return withSecurityHeaders(removedLegacyEventResponse(request));")
write("src/v2-index.ts", v2)

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
ssr_test = read("tests/ssr-shell.test.ts")
ssr_test = ssr_test.replace('    <section id="page-olympus" class="page realm-page"><h2>Olympus Only</h2></section>\n', '')
ssr_test = ssr_test.replace('  assert.equal(pageSectionIdForPath("/oracle-of-olympus/canada-vs-mexico"), "page-olympus");\n', '')
ssr_test = ssr_test.replace('  assert.doesNotMatch(html, /Olympus Only/);\n', '')
write("tests/ssr-shell.test.ts", ssr_test)

seo_test = '''import test from "node:test";
import assert from "node:assert/strict";
import {
  isRetiredEventPath,
  rewriteHtmlFreshness,
  rewriteSitemapFreshness,
} from "../src/seo-freshness.ts";

const evergreenHome = `<!doctype html><html><head>
<title>Old title</title>
<meta name="description" content="Old description" />
<meta name="robots" content="index,follow,max-image-preview:large" />
<meta property="og:title" content="Old title" />
<meta property="og:description" content="Old description" />
<meta name="twitter:title" content="Old title" />
<meta name="twitter:description" content="Old description" />
</head><body><a href="/tarot">Tarot</a></body></html>`;

test("homepage freshness uses evergreen mystical positioning", () => {
  const html = rewriteHtmlFreshness(evergreenHome, "/");
  assert.match(html, /Free Tarot, Horoscopes & Mystical Readings \| Oracle Mirror/);
  assert.match(html, /dream interpretation/);
  assert.match(html, /birth charts/);
});

test("private archive is noindex,follow", () => {
  const html = rewriteHtmlFreshness(evergreenHome, "/archive");
  assert.match(html, /name="robots" content="noindex,follow"/);
});

test("sitemap omits private archive and defensive tombstone URLs", () => {
  const xml = `<urlset>
<url><loc>https://oraclemirror.com/</loc><lastmod>2026-07-09</lastmod></url>
<url><loc>https://oraclemirror.com/archive</loc><lastmod>2026-07-09</lastmod></url>
<url><loc>https://oraclemirror.com/oracle-of-olympus</loc><lastmod>2026-07-09</lastmod></url>
<url><loc>https://oraclemirror.com/tarot</loc><lastmod>2026-07-09</lastmod></url>
</urlset>`;
  const output = rewriteSitemapFreshness(xml);
  assert.match(output, /<lastmod>2026-09-04<\/lastmod>/);
  assert.match(output, /\/tarot/);
  assert.doesNotMatch(output, /\/archive/);
  assert.doesNotMatch(output, /oracle-of-olympus/);
});

test("historical event URLs remain explicit 410 tombstones", () => {
  assert.equal(isRetiredEventPath("/oracle-of-olympus"), true);
  assert.equal(isRetiredEventPath("/oracle-of-olympus/old-match"), true);
  assert.equal(isRetiredEventPath("/api/oracle-of-olympus/matches"), true);
  assert.equal(isRetiredEventPath("/api/oracle-of-olympus/predict"), true);
  assert.equal(isRetiredEventPath("/tarot"), false);
});
'''
write("tests/seo-freshness.test.ts", seo_test)

# Dedicated prediction engine tests and source modules are removed outright.
for path in ["tests/prediction.test.ts", "src/olympus-data.ts", "src/olympus-sync.ts"]:
    target = ROOT / path
    if not target.exists():
        raise RuntimeError(f"expected retired file missing before migration: {path}")
    target.unlink()

# Pass-1 historical notes should describe the current architecture, not a retired backlog item.
pass1 = read("docs/V2-PASS-1.md")
pass1 = pass1.replace("2. The established handler still performs metadata, FAQ, dream, and Olympus SSR enrichment.\n", "2. The established handler performs metadata, FAQ, and dream SSR enrichment.\n")
pass1 = pass1.replace("- A direct `/tarot` response does not contain the Numerology, Love Match, Dream, or Olympus page bodies.\n", "- A direct `/tarot` response does not contain the Numerology, Love Match, or Dream page bodies.\n")
pass1 = re.sub(r'\n- convert Oracle of Olympus to a World Cup 2026 prediction archive;\n', '\n', pass1)
write("docs/V2-PASS-1.md", pass1)

# Current README: concise operational truth for V2.
readme = '''# Oracle Mirror

Oracle Mirror is a fantasy-themed fortune-telling web app built on Cloudflare Workers, Workers AI, static assets, and a route-scoped V2 SSR shell. It is live at [oraclemirror.com](https://oraclemirror.com).

## Experiences

- Crystal Ball — conversational readings with Madame Fortuna.
- Dream Interpreter — Morpheus asks clarifying questions and grounds interpretations in a dream-symbol corpus.
- Western Zodiac and Chinese Zodiac readings.
- Tarot — interactive Past / Present / Future Major Arcana reading.
- Love Oracle and Love Match compatibility.
- Magic 8 Ball.
- Numerology life-path calculator.
- Daily Fortune.
- Birth Chart.
- Palm Reading.
- I Ching.
- Mystics — character/lore hub.
- Private browser Archive for saved readings.
- Dream symbol guide hub and individual symbol pages.

All readings are entertainment experiences. Avoid entering sensitive personal information.

## Architecture

- **Cloudflare Worker:** `src/v2-index.ts` is the production entry point. It wraps the core application handler with route-scoped SSR, security headers, SEO freshness rules, telemetry, and legacy URL tombstones.
- **Core application:** `src/index.ts` provides reading APIs, metadata, sitemap/robots/llms output, dream-guide routing, and the static app shell.
- **Workers AI:** the default inference model is `@cf/meta/llama-3.3-70b-instruct-fp8-fast`.
- **Static app:** `public/index.html`, `public/script.js`, and `public/styles.css` contain the interactive realms.
- **Route-scoped SSR:** initial HTML contains only the requested realm plus shared chrome; `public/hydrate-shell.js` restores the complete client shell before the legacy application module starts.
- **Hardening:** `public/hardening.js` adds reduced-effects behavior and accessibility semantics; `src/security-headers.ts` applies explicit security headers.
- **Ads:** `public/ad-config.js` and `public/ads.js` manage Adsterra placements, lazy loading, viewability, unfilled collapse, and refresh eligibility. `public/monetization.js` applies the M2 experiment/policy layer.
- **Analytics:** `public/telemetry.js` sends allowlisted, non-reading-content events to `/api/telemetry`; `src/telemetry.ts` writes sanitized points to Workers Analytics Engine when bound.

## Routes

Public reading routes include:

`/crystal-ball`, `/dream-interpreter`, `/western-zodiac`, `/chinese-zodiac`, `/tarot`, `/love-oracle`, `/love-match`, `/magic-8-ball`, `/numerology`, `/daily-fortune`, `/birth-chart`, `/palm-reading`, `/iching-oracle`, `/mystics`, `/dreams`, and `/dreams/:symbol`.

Utility routes include `/archive`, `/privacy-policy`, `/cookie-policy`, `/contact`, `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/ads.txt`, and `/api/health`.

Result shells under `/result/*` are intentionally noindex.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Health check |
| POST | `/api/chat` | Crystal Ball conversation |
| POST | `/api/dream` | Dream Interpreter conversation |
| POST | `/api/reading` | One-shot crystal-ball reading |
| POST | `/api/western-zodiac` | Western horoscope |
| POST | `/api/chinese-zodiac` | Chinese zodiac reading |
| POST | `/api/tarot` | Tarot interpretation |
| POST | `/api/love` | Love Oracle |
| POST | `/api/love-match` | Compatibility interpretation |
| POST | `/api/magic8` | Magic 8 Ball |
| POST | `/api/numerology` | Numerology reading |
| POST | `/api/daily-fortune` | Daily fortune |
| POST | `/api/birthchart` | Birth-chart interpretation |
| POST | `/api/palmistry` | Palm reading |
| POST | `/api/soulmate-vision` | Soulmate Vision |
| POST | `/api/iching` | I Ching interpretation |
| POST | `/api/telemetry` | Privacy-safe analytics ingestion |

## Local development

Requirements: Node.js 22.6+ and a Cloudflare account when running Worker-bound features.

```bash
npm install
npm run typecheck
npm test
npm run build
npx wrangler@4 dev
```

## Deployment

Production deploys are gated by `.github/workflows/v2-ci.yml`. After a green `master` build, `.github/workflows/deploy-cloudflare.yml` deploys the exact verified SHA when these GitHub Actions secrets are configured:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

The deployment workflow then verifies production metadata, security headers, and retired-URL behavior.

Manual deployment:

```bash
npm run deploy
```

## Cloudflare bindings

`wrangler.toml` currently defines:

- `AI` — Workers AI.
- `ASSETS` — static asset binding.
- `ANALYTICS` — Workers Analytics Engine dataset (`oracle_mirror_events`).
- `CF_VERSION_METADATA` — Worker version metadata used in analytics.
- custom domains for `oraclemirror.com` and `www.oraclemirror.com`.

`ADSTERRA_ADS_TXT` is an optional Worker secret used to serve the production `ads.txt` seller record.

## Quality gates

The V2 CI workflow runs on `master` and `v2/**` branches:

1. `npm ci`
2. `npm audit --audit-level=high`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

## Key files

```text
.github/workflows/
  v2-ci.yml
  deploy-cloudflare.yml
public/
  index.html
  script.js
  styles.css
  hydrate-shell.js
  hardening.js
  monetization.js
  telemetry.js
  ad-config.js
  ads.js
src/
  index.ts
  v2-index.ts
  ssr-shell.ts
  seo-freshness.ts
  security-headers.ts
  telemetry.ts
  dream-data.ts
  dream-pages.ts
  realm-content.ts
tests/
docs/
wrangler.toml
```

## Notes

- The private Archive is `noindex,follow` and excluded from the sitemap.
- Historical URLs for removed temporary experiences may return HTTP 410 so search engines can retire them cleanly; removed feature code is not kept in the product bundle.
- M2 monetization details and Analytics Engine query examples are documented in `docs/M2-MONETIZATION.md`.
'''
write("README.md", readme)

# Remove temporary scan workflow; the migration workflow removes itself after checks.
scan = ROOT / ".github/workflows/pass5-scan.yml"
if scan.exists():
    scan.unlink()

print("Pass 5 source excision complete. Remaining historical tombstone references:")
for path in ["src/seo-freshness.ts", "tests/seo-freshness.test.ts", ".github/workflows/deploy-cloudflare.yml"]:
    print(f"  - {path}")
