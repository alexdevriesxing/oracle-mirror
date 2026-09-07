import app from "./index.ts";
import type { Env } from "./index.ts";
import {
  pageSectionIdForPath,
  pruneAppShellToPage,
  replaceMainClientWithHydrator,
} from "./ssr-shell.ts";
import {
  isHtmlResponse,
  isRetiredEventPath,
  isSitemapResponse,
  rewriteHtmlFreshness,
  rewriteSitemapFreshness,
} from "./seo-freshness.ts";
import { withSecurityHeaders } from "./security-headers.ts";
import { handleTelemetry } from "./telemetry.ts";
import type { TelemetryEnv } from "./telemetry.ts";
import { handleCouncil } from "./council.ts";
import type { CouncilEnv } from "./council.ts";
import { augmentSitemapWithRunes, handleRuneRoute, injectRunesDiscovery, isRuneRoute } from "./runes-pages.ts";
import { augmentLlmsWithLenormand, augmentSitemapWithLenormand, handleLenormandRoute, injectLenormandDiscovery, isLenormandRoute } from "./lenormand-pages.ts";
import { augmentLlmsWithAdvancedTarot, augmentSitemapWithAdvancedTarot, handleAdvancedTarotRoute, injectAdvancedTarotDiscovery, isAdvancedTarotRoute } from "./tarot-pages.ts";
import { augmentLlmsWithAdvancedNumerology, augmentSitemapWithAdvancedNumerology, handleAdvancedNumerologyRoute, injectAdvancedNumerologyDiscovery, isAdvancedNumerologyRoute } from "./numerology-pages.ts";
import { augmentLlmsWithAdvancedIChing, augmentSitemapWithAdvancedIChing, handleAdvancedIChingRoute, injectAdvancedIChingDiscovery, isAdvancedIChingRoute } from "./iching-pages.ts";
import { augmentLlmsWithAstrology, augmentSitemapWithAstrology, handleAstrologyRoute, injectAstrologyDiscovery, isAstrologyRoute } from "./astrology-pages.ts";
import { augmentLlmsWithPalmistry, augmentSitemapWithPalmistry, handleAdvancedPalmistryRoute, injectPalmistryDiscovery, isAdvancedPalmistryRoute } from "./palmistry-pages.ts";
import { augmentLlmsWithDreamLibrary, augmentSitemapWithDreamLibrary } from "./dream-pages-v2.ts";
import { augmentLlmsWithDivination, augmentSitemapWithDivination, handleDivinationRoute, injectDivinationDiscovery, isDivinationRoute } from "./divination-pages.ts";
import {
  augmentLlmsWithKnowledgeGraph,
  augmentSitemapWithKnowledgeGraph,
  injectKnowledgeGraph,
  injectKnowledgeGraphDiscovery,
} from "./knowledge-graph.ts";
import { handleKnownKnowledgeTopicRoute, isKnownKnowledgeTopicRoute } from "./knowledge-graph-router.ts";
import {
  augmentLlmsWithReferenceSearch,
  augmentSitemapWithReferenceSearch,
  handleReferenceSearchRoute,
  injectReferenceSearchDiscovery,
  isReferenceSearchRoute,
} from "./reference-search.ts";

const FULL_SHELL_QUERY = "__oracle_full_shell";
type V2Env = Env & TelemetryEnv & CouncilEnv;

function responseWithBody(response: Response, body: string, contentType?: string): Response {
  const headers = new Headers(response.headers);
  if (contentType) headers.set("Content-Type", contentType);
  headers.delete("Content-Length");
  headers.delete("ETag");
  return new Response(body, { status: response.status, statusText: response.statusText, headers });
}

