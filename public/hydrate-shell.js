const FULL_SHELL_QUERY = "__oracle_full_shell";

const ROUTE_BY_NAV = {
  home: "/",
  "crystal-ball": "/crystal-ball",
  "dream-interpreter": "/dream-interpreter",
  "western-zodiac": "/western-zodiac",
  "chinese-zodiac": "/chinese-zodiac",
  tarot: "/tarot",
  love: "/love-oracle",
  "love-match": "/love-match",
  magic8: "/magic-8-ball",
  numerology: "/numerology",
  "daily-fortune": "/daily-fortune",
  birthchart: "/birth-chart",
  palmistry: "/palm-reading",
  iching: "/iching-oracle",
  personas: "/mystics",
  archive: "/archive",
  "ad-debug": "/ad-debug",
  "privacy-policy": "/privacy-policy",
  "cookie-policy": "/cookie-policy",
  contact: "/contact",
};

let appReady = false;

function routeForEarlyClick(target) {
  const link = target.closest?.("a[href]");
  if (link?.href) return link.href;

  const navTarget = target.closest?.("[data-nav]")?.dataset?.nav;
  if (navTarget && ROUTE_BY_NAV[navTarget]) return ROUTE_BY_NAV[navTarget];

  const realm = target.closest?.("[data-realm]")?.dataset?.realm;
  if (realm && ROUTE_BY_NAV[realm]) return ROUTE_BY_NAV[realm];

  if (target.closest?.("[data-back]")) return "/";
  return null;
}

function earlyNavigationFallback(event) {
  if (appReady) return;
  const route = routeForEarlyClick(event.target);
  if (!route) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  window.location.assign(route);
}

document.addEventListener("click", earlyNavigationFallback, true);

function hydrationUrl() {
  const url = new URL("/", window.location.origin);
  url.searchParams.set(FULL_SHELL_QUERY, "1");
  return url.toString();
}

function hardFallback() {
  const url = new URL(window.location.href);
  url.searchParams.set(FULL_SHELL_QUERY, "1");
  window.location.replace(url.toString());
}

async function hydrateShell() {
  try {
    const response = await fetch(hydrationUrl(), {
      method: "GET",
      credentials: "same-origin",
      headers: {
        Accept: "text/html",
        "X-Oracle-Hydration": "1",
      },
    });

    if (!response.ok) throw new Error(`Shell hydration failed with ${response.status}`);

    const html = await response.text();
    const parsed = new DOMParser().parseFromString(html, "text/html");
    const insertionPoint = document.querySelector(".oracle-ad-footer") || document.querySelector("footer");

    if (!insertionPoint) throw new Error("Shared footer boundary not found");

    for (const page of parsed.querySelectorAll('.page[id^="page-"]')) {
      if (document.getElementById(page.id)) continue;
      insertionPoint.before(document.importNode(page, true));
    }

    document.body.dataset.shellHydrated = "true";

    // Apply the small V2 hardening layer before the legacy app initializes so
    // reduced-effects users never start the particle engine and keyboard/ARIA
    // semantics are present before dynamic realm controls begin rendering.
    await import("/hardening.js");
    await import("/script.js");

    appReady = true;
    document.removeEventListener("click", earlyNavigationFallback, true);
  } catch (error) {
    console.error("[Oracle Mirror] Route shell hydration failed; loading full shell.", error);
    document.removeEventListener("click", earlyNavigationFallback, true);
    hardFallback();
  }
}

hydrateShell();
