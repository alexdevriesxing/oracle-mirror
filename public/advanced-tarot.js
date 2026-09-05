import { TAROT_SPREADS, drawTarot } from "./advanced-tarot-core.js";
import { openShareCard } from "./social-share.js";

let currentReading = [];
let currentSpread = "three-card";

function parseDeck() {
  const node = document.getElementById("advanced-tarot-deck-data");
  if (!node) return [];
  try { return JSON.parse(node.textContent || "[]"); }
  catch { return []; }
}

function randomSeed() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function reducedMotion() {
  try { return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false; }
  catch { return false; }
}

function wait(ms) { return new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : ms)); }

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, site_name: "Oracle Mirror", source: "advanced_tarot_v1", page_path: window.location.pathname, timestamp: new Date().toISOString(), ...details });
}

function esc(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function cardHtml(item) {
  const orientation = item.reversed ? "Reversed" : "Upright";
  return `<article class="advanced-tarot-card ${item.reversed ? "is-reversed" : ""}">
    <p class="advanced-tarot-position">${esc(item.position)}</p>
    <div class="advanced-tarot-glyph" aria-hidden="true">${esc(item.glyph)}</div>
    <h3>${esc(item.name)}</h3>
    <p class="advanced-tarot-orientation">${orientation}</p>
    <p>${esc(item.message)}</p>
    <a href="/tarot/cards/${esc(item.slug)}">Explore ${esc(item.name)}</a>
  </article>`;
}

async function draw() {
  const deck = parseDeck();
  const select = document.querySelector("[data-tarot-spread]");
  const results = document.querySelector("[data-tarot-results]");
  const actions = document.querySelector("[data-tarot-actions]");
  const button = document.querySelector("[data-tarot-draw]");
  if (!deck.length || !results || !actions || !button) return;

  currentSpread = select?.value || "three-card";
  button.disabled = true;
  button.textContent = "Shuffling the deck…";
  results.innerHTML = '<p class="advanced-tarot-status">The deck is turning in the mirror…</p>';
  await wait(360);
  currentReading = drawTarot(deck, currentSpread, randomSeed());
  results.innerHTML = currentReading.map(cardHtml).join("");
  actions.hidden = false;
  button.disabled = false;
  button.textContent = "Draw This Spread";
  track("result_rendered", { realm: "advanced-tarot", result_kind: currentSpread, state: currentReading.map((item) => `${item.slug}:${item.reversed ? "r" : "u"}`).join("|") });
}

function reset() {
  currentReading = [];
  const results = document.querySelector("[data-tarot-results]");
  const actions = document.querySelector("[data-tarot-actions]");
  if (results) results.innerHTML = "";
  if (actions) actions.hidden = true;
  document.querySelector("[data-tarot-draw]")?.focus();
}

async function share() {
  if (!currentReading.length) return;
  const spread = TAROT_SPREADS[currentSpread] || TAROT_SPREADS["three-card"];
  await openShareCard({
    kind: "advanced-tarot",
    spread: spread.name,
    cards: currentReading.map((item) => item.name),
    positions: currentReading.map((item) => item.position),
    orientations: currentReading.map((item) => item.reversed ? "Reversed" : "Upright"),
  }, "advanced-tarot");
  track("share_completed", { realm: "advanced-tarot", result_kind: currentSpread });
}

document.querySelector("[data-tarot-draw]")?.addEventListener("click", draw);
document.querySelector("[data-tarot-reset]")?.addEventListener("click", reset);
document.querySelector("[data-tarot-share]")?.addEventListener("click", share);
document.querySelector("[data-tarot-spread]")?.addEventListener("change", (event) => {
  currentSpread = event.target.value;
  reset();
  track("advanced_tarot_spread_selected", { realm: "advanced-tarot", result_kind: currentSpread });
});

export { draw };