function removedLegacyEventResponse(request: Request): Response {
  const url = new URL(request.url);
  const wantsJson = url.pathname.startsWith("/api/") || (request.headers.get("accept") || "").includes("application/json");
  if (wantsJson) return new Response(JSON.stringify({ error: "This feature has been removed." }), { status: 410, headers: { "Content-Type": "application/json; charset=UTF-8", "Cache-Control": "public, max-age=86400" } });
  return new Response("<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,follow\"><title>Page Removed | Oracle Mirror</title></head><body><main><h1>This Oracle Mirror feature has been removed.</h1><p><a href=\"/\">Return to Oracle Mirror</a></p></main></body></html>", { status: 410, headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "public, max-age=86400" } });
}

function injectDreamLibraryDiscovery(html: string): string {
  if (html.includes('href="/dreams" class="dropdown-item dream-library-link"')) return html;
  let next = html.replace(
    '<a href="/dream-interpreter" class="dropdown-item" data-nav="dream-interpreter">&#127769; Dream Interpreter</a>',
    '<a href="/dream-interpreter" class="dropdown-item" data-nav="dream-interpreter">&#127769; Dream Interpreter</a>\n              <a href="/dreams" class="dropdown-item dream-library-link">📖 Dream Library</a>'
  );
  const dreamCard = '<a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">';
  if (next.includes(dreamCard) && !next.includes('class="card card-dream-library"')) {
    next = next.replace(dreamCard, '<a href="/dreams" class="card card-dream-library"><div class="card-frame"><div class="card-icon">📖</div><h3>Dream Library</h3><p class="card-desc">Explore 250+ dream symbols across ten meaningful themes</p></div></a>\n          ' + dreamCard);
  }
  return next;
}

function safeDiscoveryHtml(html: string, pathname = ""): string {
  const discovered = injectKnowledgeGraphDiscovery(injectDivinationDiscovery(injectDreamLibraryDiscovery(injectPalmistryDiscovery(injectAstrologyDiscovery(injectAdvancedIChingDiscovery(injectAdvancedNumerologyDiscovery(injectAdvancedTarotDiscovery(injectLenormandDiscovery(injectRunesDiscovery(html))))))))));
  return injectReferenceSearchDiscovery(
    discovered
      .replace(' class="card card-runes" data-realm="runes"', ' class="card card-runes"')
      .replace("Seekers can consult ten mystical realms:", "Seekers can consult many mystical realms, including:")
      .replace("and the Dawn Oracle's Daily Fortune scroll.", "the Dawn Oracle's Daily Fortune scroll, the expanded Dream Library, the grounded Divination Reference Library, cross-system Mystical Themes, universal Reference Search, Elder Futhark Rune Casting, Lenormand card reading, advanced 78-card Tarot, advanced numerology, Advanced I Ching, astrology/lunar reference guides, and Advanced Palmistry."),
    pathname,
  );
}

function augmentRuneLlms(text: string): string {
  if (text.includes("## Rune Casting")) return text;
  return `${text.trimEnd()}\n\n## Rune Casting\n- https://oraclemirror.com/runes — free three-rune Elder Futhark reflection with a 24-rune guide.\n- https://oraclemirror.com/runes/{rune} — individual meanings for Fehu through Othala, with modern symbolic interpretation clearly separated from historical context.\n`;
}

async function decorateStandaloneKnowledge(response: Response, request: Request): Promise<Response> {
  if (request.method !== "GET" || !response.ok || !isHtmlResponse(response)) return response;
  const path = new URL(request.url).pathname;
  const withKnowledge = injectKnowledgeGraph(await response.text(), path);
  return responseWithBody(response, injectReferenceSearchDiscovery(withKnowledge, path), "text/html; charset=UTF-8");
}

