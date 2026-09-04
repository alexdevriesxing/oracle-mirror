import {
  activeStreakForDate,
  buildDailyMirror,
  completeDailyRitual,
  localDateKey,
  normalizeRitualState,
  ritualBadgeProgress,
} from "./daily-ritual-core.js";

const STORAGE_KEY = "oracle-mirror-daily-ritual-v1";
const STYLESHEET_ID = "oracle-daily-ritual-styles";

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeRitualState(raw ? JSON.parse(raw) : null);
  } catch {
    return normalizeRitualState(null);
  }
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The ritual remains usable even when storage is blocked.
  }
}

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    source: "daily_ritual_v1",
    page_path: window.location.pathname,
    ...details,
  });
}

function ensureStylesheet() {
  if (document.getElementById(STYLESHEET_ID)) return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = "/daily-ritual.css";
  document.head.appendChild(link);
}

function formatDisplayDate(date = new Date()) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function scoreMarkup(label, value) {
  return `
    <div class="ritual-score">
      <div class="ritual-score-head"><span>${label}</span><strong>${value}</strong></div>
      <div class="ritual-score-track" role="meter" aria-label="${label} score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
        <span style="--ritual-score:${value}%"></span>
      </div>
    </div>`;
}

function badgeMarkup(state) {
  const { current, next } = ritualBadgeProgress(state);
  const currentText = current
    ? `<span class="ritual-badge-glyph" aria-hidden="true">${current.glyph}</span><span><strong>${current.name}</strong><small>Best streak: ${state.bestStreak} day${state.bestStreak === 1 ? "" : "s"}</small></span>`
    : `<span class="ritual-badge-glyph" aria-hidden="true">✦</span><span><strong>Your first badge awaits</strong><small>Reveal today's mirror to begin.</small></span>`;

  const nextText = next
    ? `${Math.max(0, next.threshold - state.bestStreak)} day${next.threshold - state.bestStreak === 1 ? "" : "s"} to ${next.name}`
    : "Every ritual badge unlocked";

  return `
    <div class="ritual-badge-card">
      <div class="ritual-badge-current">${currentText}</div>
      <div class="ritual-badge-next">${nextText}</div>
    </div>`;
}

function renderLocked(container, mirror, state, dateKey) {
  const streak = activeStreakForDate(state, dateKey);
  container.innerHTML = `
    <div class="ritual-shell ritual-locked">
      <div class="ritual-heading-row">
        <div>
          <p class="ritual-kicker">Daily ritual · ${formatDisplayDate()}</p>
          <h2 id="daily-ritual-title">Your Mirror Today</h2>
          <p class="ritual-intro">One card, one cosmic weather report, one lucky signal, and one realm chosen for today.</p>
        </div>
        <div class="ritual-streak" aria-label="Current ritual streak">
          <span class="ritual-streak-flame" aria-hidden="true">✦</span>
          <strong>${streak}</strong>
          <small>day streak</small>
        </div>
      </div>

      <div class="ritual-preview" aria-hidden="true">
        <div><span>Card</span><strong>?</strong></div>
        <div><span>Moon</span><strong>?</strong></div>
        <div><span>Lucky No.</span><strong>?</strong></div>
        <div><span>Realm</span><strong>?</strong></div>
      </div>

      <div class="ritual-lock-copy">
        <span class="ritual-lock-glyph" aria-hidden="true">☾</span>
        <p>The mirror changes once each day. Revealing it also records your streak on this device.</p>
      </div>

      <button type="button" class="btn-gold ritual-reveal" data-ritual-reveal>
        Reveal Today's Mirror
      </button>
      <p class="ritual-privacy-note">No account needed. Your streak stays in this browser.</p>
    </div>`;

  container.querySelector("[data-ritual-reveal]")?.addEventListener("click", () => {
    const nextState = completeDailyRitual(loadState(), dateKey);
    saveState(nextState);
    renderRevealed(container, mirror, nextState, "button");
  }, { once: true });
}

