import {
  SAFE_INSTANT_ROUTES,
  assignDoors,
  pickMicroTarot,
  pickMystic,
} from "./instant-mysteries-core.js";

const ROOT_ID = "instant-mysteries";
const STYLESHEET_ID = "instant-mysteries-styles";
let previousMysticId = "";
let doorAssignments = [];

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    source: "instant_mysteries_v1",
    page_path: window.location.pathname,
    ...details,
  });
}

function randomSeed(scope) {
  const entropy = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  return `${scope}|${entropy}`;
}

function reducedMotion() {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
  } catch {
    return false;
  }
}

function pause(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, reducedMotion() ? 0 : ms));
}

function ensureStylesheet() {
  if (document.getElementById(STYLESHEET_ID)) return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = "/instant-mysteries.css";
  document.head.appendChild(link);
}

function safeRoute(route) {
  return SAFE_INSTANT_ROUTES.has(route) ? route : "/";
}

function continueLink(route, label, kind) {
  return `<a class="btn-gold instant-continue" href="${safeRoute(route)}" data-mystery-continue="${kind}">${label}</a>`;
}

function mountShell() {
  const home = document.getElementById("page-home");
  const modules = home?.querySelector("#modules");
  if (!home || !modules || document.getElementById(ROOT_ID)) return null;

  ensureStylesheet();
  const section = document.createElement("section");
  section.id = ROOT_ID;
  section.className = "instant-mysteries";
  section.setAttribute("aria-labelledby", "instant-mysteries-title");
  section.innerHTML = `
    <div class="instant-shell">
      <div class="instant-heading">
        <p class="instant-kicker">No question required</p>
        <h2 id="instant-mysteries-title">Instant Mysteries</h2>
        <p>Three tiny rituals for when you want the mirror to make the first move.</p>
      </div>
      <div class="instant-grid">
        <article class="instant-panel instant-roulette" data-instant-panel="roulette">
          <div class="instant-panel-icon" aria-hidden="true">✺</div>
          <p class="instant-panel-kicker">Mystic Roulette</p>
          <h3>Let fate choose your realm</h3>
          <p>Spin the mirror and discover which Oracle wants your attention next.</p>
          <button type="button" class="btn-gold instant-primary" data-roll-mystic>Spin the Mirror</button>
          <div class="instant-result" data-roulette-result role="status" aria-live="polite"></div>
        </article>

        <article class="instant-panel instant-pick-card" data-instant-panel="pick-card">
          <div class="instant-panel-icon" aria-hidden="true">🃏</div>
          <p class="instant-panel-kicker">Pick a Card</p>
          <h3>One card. One message. Right now.</h3>
          <p>Choose one of the three face-down cards and reveal a quick Major Arcana reflection.</p>
          <div class="instant-card-row" role="group" aria-label="Choose one tarot card">
            <button type="button" class="instant-card-choice" data-card-slot="0" aria-label="Choose the left tarot card"><span>✦</span></button>
            <button type="button" class="instant-card-choice" data-card-slot="1" aria-label="Choose the middle tarot card"><span>✦</span></button>
            <button type="button" class="instant-card-choice" data-card-slot="2" aria-label="Choose the right tarot card"><span>✦</span></button>
          </div>
          <div class="instant-result" data-card-result role="status" aria-live="polite"></div>
        </article>

        <article class="instant-panel instant-three-doors" data-instant-panel="three-doors">
          <div class="instant-panel-icon" aria-hidden="true">🚪</div>
          <p class="instant-panel-kicker">Three Doors</p>
          <h3>Opportunity, warning, or surprise?</h3>
          <p>Each door hides one. You will only discover which after choosing.</p>
          <div class="instant-door-row" role="group" aria-label="Choose one mystical door">
            <button type="button" class="instant-door instant-door-gold" data-door-index="0" aria-label="Choose the Golden Door"><span class="door-symbol">☀</span><span>Golden</span></button>
            <button type="button" class="instant-door instant-door-moon" data-door-index="1" aria-label="Choose the Moon Door"><span class="door-symbol">☾</span><span>Moon</span></button>
            <button type="button" class="instant-door instant-door-crimson" data-door-index="2" aria-label="Choose the Crimson Door"><span class="door-symbol">✦</span><span>Crimson</span></button>
          </div>
          <div class="instant-result" data-door-result role="status" aria-live="polite"></div>
        </article>
      </div>
      <p class="instant-disclaimer">Instant Mysteries are playful symbolic prompts for reflection and entertainment.</p>
    </div>`;

  home.insertBefore(section, modules);
  return section;
}

function resetCardPanel(root) {
  root.querySelectorAll("[data-card-slot]").forEach((button) => {
    button.disabled = false;
    button.classList.remove("revealed", "dimmed");
    button.innerHTML = "<span>✦</span>";
  });
  const result = root.querySelector("[data-card-result]");
  if (result) result.innerHTML = "";
}

function resetDoorPanel(root) {
  doorAssignments = assignDoors(randomSeed("three-doors"));
  root.querySelectorAll("[data-door-index]").forEach((button) => {
    button.disabled = false;
    button.classList.remove("opened", "dimmed");
    button.removeAttribute("aria-pressed");
  });
  const result = root.querySelector("[data-door-result]");
  if (result) result.innerHTML = "";
}

async function sharePickCard(card) {
  if (!window.oracleShare?.openShareCard) return;
  await window.oracleShare.openShareCard({
    kind: "pick-card",
    card: card.name,
    glyph: card.glyph,
    message: card.message,
  }, "pick-card");
}

async function shareDoor(doorLabel, outcome) {
  if (!window.oracleShare?.openShareCard) return;
  await window.oracleShare.openShareCard({
    kind: "three-doors",
    door: doorLabel,
    outcome: outcome.title,
    glyph: outcome.glyph,
    message: outcome.message,
    category: outcome.category,
  }, "three-doors");
}