async function applyFreshnessTransforms(response: Response, request: Request): Promise<Response> {
  if (request.method !== "GET" || !response.ok) return response;
  const url = new URL(request.url);
  if (url.pathname === "/llms.txt") {
    return responseWithBody(response, augmentLlmsWithReferenceSearch(augmentLlmsWithKnowledgeGraph(augmentLlmsWithDivination(augmentLlmsWithDreamLibrary(augmentLlmsWithPalmistry(augmentLlmsWithAstrology(augmentLlmsWithAdvancedIChing(augmentLlmsWithAdvancedNumerology(augmentLlmsWithAdvancedTarot(augmentLlmsWithLenormand(augmentRuneLlms(await response.text()))))))))))), "text/plain; charset=UTF-8");
  }
  if (isSitemapResponse(url.pathname, response)) {
    return responseWithBody(response, augmentSitemapWithReferenceSearch(augmentSitemapWithKnowledgeGraph(augmentSitemapWithDivination(augmentSitemapWithDreamLibrary(augmentSitemapWithPalmistry(augmentSitemapWithAstrology(augmentSitemapWithAdvancedIChing(augmentSitemapWithAdvancedNumerology(augmentSitemapWithAdvancedTarot(augmentSitemapWithLenormand(augmentSitemapWithRunes(rewriteSitemapFreshness(await response.text())))))))))))), "application/xml; charset=UTF-8");
  }
  if (isHtmlResponse(response)) {
    const html = safeDiscoveryHtml(rewriteHtmlFreshness(await response.text(), url.pathname), url.pathname);
    return responseWithBody(response, injectKnowledgeGraph(html, url.pathname), "text/html; charset=UTF-8");
  }
  return response;
}

function shouldTransform(response: Response, request: Request): boolean { return request.method === "GET" && response.ok && isHtmlResponse(response); }
async function transformHtmlResponse(response: Response, request: Request): Promise<Response> {
  if (!shouldTransform(response, request)) return response;
  const url = new URL(request.url);
  const requestedPageId = pageSectionIdForPath(url.pathname);
  if (!requestedPageId || url.searchParams.get(FULL_SHELL_QUERY) === "1") return response;
  let html = await response.text();
  html = pruneAppShellToPage(html, requestedPageId);
  html = replaceMainClientWithHydrator(html);
  return responseWithBody(response, html, "text/html; charset=UTF-8");
}

export default {
  async fetch(request: Request, env: V2Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/telemetry") return withSecurityHeaders(await handleTelemetry(request, env));
    if (url.pathname === "/api/council") return withSecurityHeaders(await handleCouncil(request, env));
    if (request.method === "GET" && isReferenceSearchRoute(url.pathname)) return withSecurityHeaders(handleReferenceSearchRoute());
    if (request.method === "GET" && isKnownKnowledgeTopicRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleKnownKnowledgeTopicRoute(url.pathname), request));
    if (request.method === "GET" && (url.pathname === "/runes/" || isRuneRoute(url.pathname))) return withSecurityHeaders(await decorateStandaloneKnowledge(handleRuneRoute(url.pathname), request));
    if (request.method === "GET" && isLenormandRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleLenormandRoute(url.pathname), request));
    if (request.method === "GET" && isAdvancedTarotRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleAdvancedTarotRoute(url.pathname), request));
    if (request.method === "GET" && isAdvancedNumerologyRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleAdvancedNumerologyRoute(url.pathname), request));
    if (request.method === "GET" && isAdvancedIChingRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleAdvancedIChingRoute(url.pathname), request));
    if (request.method === "GET" && isAstrologyRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleAstrologyRoute(url.pathname), request));
    if (request.method === "GET" && isAdvancedPalmistryRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleAdvancedPalmistryRoute(url.pathname), request));
    if (request.method === "GET" && isDivinationRoute(url.pathname)) return withSecurityHeaders(await decorateStandaloneKnowledge(handleDivinationRoute(url.pathname), request));
    if (isRetiredEventPath(url.pathname)) return withSecurityHeaders(removedLegacyEventResponse(request));
    let response = await app.fetch(request, env, ctx);
    response = await applyFreshnessTransforms(response, request);
    response = await transformHtmlResponse(response, request);
    return withSecurityHeaders(response);
  },
  async scheduled(_controller: ScheduledController, _env: V2Env, _ctx: ExecutionContext): Promise<void> { return; },
} satisfies ExportedHandler<V2Env>;