function renderRevealed(container, mirror, state, trigger = "auto") {
  const badge = ritualBadgeProgress(state).current;
  container.innerHTML = `
    <div class="ritual-shell ritual-revealed">
      <div class="ritual-heading-row">
        <div>
          <p class="ritual-kicker">Daily ritual · ${formatDisplayDate()}</p>
          <h2 id="daily-ritual-title">Your Mirror Today</h2>
          <p class="ritual-intro">${mirror.theme}</p>
        </div>
        <div class="ritual-streak ritual-streak-active" aria-label="Current ritual streak">
          <span class="ritual-streak-flame" aria-hidden="true">✦</span>
          <strong>${state.streak}</strong>
          <small>day streak</small>
        </div>
      </div>

      <div class="ritual-grid">
        <article class="ritual-card ritual-tarot-card">
          <p class="ritual-card-label">Card of the day</p>
          <div class="ritual-tarot-glyph" aria-hidden="true">${mirror.tarot.glyph}</div>
          <h3>${mirror.tarot.name}</h3>
          <p>${mirror.tarot.message}</p>
        </article>

        <article class="ritual-card ritual-cosmic-card">
          <p class="ritual-card-label">Cosmic weather</p>
          <div class="ritual-moon-line"><span aria-hidden="true">${mirror.moon.glyph}</span><strong>${mirror.moon.name}</strong></div>
          <p>${mirror.themeMessage}</p>
          <div class="ritual-signals">
            <span><small>Element</small><strong>${mirror.element}</strong></span>
            <span><small>Lucky number</small><strong>${mirror.luckyNumber}</strong></span>
            <span><small>Lucky color</small><strong><i class="ritual-color-dot" style="--ritual-lucky-color:${mirror.luckyColor.hex}"></i>${mirror.luckyColor.name}</strong></span>
          </div>
        </article>

        <article class="ritual-card ritual-energy-card">
          <p class="ritual-card-label">Today's energy</p>
          ${scoreMarkup("Mood", mirror.scores.mood)}
          ${scoreMarkup("Love", mirror.scores.love)}
          ${scoreMarkup("Money", mirror.scores.money)}
        </article>

        <article class="ritual-card ritual-recommendation-card">
          <p class="ritual-card-label">Recommended realm</p>
          <h3>${mirror.recommendation.title}</h3>
          <p>${mirror.recommendation.reason}</p>
          <a class="btn-gold ritual-realm-link" href="${mirror.recommendation.path}" data-ritual-recommendation>
            Enter This Realm
          </a>
          <a class="ritual-full-fortune" href="/daily-fortune">Open the full Daily Fortune →</a>
        </article>
      </div>

      <div class="ritual-footer-row">
        ${badgeMarkup(state)}
        <div class="ritual-complete-copy" role="status" aria-live="polite">
          <strong>Today's ritual is complete.</strong>
          <span>The mirror will change with your next local day.</span>
        </div>
      </div>
    </div>`;

  const eventDetails = {
    ritual_card: mirror.tarot.name,
    recommendation: mirror.recommendation.realm,
    badge: badge?.name || "none",
    streak: state.streak,
    best_streak: state.bestStreak,
    total_days: state.totalDays,
    mood_score: mirror.scores.mood,
    love_score: mirror.scores.love,
    money_score: mirror.scores.money,
    state: trigger === "auto" ? "repeat_same_day" : "completed",
    trigger,
  };

  track("daily_ritual_revealed", eventDetails);

  container.querySelector("[data-ritual-recommendation]")?.addEventListener("click", () => {
    track("daily_ritual_recommendation_click", {
      recommendation: mirror.recommendation.realm,
      realm: mirror.recommendation.realm,
      streak: state.streak,
      state: "completed",
    });
  });
}

function mountDailyRitual() {
  const home = document.getElementById("page-home");
  if (!home || document.getElementById("daily-ritual")) return;

  ensureStylesheet();

  const section = document.createElement("section");
  section.id = "daily-ritual";
  section.className = "daily-ritual";
  section.setAttribute("aria-labelledby", "daily-ritual-title");

  const leaderboard = home.querySelector(".oracle-ad-home-leaderboard");
  if (leaderboard) leaderboard.insertAdjacentElement("afterend", section);
  else home.querySelector("#hero")?.insertAdjacentElement("afterend", section);

  const dateKey = localDateKey();
  const mirror = buildDailyMirror(dateKey);
  const state = loadState();
  const completedToday = state.lastCompletedDate === dateKey;

  track("daily_ritual_impression", {
    state: completedToday ? "completed_today" : "unrevealed",
    streak: activeStreakForDate(state, dateKey),
    best_streak: state.bestStreak,
    total_days: state.totalDays,
  });

  if (completedToday) renderRevealed(section, mirror, state, "auto");
  else renderLocked(section, mirror, state, dateKey);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountDailyRitual, { once: true });
} else {
  mountDailyRitual();
}

export { mountDailyRitual };
