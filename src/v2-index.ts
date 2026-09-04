import app from "./index.ts";
import type { Env } from "./index.ts";
import {
  pageSectionIdForPath,
  pruneAppShellToPage,
  replaceMainClientWithHydrator,
} from "./ssr-shell.ts";

const FULL_SHELL_QUERY = "__oracle_full_shell";

function shouldTransform(response: Response, request: Request): boolean {
  if (request.method !== "GET") return false;
  if (!response.ok) return false;
  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("text/html");
}

async function transformHtmlResponse(response: Response, request: Request): Promise<Response> {
  if (!shouldTransform(response, request)) return response;

  const url = new URL(request.url);
  const requestedPageId = pageSectionIdForPath(url.pathname);
  if (!requestedPageId) return response;

  // Hydration fetches the complete application shell before script.js starts.
  // Return the original HTML untouched so all realm DOM is available to the
  // client router, while ordinary requests receive route-scoped SSR markup.
  if (url.searchParams.get(FULL_SHELL_QUERY) === "1") {
    return response;
  }

  let html = await response.text();
  html = pruneAppShellToPage(html, requestedPageId);
  html = replaceMainClientWithHydrator(html);

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "text/html; charset=UTF-8");
  // The upstream asset ETag/content length describe the unmodified SPA shell.
  // Do not forward stale entity metadata after route-level transformation.
  headers.delete("Content-Length");
  headers.delete("ETag");

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const response = await app.fetch(request, env, ctx);
    return transformHtmlResponse(response, request);
  },

  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    await app.scheduled(controller, env, ctx);
  },
} satisfies ExportedHandler<Env>;
