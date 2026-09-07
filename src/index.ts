import legacyApp from "./index-legacy.ts";
import type { Env } from "./index-legacy.ts";
import { handleExpandedDream } from "./dream-api.ts";
import { handleDreamLibraryRoute } from "./dream-pages-v2.ts";

export * from "./index-legacy.ts";
export type { Env } from "./index-legacy.ts";

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/dream") return handleExpandedDream(request, env);
    if (request.method === "GET" && (url.pathname === "/dreams" || url.pathname === "/dreams/" || url.pathname.startsWith("/dreams/"))) {
      const response = handleDreamLibraryRoute(url.pathname);
      if (response) return response;
      return new Response("<!doctype html><html lang=\"en\"><head><meta name=\"robots\" content=\"noindex,follow\"><title>Dream Symbol Not Found | Oracle Mirror</title></head><body><main><h1>Dream symbol not found</h1><p><a href=\"/dreams\">Browse the Dream Library</a></p></main></body></html>", { status: 404, headers: { "Content-Type": "text/html; charset=UTF-8" } });
    }
    return legacyApp.fetch(request, env, ctx);
  },
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    if (typeof legacyApp.scheduled === "function") return legacyApp.scheduled(controller, env, ctx);
  },
} satisfies ExportedHandler<Env>;
