import {
  AURA_QUESTIONS,
  buildOracleDuel,
  readPendulum,
  scoreAura,
} from "./interactive-oracles-core.js";

const ROOT_ID = "interactive-oracles";
const STYLESHEET_ID = "interactive-oracles-styles";
let pendulumNonce = 0;
let duelNonce = 0;

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    source: "interactive_oracles_v1",
    page_path: window.location.pathname,
    ...details,
  });
}

function ensureStylesheet() {
  if (document.getElementById(STYLESHEET_ID)) return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = "/interactive-oracles.css";
  document.head.appendChild(link);
}

function entropy(scope) {
  return `${scope}|${crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`}`;
}

function mountShell() {
  const home = document.getElementById("page-home");
  const modules = home?.querySelector("#modules");
  if (!home || !modules || document.getElementById(ROOT_ID)) return null;
  ensureStylesheet();

  const section = document.createElement("section");
  section.id = ROOT_ID;
  section.className = "interactive-oracles";
  section.setAttribute("aria-labelledby", "interactive-oracles-title");
  section.innerHTML = `
    <div class="io-shell">
      <div class="io-heading">
        <p class="io-kicker">The Mirror Lab</p>
        <h2 id="interactive-oracles-title">Three More Ways to Ask Fate</h2>
        <p>Quick symbolic experiments for reflection — one swing, one aura, or two mystics in disagreement.</p>
      </div>
      <div class="io-grid">
        <article class="io-panel io-pendulum">
          <div class="io-icon" aria-hidden="true">◉</div>
          <p class="io-panel-kicker">Pendulum Oracle</p>
          <h3>Ask a yes-or-no question</h3>
          <p>Your question stays in this browser. The pendulum is a playful prompt, not a factual prediction.</p>
          <label class="io-label" for="pendulum-question">Your question</label>
          <input id="pendulum-question" class="io-input" type="text" maxlength="280" autocomplete="off" placeholder="Should I move forward with this?">
          <button type="button" class="btn-gold" data-pendulum-ask>Set the Pendulum Swinging</button>
          <div class="io-result" data-pendulum-result role="status" aria-live="polite"></div>
        </article>

        <article class="io-panel io-aura">
          <div class="io-icon" aria-hidden="true">✺</div>
          <p class="io-panel-kicker">Aura Reading</p>
          <h3>What colour is your energy today?</h3>
          <p>A short personality-style quiz — no camera, scanner, biometric claim, or fake detection.</p>
          <div data-aura-quiz></div>
          <div class="io-result" data-aura-result role="status" aria-live="polite"></div>
        </article>

        <article class="io-panel io-duel">
          <div class="io-icon" aria-hidden="true">⚔</div>
          <p class="io-panel-kicker">Oracle Duel</p>
          <h3>Two mystics. One question. You decide.</h3>
          <p>Your question is interpreted locally and is never sent to an API. Pick which perspective resonates more.</p>
          <label class="io-label" for="duel-question">Your question</label>
          <textarea id="duel-question" class="io-textarea" maxlength="320" rows="3" placeholder="What should I pay attention to in this situation?"></textarea>
          <button type="button" class="btn-gold" data-duel-start>Call Two Mystics</button>
          <div class="io-result" data-duel-result role="status" aria-live="polite"></div>
        </article>
      </div>
      <p class="io-disclaimer">These experiences are symbolic entertainment and reflection tools, not medical, legal, financial, safety, or factual decision systems.</p>
    </div>`;

  home.insertBefore(section, modules);
  return section;
}

function wirePendulum(root) {
  const input = root.querySelector("#pendulum-question");
  const button = root.querySelector("[data-pendulum-ask]");
  const result = root.querySelector("[data-pendulum-result]");
  if (!input || !button || !result) return;

  button.addEventListener("click", async () => {
    const question = input.value.trim();
    if (question.length < 3) {
      result.textContent = "Give the pendulum a short yes-or-no question first.";
      input.focus();
      return;
    }
    button.disabled = true;
    result.innerHTML = '<div class="io-pendulum-stage" aria-hidden="true"><span class="io-pendulum-line"></span><span class="io-pendulum-weight">◆</span></div><p>The pendulum is finding its direction…</p>';
    const outcome = readPendulum(question, `${entropy("pendulum")}|${pendulumNonce++}`);
    window.setTimeout(() => {
      result.innerHTML = `
        <div class="io-reveal">
          <div class="io-reveal-glyph" aria-hidden="true">${outcome.glyph}</div>
          <p class="io-reveal-label">The pendulum says</p>
          <h4>${outcome.label}</h4>
          <p>${outcome.message}</p>
          <div class="io-actions">
            <a class="btn-gold btn-small" href="${outcome.route}">Explore This Further</a>
            <button type="button" class="btn-ghost btn-small" data-share-pendulum>Share Result</button>
            <button type="button" class="io-reset" data-pendulum-again>Ask Again</button>
          </div>
        </div>`;
      result.querySelector("[data-share-pendulum]")?.addEventListener("click", () => {
        window.oracleShare?.openShareCard?.({ kind: "pendulum", outcome: outcome.label, glyph: outcome.glyph }, "pendulum");
      });
      result.querySelector("[data-pendulum-again]")?.addEventListener("click", () => {
        result.innerHTML = "";
        input.focus();
      });
      track("interactive_oracle_reveal", { result_kind: "pendulum", state: outcome.id, realm: outcome.route.slice(1) });
      button.disabled = false;
    }, document.documentElement.dataset.reducedEffects === "true" ? 0 : 650);
  });
}

function renderAuraQuestion(container, index, answers) {
  const question = AURA_QUESTIONS[index];
  if (!question) return;
  container.innerHTML = `
    <div class="io-aura-progress" aria-label="Aura quiz progress"><span style="width:${((index + 1) / AURA_QUESTIONS.length) * 100}%"></span></div>
    <p class="io-aura-count">Question ${index + 1} of ${AURA_QUESTIONS.length}</p>
    <h4>${question.prompt}</h4>
    <div class="io-aura-options" role="group" aria-label="${question.prompt}">
      ${question.options.map((option) => `<button type="button" class="io-choice" data-aura-answer="${option.id}">${option.label}</button>`).join("")}
    </div>`;
  container.querySelectorAll("[data-aura-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      answers[index] = button.dataset.auraAnswer;
      if (index + 1 < AURA_QUESTIONS.length) renderAuraQuestion(container, index + 1, answers);
      else revealAura(container, answers);
    });
  });
}

function revealAura(container, answers) {
  const panel = container.closest(".io-aura");
  const result = panel?.querySelector("[data-aura-result]");
  if (!result) return;
  const aura = scoreAura(answers);
  container.hidden = true;
  result.innerHTML = `
    <div class="io-reveal io-aura-reveal" data-aura="${aura.id}">
      <div class="io-aura-orb" aria-hidden="true"><span>${aura.glyph}</span></div>
      <p class="io-reveal-label">Your current aura</p>
      <h4>${aura.name}</h4>
      <p>${aura.message}</p>
      <div class="io-traits">${aura.traits.map((trait) => `<span>${trait}</span>`).join("")}</div>
      <p class="io-small">Profile fit: ${aura.confidence}% of the quiz scoring landed on this leading pattern.</p>
      <div class="io-actions">
        <a class="btn-gold btn-small" href="${aura.route}">Follow This Energy</a>
        <button type="button" class="btn-ghost btn-small" data-share-aura>Share Aura</button>
        <button type="button" class="io-reset" data-aura-reset>Retake Quiz</button>
      </div>
    </div>`;
  result.querySelector("[data-share-aura]")?.addEventListener("click", () => {
    window.oracleShare?.openShareCard?.({ kind: "aura", aura: aura.name, glyph: aura.glyph, traits: aura.traits }, "aura");
  });
  result.querySelector("[data-aura-reset]")?.addEventListener("click", () => {
    result.innerHTML = "";
    container.hidden = false;
    renderAuraQuestion(container, 0, []);
  });
  track("interactive_oracle_reveal", { result_kind: "aura", state: aura.id, realm: aura.route.slice(1) });
}

function wireAura(root) {
  const quiz = root.querySelector("[data-aura-quiz]");
  if (quiz) renderAuraQuestion(quiz, 0, []);
}

function wireDuel(root) {
  const input = root.querySelector("#duel-question");
  const button = root.querySelector("[data-duel-start]");
  const result = root.querySelector("[data-duel-result]");
  if (!input || !button || !result) return;

  button.addEventListener("click", () => {
    const question = input.value.trim();
    if (question.length < 5) {
      result.textContent = "Give the two mystics a little more to disagree about.";
      input.focus();
      return;
    }
    const duel = buildOracleDuel(question, `${entropy("duel")}|${duelNonce++}`);
    result.innerHTML = `
      <div class="io-duel-stage">
        <p class="io-reveal-label">Theme detected locally: ${duel.theme}</p>
        <div class="io-duel-grid">
          ${duel.contestants.map((mystic, index) => `
            <article class="io-duelist">
              <div class="io-duelist-glyph" aria-hidden="true">${mystic.glyph}</div>
              <h4>${mystic.name}</h4>
              <p>${mystic.response}</p>
              <button type="button" class="btn-ghost btn-small" data-duel-vote="${index}">This Resonates More</button>
            </article>`).join("")}
        </div>
        <div class="io-duel-verdict" data-duel-verdict aria-live="polite"></div>
      </div>`;
    track("interactive_oracle_reveal", { result_kind: "oracle_duel", state: duel.theme });

    result.querySelectorAll("[data-duel-vote]").forEach((vote) => {
      vote.addEventListener("click", () => {
        const winnerIndex = Number(vote.dataset.duelVote || 0);
        const winner = duel.contestants[winnerIndex];
        const other = duel.contestants[winnerIndex === 0 ? 1 : 0];
        const verdict = result.querySelector("[data-duel-verdict]");
        result.querySelectorAll("[data-duel-vote]").forEach((node) => {
          node.disabled = true;
          node.setAttribute("aria-pressed", node === vote ? "true" : "false");
        });
        if (verdict) {
          verdict.innerHTML = `
            <div class="io-reveal">
              <p class="io-reveal-label">Your choice</p>
              <h4>${winner.name} wins this round</h4>
              <p>You chose the perspective that resonated more. ${other.name}'s disagreement remains useful as the counterpoint.</p>
              <div class="io-actions">
                <a class="btn-gold btn-small" href="${winner.route}">Consult ${winner.name}</a>
                <button type="button" class="btn-ghost btn-small" data-share-duel>Share Duel</button>
                <button type="button" class="io-reset" data-duel-reset>New Duel</button>
              </div>
            </div>`;
          verdict.querySelector("[data-share-duel]")?.addEventListener("click", () => {
            window.oracleShare?.openShareCard?.({
              kind: "oracle-duel",
              mystics: duel.contestants.map((item) => item.name),
              winner: winner.name,
            }, "oracle-duel");
          });
          verdict.querySelector("[data-duel-reset]")?.addEventListener("click", () => {
            result.innerHTML = "";
            input.focus();
          });
        }
        track("interactive_oracle_choice", { result_kind: "oracle_duel", state: winner.id, realm: winner.route.slice(1) });
      });
    });
  });
}

function boot() {
  const root = mountShell();
  if (!root) return;
  wirePendulum(root);
  wireAura(root);
  wireDuel(root);
}

boot();

export {};
