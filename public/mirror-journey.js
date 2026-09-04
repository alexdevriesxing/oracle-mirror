import {
  RITUAL_BADGES,
  buildDailyMirror,
  localDateKey,
  normalizeRitualState,
} from "./daily-ritual-core.js";
import {
  collectionProgress,
  journeyWindow,
  normalizeJourneyState,
  realmForPath,
  realmQuestProgress,
  recordDailyMirror,
  recordRealmVisit,
  weeklyJourneySummary,
} from "./mirror-journey-core.js";

const JOURNEY_STORAGE_KEY = "oracle-mirror-journey-v1";
const RITUAL_STORAGE_KEY = "oracle-mirror-daily-ritual-v1";
const STYLESHEET_ID = "oracle-mirror-journey-styles";

function loadJson(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function loadJourneyState() {
  return normalizeJourneyState(loadJson(JOURNEY_STORAGE_KEY));
}

function saveJourneyState(state) {
  try {
    localStorage.setItem(JOURNEY_STORAGE_KEY, JSON.stringify(normalizeJourneyState(state)));
  } catch {
    // The journey remains useful in-memory when browser storage is unavailable.
  }
}

function loadRitualState() {
  return normalizeRitualState(loadJson(RITUAL_STORAGE_KEY));
}

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    source: "mirror_journey_v1",
    page_path: window.location.pathname,
    ...details,
  });
}

function ensureStylesheet() {
  if (document.getElementById(STYLESHEET_ID)) return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = "/mirror-journey.css";
  document.head.appendChild(link);
}

function syncTodayIntoJourney(state = loadJourneyState()) {
  const dateKey = localDateKey();
  const ritualState = loadRitualState();
  if (ritualState.lastCompletedDate !== dateKey) return state;
  const nextState = recordDailyMirror(state, buildDailyMirror(dateKey));
  saveJourneyState(nextState);
  return nextState;
}

function recordRealm(pathname = window.location.pathname) {
  const realm = realmForPath(pathname);
  if (!realm) return;
  const nextState = recordRealmVisit(loadJourneyState(), localDateKey(), realm);
  saveJourneyState(nextState);
}

function formatJourneyDay(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  return new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric" }).format(date);
}

function prettyRealm(realm) {
  const labels = {
    tarot: "Tarot",
    "crystal-ball": "Crystal Ball",
    numerology: "Numerology",
    "love-match": "Temple of Love",
    "love-oracle": "Love Oracle",
    "dream-interpreter": "Dream Interpreter",
    iching: "I Ching",
    "western-zodiac": "Western Zodiac",
    "chinese-zodiac": "Chinese Zodiac",
    palmistry: "Palmistry",
    birthchart: "Birth Chart",
    magic8: "Magic 8 Ball",
    "daily-fortune": "Daily Fortune",
    personas: "Mystics",
  };
  return labels[realm] || realm || "another realm";
}

function journeySlotsMarkup(state, dateKey) {
  return journeyWindow(state, dateKey, 7).map(({ dateKey: slotDate, entry }) => {
    if (!entry) {
      return `
        <li class="journey-day journey-day-empty">
          <span class="journey-day-date">${formatJourneyDay(slotDate)}</span>
          <span class="journey-day-glyph" aria-hidden="true">·</span>
          <span class="journey-day-name">Unseen</span>
        </li>`;
    }
    return `
      <li class="journey-day journey-day-complete" title="${entry.cardName}">
        <span class="journey-day-date">${formatJourneyDay(slotDate)}</span>
        <span class="journey-day-glyph" aria-hidden="true">${entry.cardGlyph || "✦"}</span>
        <span class="journey-day-name">${entry.cardName}</span>
      </li>`;
  }).join("");
}

function badgesMarkup(ritualState) {
  return RITUAL_BADGES.map((badge) => {
    const earned = ritualState.bestStreak >= badge.threshold;
    return `
      <li class="journey-badge ${earned ? "journey-badge-earned" : "journey-badge-locked"}">
        <span class="journey-badge-glyph" aria-hidden="true">${earned ? badge.glyph : "◇"}</span>
        <span><strong>${badge.name}</strong><small>${earned ? "Unlocked" : `${badge.threshold} day streak`}</small></span>
      </li>`;
  }).join("");
}

