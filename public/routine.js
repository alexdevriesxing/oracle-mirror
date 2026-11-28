(() => {
  const CONSENT_KEY = "oracle-mirror-consent-v1";
  const MANIFEST_URL = "/api/editorial-manifest.json";
  let cachedManifest = null;
  let manifestPromise = null;

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

  function emitRoutineEvent(eventName, payload = {}) {
    if (!analyticsAllowed()) return;
    try {
      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: eventName, ...payload });
      }
      const body = JSON.stringify({
        sessionId: sessionStorage.getItem("oracle-telemetry-session") || "routine-session",
        events: [
          {
            event: eventName,
            timestamp: new Date().toISOString(),
            page_path: window.location.pathname,
            ...payload,
          },
        ],
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/telemetry", new Blob([body], { type: "application/json" }));
      }
    } catch {
      // Non-fatal telemetry failure
    }
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  async function loadManifest() {
    if (cachedManifest) return cachedManifest;
    if (!manifestPromise) {
      manifestPromise = fetch(MANIFEST_URL)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.todayDailyEdit) cachedManifest = data;
          return cachedManifest;
        })
        .catch(() => null);
    }
    return manifestPromise;
  }

  function renderDailyEdit(edition) {
    const container = document.getElementById("daily-edit-content");
    if (!container || !edition || !Array.isArray(edition.recommendations)) return;
    const recsHtml = edition.recommendations
      .slice(0, 3)
      .map(
        (rec) => `
      <a class="daily-edit-rec-card" href="${escapeHtml(rec.url)}" target="_blank" rel="noopener noreferrer" data-routine-track="daily_edit_click" data-sister-site="${escapeHtml(rec.siteId)}" data-daily-edit-id="${escapeHtml(edition.themeId)}">
        <span class="daily-edit-site">${escapeHtml(rec.siteName)}</span>
        <strong>${escapeHtml(rec.headline)}</strong>
        <span class="daily-edit-rec-desc">${escapeHtml(rec.description)}</span>
        <span class="daily-edit-rec-link">Explore &#8599;</span>
      </a>`
      )
      .join("");

    container.innerHTML = `
      <div class="daily-edit-theme">
        <span class="daily-edit-badge">Today's Theme &middot; Day ${escapeHtml(edition.dayIndex)}</span>
        <h3>${escapeHtml(edition.title)}</h3>
        <p>&ldquo;${escapeHtml(edition.reflection)}&rdquo;</p>
      </div>
      <div class="daily-edit-recs">${recsHtml}</div>
    `;
  }

  function renderPostReading(containerEl, realmKey) {
    if (!containerEl || !realmKey) return;
    loadManifest().then((manifest) => {
      const mapping = manifest?.postReadingMappings?.[realmKey];
      if (!mapping || !Array.isArray(mapping.recommendations)) return;

      const existing = containerEl.querySelector(".post-reading-inspiration");
      if (existing) existing.remove();

      const aside = document.createElement("aside");
      aside.className = "post-reading-inspiration";
      aside.setAttribute("aria-label", mapping.heading);
      aside.innerHTML = `
        <div class="post-reading-header">
          <div>
            <p class="post-reading-kicker">Sister Publications &middot; Lifestyle Inspiration</p>
            <h3>${escapeHtml(mapping.heading)}</h3>
          </div>
        </div>
        <p class="post-reading-subcopy">${escapeHtml(mapping.subcopy)}</p>
        <div class="post-reading-grid">
          ${mapping.recommendations
            .slice(0, 3)
            .map(
              (rec) => `
            <a class="daily-edit-rec-card" href="${escapeHtml(rec.url)}" target="_blank" rel="noopener noreferrer" data-routine-track="post_reading_click" data-sister-site="${escapeHtml(rec.siteId)}" data-realm="${escapeHtml(realmKey)}">
              <span class="daily-edit-site">${escapeHtml(rec.siteName)}</span>
              <strong>${escapeHtml(rec.headline)}</strong>
              <span class="daily-edit-rec-desc">${escapeHtml(rec.description)}</span>
              <span class="daily-edit-rec-link">Explore &#8599;</span>
            </a>`
            )
            .join("")}
        </div>
        <div class="post-reading-footer">
          <span>Separate from your reading &mdash; purely everyday inspiration.</span>
          <a href="${escapeHtml(mapping.emporiumPath)}" data-routine-track="emporium_post_reading_click" data-realm="${escapeHtml(realmKey)}">${escapeHtml(mapping.emporiumLabel)} &rarr;</a>
        </div>
      `;
      containerEl.appendChild(aside);
      emitRoutineEvent("post_reading_impression", {
        realm: realmKey,
        component: "post_reading_inspiration",
      });
    });
  }

  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-routine-track]");
    if (!link) return;
    emitRoutineEvent(link.dataset.routineTrack || "routine_click", {
      sister_site: link.dataset.sisterSite || "",
      realm: link.dataset.realm || "",
      recommendation: link.dataset.dailyEditId || "",
      component: link.dataset.component || "routine_integration",
    });
  });

  function observeImpressions() {
    if (typeof IntersectionObserver === "undefined") return;
    const targets = [
      { id: "routine-lifestyle-collection", event: "routine_collection_impression" },
      { id: "daily-edit-section", event: "daily_edit_impression" },
      { id: "guest-contributors-section", event: "contributor_impression" },
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const match = targets.find((t) => t.id === entry.target.id);
          if (match) {
            emitRoutineEvent(match.event, { component: match.id });
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.25 }
    );
    for (const target of targets) {
      const el = document.getElementById(target.id);
      if (el) observer.observe(el);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadManifest().then((manifest) => {
      if (manifest?.todayDailyEdit) {
        renderDailyEdit(manifest.todayDailyEdit);
      }
    });
    observeImpressions();
  });

  window.OracleRoutine = {
    renderPostReading,
    loadManifest,
  };
})();
