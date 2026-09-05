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
import {
  augmentSitemapWithRunes,
  handleRuneRoute,
  injectRunesDiscovery,
  isRuneRoute,
} from "./runes-pages.ts";

const FULL_SHELL_QUERY = "__oracle_full_shell";
type V2Env = Env & TelemetryEnv & CouncilEnv;

function responseWithBody(response: Response, body: string, contentType?: string): Response {
  const headers = new Headers(response.headers);
  if (contentType) headers.set("Content-Type", contentType);
  headers.delete("Content-Length");
  headers.delete("ETag");
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function removedLegacyEventResponse(request: Request): Response {
  const url = new URL(request.url);
  const wantsJson = url.pathname.startsWith("/api/")
    || (request.headers.get("accept") || "").includes("application/json");

  if (wantsJson) {
    return new Response(JSON.stringify({ error: "This feature has been removed." }), {
      status: 410,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  return new Response(
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"robots\" content=\"noindex,follow\"><title>Page Removed | Oracle Mirror</title></head><body><main><h1>This Oracle Mirror feature has been removed.</h1><p><a href=\"/\">Return to Oracle Mirror</a></p></main></body></html>",
    {
      status: 410,
      headers: {
        "Content-Type": "text/html; charset=UTF-8",
        "Cache-Control": "public, max-age=86400",
      },
    }
  );
}

function safeRuneDiscoveryHtml(html: string): string {
  return injectRunesDiscovery(html)
    .replace(' class="card card-runes" data-realm="runes"', ' class="card card-runes"')
    .replace("Seekers can consult ten mystical realms:", "Seekers can consult many mystical realms, including:")
    .replace("and the Dawn Oracle's Daily Fortune scroll.", "the Dawn Oracle's Daily Fortune scroll, and Elder Futhark Rune Casting.");
}

function augmentRuneLlms(text: string): string {
  if (text.includes("## Rune Casting")) return text;
  return `${text.trimEnd()}\n\n## Rune Casting\n- https://oraclemirror.com/runes — free three-rune Elder Futhark reflection with a 24-rune guide.\n- https://oraclemirror.com/runes/{rune} — individual meanings for Fehu through Othala, with modern symbolic interpretation clearly separated from historical context.\n`;
}

async function applyFreshnessTransforms(response: Response, request: Request): Promise<Response> {
  if (request.method !== "GET" || !response.ok) return response;
  const url = new URL(request.url);

  if (url.pathname === "/llms.txt") {
    return responseWithBody(response, augmentRuneLlms(await response.text()), "text/plain; charset=UTF-8");
  }

  if (isSitemapResponse(url.pathname, response)) {
    return responseWithBody(
      response,
      augmentSitemapWithRunes(rewriteSitemapFreshness(await response.text())),
      "application/xml; charset=UTF-8"
    );
  }

  if (isHtmlResponse(response)) {
    return responseWithBody(
      response,
      safeRuneDiscoveryHtml(rewriteHtmlFreshness(await response.text(), url.pathname)),
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

  if (url.searchParams.get(FULL_SHELL_QUERY) === "1") {
    return response;
  }

  let html = await response.text();
  html = pruneAppShellToPage(html, requestedPageId);
  html = replaceMainClientWithHydrator(html);

  return responseWithBody(response, html, "text/html; charset=UTF-8");
}

export default {
  async fetch(request: Request, env: V2Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/telemetry") {
      return withSecurityHeaders(await handleTelemetry(request, env));
    }

    if (url.pathname === "/api/council") {
      return withSecurityHeaders(await handleCouncil(request, env));
    }

    if (request.method === "GET" && (url.pathname === "/runes/" || isRuneRoute(url.pathname))) {
      return withSecurityHeaders(handleRuneRoute(url.pathname));
    }

    if (isRetiredEventPath(url.pathname)) {
      return withSecurityHeaders(removedLegacyEventResponse(request));
    }

    let response = await app.fetch(request, env, ctx);
    response = await applyFreshnessTransforms(response, request);
    response = await transformHtmlResponse(response, request);
    return withSecurityHeaders(response);
  },

  async scheduled(_controller: ScheduledController, _env: V2Env, _ctx: ExecutionContext): Promise<void> {
    return;
  },
} satisfies ExportedHandler<V2Env>;