function collectionMarkup(collection) {
  if (!collection.collected.length) {
    return `<p class="journey-empty-copy">Reveal your first Daily Mirror to begin collecting Major Arcana.</p>`;
  }
  return `
    <div class="journey-collection-grid">
      ${collection.collected.slice(0, 12).map((entry) => `
        <div class="journey-collectible" title="Collected ${entry.dateKey}">
          <span aria-hidden="true">${entry.cardGlyph || "✦"}</span>
          <strong>${entry.cardName}</strong>
        </div>`).join("")}
    </div>
    ${collection.uniqueCards > 12 ? `<p class="journey-more-copy">${collection.uniqueCards - 12} more collected card${collection.uniqueCards - 12 === 1 ? "" : "s"} are safely recorded in this browser.</p>` : ""}`;
}

function recapMarkup(summary) {
  if (!summary.completedDays) {
    return `
      <div class="journey-recap-empty">
        <strong>Your first weekly pattern is waiting.</strong>
        <span>Complete today's ritual and the Mirror will start connecting the dots.</span>
      </div>`;
  }

  const strongestLabel = summary.strongestArea.charAt(0).toUpperCase() + summary.strongestArea.slice(1);
  const recurring = summary.recurringRecommendation
    ? `The Mirror most often pointed you toward ${prettyRealm(summary.recurringRecommendation)}.`
    : "Your recommendations are still forming a pattern.";

  return `
    <div class="journey-recap-grid">
      <div><span>Reflections</span><strong>${summary.completedDays}/7</strong><small>last seven days</small></div>
      <div><span>Strongest signal</span><strong>${strongestLabel}</strong><small>${summary.averages[summary.strongestArea]} average</small></div>
      <div><span>Realms explored</span><strong>${summary.realmsExplored}</strong><small>this week</small></div>
    </div>
    <p class="journey-recap-note">${recurring}</p>`;
}

function shareText(entry, ritualState) {
  return `My Oracle Mirror today: ${entry.cardName}. ${entry.theme} · ${entry.moonName} · Lucky number ${entry.luckyNumber}. Current streak: ${ritualState.streak} day${ritualState.streak === 1 ? "" : "s"}.`;
}