function wireRoulette(root) {
  const button = root.querySelector("[data-roll-mystic]");
  const result = root.querySelector("[data-roulette-result]");
  if (!button || !result) return;

  button.addEventListener("click", async () => {
    button.disabled = true;
    button.classList.add("is-spinning");
    result.innerHTML = '<div class="instant-reveal-loading">The mirror turns through the realms…</div>';
    track("instant_mystery_open", { result_kind: "mystic_roulette", state: "spinning" });
    await pause(650);

    const option = pickMystic(randomSeed("roulette"), previousMysticId);
    previousMysticId = option?.id || "";
    if (!option) {
      result.textContent = "The mirror went strangely quiet. Spin again.";
    } else {
      result.innerHTML = `
        <div class="instant-reveal-card">
          <div class="instant-reveal-glyph" aria-hidden="true">${option.glyph}</div>
          <p class="instant-reveal-label">${option.oracle} calls</p>
          <h4>${option.title}</h4>
          <p>${option.teaser}</p>
          ${continueLink(option.route, `Enter ${option.title}`, "mystic_roulette")}
        </div>`;
      track("instant_mystery_reveal", {
        result_kind: "mystic_roulette",
        state: option.id,
        realm: option.route.slice(1),
      });
    }
    button.classList.remove("is-spinning");
    button.disabled = false;
    button.textContent = "Spin Again";
  });
}

function wirePickCard(root) {
  const buttons = [...root.querySelectorAll("[data-card-slot]")];
  const result = root.querySelector("[data-card-result]");
  if (!buttons.length || !result) return;

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const slot = Number(button.dataset.cardSlot || 0);
      const card = pickMicroTarot(randomSeed("pick-card"), slot);
      if (!card) return;

      buttons.forEach((candidate) => {
        candidate.disabled = true;
        candidate.classList.toggle("dimmed", candidate !== button);
      });
      button.classList.add("revealed");
      button.innerHTML = `<span class="instant-card-glyph">${card.glyph}</span><strong>${card.name}</strong>`;
      await pause(240);
      result.innerHTML = `
        <div class="instant-reveal-card">
          <p class="instant-reveal-label">Your card</p>
          <h4>${card.name}</h4>
          <p>${card.message}</p>
          <div class="instant-result-actions">
            ${continueLink("/tarot", "Take It to the Tarot", "pick_card")}
            <button type="button" class="btn-ghost btn-small" data-share-picked-card>Share Card</button>
            <button type="button" class="instant-reset" data-reset-card>Draw Again</button>
          </div>
        </div>`;
      result.querySelector("[data-share-picked-card]")?.addEventListener("click", () => sharePickCard(card));
      result.querySelector("[data-reset-card]")?.addEventListener("click", () => resetCardPanel(root));
      track("instant_mystery_reveal", {
        result_kind: "pick_card",
        state: card.name,
        realm: "tarot",
      });
    });
  });
}

function wireDoors(root) {
  const buttons = [...root.querySelectorAll("[data-door-index]")];
  const result = root.querySelector("[data-door-result]");
  if (!buttons.length || !result) return;
  resetDoorPanel(root);

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const index = Number(button.dataset.doorIndex || 0);
      const outcome = doorAssignments[index];
      if (!outcome) return;
      const doorLabel = button.textContent?.trim() || "Mystery Door";

      buttons.forEach((candidate) => {
        candidate.disabled = true;
        candidate.classList.toggle("dimmed", candidate !== button);
        candidate.setAttribute("aria-pressed", candidate === button ? "true" : "false");
      });
      button.classList.add("opened");
      await pause(280);

      const categoryLabel = outcome.category === "opportunity"
        ? "Opportunity"
        : outcome.category === "warning"
          ? "Warning"
          : "Unexpected Turn";
      result.innerHTML = `
        <div class="instant-reveal-card">
          <div class="instant-reveal-glyph" aria-hidden="true">${outcome.glyph}</div>
          <p class="instant-reveal-label">Behind the ${doorLabel} Door · ${categoryLabel}</p>
          <h4>${outcome.title}</h4>
          <p>${outcome.message}</p>
          <div class="instant-result-actions">
            ${continueLink(outcome.route, outcome.cta, "three_doors")}
            <button type="button" class="btn-ghost btn-small" data-share-door>Share Reveal</button>
            <button type="button" class="instant-reset" data-reset-doors>Choose Again</button>
          </div>
        </div>`;
      result.querySelector("[data-share-door]")?.addEventListener("click", () => shareDoor(doorLabel, outcome));
      result.querySelector("[data-reset-doors]")?.addEventListener("click", () => resetDoorPanel(root));
      track("instant_mystery_reveal", {
        result_kind: "three_doors",
        state: outcome.category,
        realm: outcome.route.slice(1),
      });
    });
  });
}

function boot() {
  const root = mountShell();
  if (!root) return;
  wireRoulette(root);
  wirePickCard(root);
  wireDoors(root);
  root.addEventListener("click", (event) => {
    const link = event.target?.closest?.("[data-mystery-continue]");
    if (!link) return;
    track("instant_mystery_continue", {
      result_kind: link.dataset.mysteryContinue || "unknown",
      realm: new URL(link.href, window.location.origin).pathname.slice(1),
    });
  });
}

boot();

window.oracleInstantMysteries = {
  resetDoors: () => {
    const root = document.getElementById(ROOT_ID);
    if (root) resetDoorPanel(root);
  },
  resetCards: () => {
    const root = document.getElementById(ROOT_ID);
    if (root) resetCardPanel(root);
  },
};

export {};
