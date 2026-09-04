const TOP_LEVEL_PAGE_IDS = [
  "page-home",
  "page-crystal-ball",
  "page-dream-interpreter",
  "page-western-zodiac",
  "page-chinese-zodiac",
  "page-tarot",
  "page-love-match",
  "page-magic8",
  "page-numerology",
  "page-daily-fortune",
  "page-personas",
  "page-archive",
  "page-ad-debug",
  "page-privacy-policy",
  "page-cookie-policy",
  "page-contact",
  "page-birthchart",
  "page-palmistry",
  "page-iching",
  "page-olympus",
] as const;

const FOOTER_BOUNDARY_MARKERS = [
  '<aside\n      class="oracle-ad oracle-ad-footer"',
  '<aside class="oracle-ad oracle-ad-footer"',
  "<footer>",
];

type PageSlice = {
  id: string;
  start: number;
};

function openingTagStart(html: string, pageId: string): number {
  const needle = `id="${pageId}" class="page`;
  const idIndex = html.indexOf(needle);
  if (idIndex < 0) return -1;
  return html.lastIndexOf("<", idIndex);
}

function findPageAreaEnd(html: string, minimumIndex: number): number {
  const candidates = FOOTER_BOUNDARY_MARKERS
    .map((marker) => html.indexOf(marker, minimumIndex))
    .filter((index) => index >= 0);

  if (candidates.length === 0) return html.length;
  return Math.min(...candidates);
}

/**
 * Keep only the requested top-level app page in the server-rendered HTML while
 * preserving the shared head, header, global ad/footer chrome, and scripts.
 *
 * The browser hydrator fetches the full shell before importing script.js, so
 * the existing client-side router and realm code can continue to assume every
 * page exists once JavaScript starts. Crawlers, no-JS clients, and the initial
 * parser see only the requested page, removing cross-realm content leakage.
 */
export function pruneAppShellToPage(html: string, requestedPageId: string): string {
  const pageSlices: PageSlice[] = TOP_LEVEL_PAGE_IDS
    .map((id) => ({ id, start: openingTagStart(html, id) }))
    .filter((entry) => entry.start >= 0)
    .sort((a, b) => a.start - b.start);

  if (pageSlices.length < 2) return html;

  const requestedIndex = pageSlices.findIndex((entry) => entry.id === requestedPageId);
  if (requestedIndex < 0) return html;

  const firstPageStart = pageSlices[0].start;
  const lastPageStart = pageSlices[pageSlices.length - 1].start;
  const pageAreaEnd = findPageAreaEnd(html, lastPageStart);
  if (pageAreaEnd <= firstPageStart) return html;

  const requestedStart = pageSlices[requestedIndex].start;
  const requestedEnd = requestedIndex + 1 < pageSlices.length
    ? pageSlices[requestedIndex + 1].start
    : pageAreaEnd;

  if (requestedEnd <= requestedStart) return html;

  const prefix = html.slice(0, firstPageStart);
  const requestedPage = html.slice(requestedStart, requestedEnd);
  const suffix = html.slice(pageAreaEnd);

  return `${prefix}${requestedPage}${suffix}`.replace(
    "<body>",
    `<body data-ssr-page="${requestedPageId}">`
  );
}

export function pageSectionIdForPath(pathname: string): string | null {
  const path = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  if (path === "/" || path === "") return "page-home";
  if (path === "/love-oracle" || path === "/love-match") return "page-love-match";
  if (path === "/oracle-of-olympus" || path.startsWith("/oracle-of-olympus/")) return "page-olympus";

  const direct: Record<string, string> = {
    "/crystal-ball": "page-crystal-ball",
    "/dream-interpreter": "page-dream-interpreter",
    "/western-zodiac": "page-western-zodiac",
    "/chinese-zodiac": "page-chinese-zodiac",
    "/tarot": "page-tarot",
    "/magic-8-ball": "page-magic8",
    "/numerology": "page-numerology",
    "/daily-fortune": "page-daily-fortune",
    "/mystics": "page-personas",
    "/archive": "page-archive",
    "/ad-debug": "page-ad-debug",
    "/privacy-policy": "page-privacy-policy",
    "/cookie-policy": "page-cookie-policy",
    "/contact": "page-contact",
    "/birth-chart": "page-birthchart",
    "/palm-reading": "page-palmistry",
    "/iching-oracle": "page-iching",
  };

  if (direct[path]) return direct[path];

  if (path.startsWith("/result/")) {
    const resultMap: Record<string, string> = {
      "/result/crystal-ball": "page-crystal-ball",
      "/result/dream-interpreter": "page-dream-interpreter",
      "/result/western-zodiac": "page-western-zodiac",
      "/result/chinese-zodiac": "page-chinese-zodiac",
      "/result/tarot": "page-tarot",
      "/result/love-oracle": "page-love-match",
      "/result/love-match": "page-love-match",
      "/result/soulmate-vision": "page-love-match",
      "/result/magic-8-ball": "page-magic8",
      "/result/numerology": "page-numerology",
      "/result/daily-fortune": "page-daily-fortune",
      "/result/birth-chart": "page-birthchart",
      "/result/palm-reading": "page-palmistry",
      "/result/iching-oracle": "page-iching",
    };
    return resultMap[path] ?? null;
  }

  return null;
}

export function replaceMainClientWithHydrator(html: string): string {
  const mainScript = '<script src="/script.js" type="module"></script>';
  const hydratorScript = '<script src="/hydrate-shell.js" type="module"></script>';
  return html.includes(mainScript) ? html.replace(mainScript, hydratorScript) : html;
}