async function shareToday(entry, ritualState, button) {
  const text = shareText(entry, ritualState);
  const url = "https://oraclemirror.com/";
  try {
    if (navigator.share) {
      await navigator.share({ title: "My Oracle Mirror Today", text, url });
      track("mirror_journey_share", { state: "native", ritual_card: entry.cardName, streak: ritualState.streak });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    const original = button.textContent;
    button.textContent = "Copied to Clipboard";
    window.setTimeout(() => { button.textContent = original; }, 2200);
    track("mirror_journey_share", { state: "clipboard", ritual_card: entry.cardName, streak: ritualState.streak });
  } catch (error) {
    if (error?.name !== "AbortError") track("mirror_journey_share", { state: "failed" });
  }
}

function renderJourney(container, rawState = loadJourneyState()) {
  const dateKey = localDateKey();
  const state = syncTodayIntoJourney(rawState);
  const ritualState = loadRitualState();
  const summary = weeklyJourneySummary(state, dateKey);
  const collection = collectionProgress(state);
  const quest = realmQuestProgress(state, dateKey, 3);
  const todayEntry = state.entries.find((entry) => entry.dateKey === dateKey) || null;
  const questPercent = Math.min(100, Math.round((quest.current / quest.target) * 100));

  container.innerHTML = `
    <div class="journey-shell">
      <div class="journey-heading">
        <div>
          <p class="journey-kicker">Your private seven-day path</p>
          <h2 id="mirror-journey-title">The Mirror Journey</h2>
          <p>See the pattern behind your daily reflections, collect Major Arcana, and explore more of the Mirror.</p>
        </div>
        <div class="journey-collection-count" aria-label="Major Arcana collection progress">
          <strong>${collection.uniqueCards}<span>/22</span></strong>
          <small>cards collected</small>
        </div>
      </div>

      <ol class="journey-week" aria-label="Your last seven Daily Mirror reflections">
        ${journeySlotsMarkup(state, dateKey)}
      </ol>

      <div class="journey-panels">
        <article class="journey-panel journey-recap">
          <p class="journey-panel-label">Weekly mirror</p>
          <h3>Your pattern so far</h3>
          ${recapMarkup(summary)}
        </article>

        <article class="journey-panel journey-quest">
          <p class="journey-panel-label">Weekly quest</p>
          <h3>${quest.complete ? "Realm Explorer complete" : "Explore three different realms"}</h3>
          <p>${quest.complete ? "You have looked at the week through more than one lens. The Mirror approves of intellectual promiscuity." : `${quest.actual} unique realm${quest.actual === 1 ? "" : "s"} visited this week. Follow a recommendation or choose your own path.`}</p>
          <div class="journey-progress" role="progressbar" aria-label="Weekly realm exploration quest" aria-valuemin="0" aria-valuemax="${quest.target}" aria-valuenow="${quest.current}">
            <span style="--journey-progress:${questPercent}%"></span>
          </div>
          <strong class="journey-progress-copy">${quest.current}/${quest.target} realms</strong>
          ${todayEntry?.recommendationPath && !quest.complete ? `<a class="journey-inline-link" href="${todayEntry.recommendationPath}">Follow today's recommendation →</a>` : ""}
        </article>
      </div>

      <div class="journey-badge-section">
        <div class="journey-subheading">
          <div>
            <p class="journey-panel-label">Streak shelf</p>
            <h3>Your ritual badges</h3>
          </div>
          <span>Best streak: <strong>${ritualState.bestStreak}</strong></span>
        </div>
        <ul class="journey-badges">${badgesMarkup(ritualState)}</ul>
      </div>

      <details class="journey-collection">
        <summary>
          <span><strong>Major Arcana Collection</strong><small>${collection.uniqueCards} unique card${collection.uniqueCards === 1 ? "" : "s"} discovered</small></span>
          <span class="journey-collection-percent">${collection.percent}%</span>
        </summary>
        <div class="journey-collection-body">${collectionMarkup(collection)}</div>
      </details>

      <div class="journey-actions">
        ${todayEntry ? `<button type="button" class="btn-gold journey-share" data-journey-share>Share Today's Mirror</button>` : `<a class="btn-gold journey-start" href="#daily-ritual">Reveal Today's Mirror</a>`}
        <p>Journey history, badges, and collections remain on this device. No reading text or personal question is stored here.</p>
      </div>
    </div>`;

  container.querySelector("[data-journey-share]")?.addEventListener("click", (event) => {
    shareToday(todayEntry, ritualState, event.currentTarget);
  });

  container.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", () => {
      const realm = realmForPath(new URL(link.href, window.location.origin).pathname);
      if (realm) track("mirror_journey_realm_cta", { realm, state: quest.complete ? "quest_complete" : "quest_active" });
    });
  });

  track("mirror_journey_impression", {
    state: todayEntry ? "today_complete" : "today_incomplete",
    journey_days: summary.completedDays,
    unique_cards: collection.uniqueCards,
    realms_explored: summary.realmsExplored,
    streak: ritualState.streak,
    best_streak: ritualState.bestStreak,
  });
}

function mountMirrorJourney() {
  recordRealm();
  const home = document.getElementById("page-home");
  if (!home || document.getElementById("mirror-journey")) return;
  ensureStylesheet();

  const section = document.createElement("section");
  section.id = "mirror-journey";
  section.className = "mirror-journey";
  section.setAttribute("aria-labelledby", "mirror-journey-title");

  const ritual = document.getElementById("daily-ritual");
  if (ritual) ritual.insertAdjacentElement("afterend", section);
  else home.querySelector("#modules")?.insertAdjacentElement("beforebegin", section);
  renderJourney(section);
}

window.addEventListener("oracle:daily-ritual-completed", (event) => {
  const mirror = event.detail?.mirror;
  const section = document.getElementById("mirror-journey");
  if (!mirror) return;
  const nextState = recordDailyMirror(loadJourneyState(), mirror);
  saveJourneyState(nextState);
  if (section) renderJourney(section, nextState);
});

window.addEventListener("popstate", () => recordRealm());

document.addEventListener("click", (event) => {
  const link = event.target?.closest?.("a[href]");
  if (!link) return;
  try {
    const url = new URL(link.href, window.location.origin);
    if (url.origin !== window.location.origin) return;
    const realm = realmForPath(url.pathname);
    if (!realm) return;
    const nextState = recordRealmVisit(loadJourneyState(), localDateKey(), realm);
    saveJourneyState(nextState);
  } catch {
    // Ignore malformed links without affecting navigation.
  }
}, { capture: true });

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountMirrorJourney, { once: true });
} else {
  mountMirrorJourney();
}

export { mountMirrorJourney };
