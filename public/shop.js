const STATS_KEY = "oracle-shop-stats-v1";
const CONSENT_KEY = "oracle-mirror-consent-v1";

function analyticsAllowed() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.analytics === true;
  } catch {
    return false;
  }
}

function readStats() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STATS_KEY) || "null");
    if (parsed && typeof parsed === "object") {
      return {
        views: Number(parsed.views) || 0,
        outboundClicks: Number(parsed.outboundClicks) || 0,
      };
    }
  } catch {
    // ignore storage errors
  }
  return { views: 0, outboundClicks: 0 };
}

function writeStats(stats) {
  try {
    sessionStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // ignore storage errors
  }
}

function emitShopEvent(eventName, payload = {}) {
  if (!analyticsAllowed()) return;
  try {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: eventName, ...payload });
    }
    const body = JSON.stringify({
      sessionId: sessionStorage.getItem("oracle-telemetry-session") || "shop-session",
      events: [{ event: eventName, timestamp: new Date().toISOString(), page_path: window.location.pathname, ...payload }],
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
    }
  } catch {
    // non-fatal
  }
}

function initCatalogFilters() {
  const grid = document.getElementById("shop-catalog-grid");
  if (!grid) return;
  const searchInput = document.getElementById("shop-search-input");
  const deptSelect = document.getElementById("shop-dept-filter");
  const levelSelect = document.getElementById("shop-level-filter");
  const countEl = document.getElementById("shop-results-count");
  const cards = Array.from(grid.querySelectorAll(".shop-card"));

  function applyFilters() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const dept = deptSelect?.value || "all";
    const level = levelSelect?.value || "all";
    let visible = 0;

    for (const card of cards) {
      const matchesDept = dept === "all" || card.dataset.department === dept;
      const matchesLevel = level === "all" || card.dataset.level === level;
      const matchesQuery = !query || (card.dataset.search || "").includes(query);
      const show = matchesDept && matchesLevel && matchesQuery;
      card.hidden = !show;
      if (show) visible += 1;
    }

    if (countEl) {
      countEl.textContent = `Showing ${visible} verified ${visible === 1 ? "item" : "items"}`;
    }
  }

  searchInput?.addEventListener("input", applyFilters);
  deptSelect?.addEventListener("change", () => {
    applyFilters();
    emitShopEvent("shop_category_select", { shop_department: deptSelect.value });
  });
  levelSelect?.addEventListener("change", applyFilters);
}

function initGiftFinder() {
  const dataEl = document.getElementById("gift-catalog-data");
  const grid = document.getElementById("gift-results-grid");
  if (!dataEl || !grid) return;

  let products = [];
  try {
    products = JSON.parse(dataEl.textContent || "[]");
  } catch {
    return;
  }

  const personaBtns = Array.from(document.querySelectorAll("[data-gift-persona]"));
  const levelSelect = document.getElementById("gift-level-select");
  const formatSelect = document.getElementById("gift-format-select");
  const countEl = document.getElementById("gift-results-count");
  let activePersona = personaBtns.find((b) => b.classList.contains("active"))?.dataset.giftPersona || "tarot-beginner";

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderMatches() {
    const level = levelSelect?.value || "all";
    const format = formatSelect?.value || "all";
    const matches = products.filter((item) => {
      const matchesPersona = Array.isArray(item.giftPersonas) && item.giftPersonas.includes(activePersona);
      const matchesLevel = level === "all" || item.experienceLevel === level;
      const matchesFormat = format === "all" || item.format === format;
      return matchesPersona && matchesLevel && matchesFormat;
    });

    if (countEl) {
      countEl.textContent = `Showing ${matches.length} curated ${matches.length === 1 ? "match" : "matches"}`;
    }

    if (matches.length === 0) {
      grid.innerHTML = `<div class="shop-grounded-box"><p>No exact matches for this combination. Try selecting "Any Experience Level" or "All Formats".</p></div>`;
      return;
    }

    grid.innerHTML = matches.slice(0, 9).map((item) => `
      <article class="shop-card">
        <a class="shop-card-media" href="/shop/products/${escapeHtml(item.slug)}">
          ${item.imageUrl
            ? `<div class="shop-photo-frame"><img class="shop-product-photo" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)} by ${escapeHtml(item.creator)}" loading="lazy" decoding="async"></div>`
            : `<div class="shop-text-only-media"><span class="shop-text-only-badge">Text-Only Listing</span><span class="shop-text-only-format">${escapeHtml(item.format)}</span><span class="shop-text-only-note">Live Amazon image unavailable</span></div>`
          }
        </a>
        <div class="shop-card-body">
          <p class="shop-card-meta">${escapeHtml(item.departmentName)} &middot; ${escapeHtml(item.format)}</p>
          <h3><a href="/shop/products/${escapeHtml(item.slug)}">${escapeHtml(item.title)}</a></h3>
          <p class="shop-card-creator">By ${escapeHtml(item.creator)}</p>
          <p class="shop-card-summary">${escapeHtml(item.summary)}</p>
          <div class="shop-card-actions">
            <a class="shop-amazon-btn" href="${escapeHtml(item.amazonUrl)}" target="_blank" rel="nofollow sponsored noopener noreferrer" data-affiliate-click data-shop-product="${escapeHtml(item.slug)}" data-shop-department="${escapeHtml(item.department)}" data-asin="${escapeHtml(item.asin)}">Check Current Price on Amazon &#8599;</a>
            <a class="shop-detail-link" href="/shop/products/${escapeHtml(item.slug)}">Details</a>
          </div>
        </div>
      </article>
    `).join("");
  }

  for (const btn of personaBtns) {
    btn.addEventListener("click", () => {
      activePersona = btn.dataset.giftPersona || "tarot-beginner";
      for (const other of personaBtns) {
        const isCurrent = other === btn;
        other.classList.toggle("active", isCurrent);
        other.setAttribute("aria-pressed", isCurrent ? "true" : "false");
      }
      renderMatches();
      emitShopEvent("shop_gift_persona_select", { recommendation: activePersona });
    });
  }

  levelSelect?.addEventListener("change", renderMatches);
  formatSelect?.addEventListener("change", renderMatches);
}

function initTelemetryAndAnalytics() {
  const stats = readStats();
  if (window.location.pathname.startsWith("/shop")) {
    stats.views += 1;
    writeStats(stats);
    const productEl = document.querySelector("[data-track-product-view]");
    if (productEl) {
      emitShopEvent("shop_product_view", {
        shop_product: productEl.getAttribute("data-track-product-view") || "",
        shop_department: productEl.getAttribute("data-shop-department") || "",
      });
    } else {
      emitShopEvent("shop_view", { page_path: window.location.pathname });
    }
  }

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("[data-affiliate-click]") : null;
    if (!target) return;
    const nextStats = readStats();
    nextStats.outboundClicks += 1;
    writeStats(nextStats);
    emitShopEvent("affiliate_outbound_click", {
      shop_product: target.getAttribute("data-shop-product") || "",
      shop_department: target.getAttribute("data-shop-department") || "",
      affiliate_tag: target.getAttribute("data-affiliate-tag") || "xelarindo-20",
      affiliate_channel: "website",
    });
  });

  const viewsEl = document.getElementById("stat-shop-views");
  const clicksEl = document.getElementById("stat-outbound-clicks");
  if (viewsEl) viewsEl.textContent = String(stats.views);
  if (clicksEl) clicksEl.textContent = String(stats.outboundClicks);
}

initCatalogFilters();
initGiftFinder();
initTelemetryAndAnalytics();
