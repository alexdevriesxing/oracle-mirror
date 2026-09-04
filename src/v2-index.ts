import app from "./index.ts";
import type { Env } from "./index.ts";
import {
  pageSectionIdForPath,
  pruneAppShellToPage,
  replaceMainClientWithHydrator,
} from "./ssr-shell.ts";
import {
  isHtmlResponse,
  isLlmsResponse,
  isSitemapResponse,
  rewriteHtmlFreshness,
  rewriteLlmsFreshness,
  rewriteSitemapFreshness,
} from "./seo-freshness.ts";

const FULL_SHELL_QUERY = "__oracle_full_shell";

function responseWithBody(response: Response, body: string, contentType?: string): Response {
  const headers = new Headers(response.headers);
  if (contentType) headers.set("Content-Type", contentType);
  // Upstream entity metadata describes the pre-transformed payload.
  headers.delete("Content-Length");
  headers.delete("ETag");
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function applyFreshnessTransforms(response: Response, request: Request): Promise<Response> {
  if (request.method !== "GET" || !response.ok) return response;
  const url = new URL(request.url);

  if (isSitemapResponse(url.pathname, response)) {
    return responseWithBody(
      response,
      rewriteSitemapFreshness(await response.text()),
      "application/xml; charset=UTF-8"
    );
  }

  if (isLlmsResponse(url.pathname, response)) {
    return responseWithBody(
      response,
      rewriteLlmsFreshness(await response.text()),
      "text/plain; charset=UTF-8"
    );
  }

  if (isHtmlResponse(response)) {
    return responseWithBody(
      response,
      rewriteHtmlFreshness(await response.text(), url.pathname),
      "text/html; charset=UTF-8"
    );
  }

  return response;
}

function shouldTransform(response: Response, request: Request): boolean {
  if (request.method !== "GET") return false;
  if (!response.ok) return false;
  return isHtmlResponse(response);
}

async function transformHtmlResponse(response: Response, request: Request): Promise<Response> {
  if (!shouldTransform(response, request)) return response;

  const url = new URL(request.url);
  const requestedPageId = pageSectionIdForPath(url.pathname);
  if (!requestedPageId) return response;

  // Hydration fetches the complete application shell before script.js starts.
  // Return the full, freshness-corrected HTML so all realm DOM is available to
  // the client router, while ordinary requests receive route-scoped SSR markup.
  if (url.searchParams.get(FULL_SHELL_QUERY) === "1") {
    return response;
  }

  let html = await response.text();
  html = pruneAppShellToPage(html, requestedPageId);
  html = replaceMainClientWithHydrator(html);

  return responseWithBody(response, html, "text/html; charset=UTF-8");
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    let response = await app.fetch(request, env, ctx);
    response = await applyFreshnessTransforms(response, request);
    return transformHtmlResponse(response, request);
  },

  // The World Cup 2026 tournament is complete. Keep the scheduled handler as a
  // deliberate no-op so an accidentally retained external schedule cannot
  // restart obsolete fixture synchronization.
  async scheduled(_controller: ScheduledController, _env: Env, _ctx: ExecutionContext): Promise<void> {
    return;
  },
} satisfies ExportedHandler<Env>;
