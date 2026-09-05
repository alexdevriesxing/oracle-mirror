import { buildLenormandReading, drawLenormand } from "./lenormand-core.js";
import { openShareCard } from "./social-share.js";

let currentReading = null;

function deck() {
  try {
    const node = document.getElementById("lenormand-deck-data");
    return JSON.parse(node?.textContent || "[]");
  } catch {
    return [];
  }
}

function randomSeed() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
}

function reducedMotion() {
  try { return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false; }
  catch { return false; }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, reducedMotion() ? 0 : ms));
}

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, site_name: "Oracle Mirror", source: "lenormand_v1", page_path: window.location.pathname, timestamp: new Date().toISOString(), ...details });
}

function cardHtml(card) {
  return `<article class="lenormand-reading-card"><p class="lenormand-position">${card.position.label}</p><span class="lenormand-card-number">#${card.number}</span><div class="lenormand-reading-symbol" aria-hidden="true">${card.symbol}</div><h3>${card.name}</h3><p class="lenormand-reading-keywords">${card.keywords.join(" · ")}</p><p>${card.core}</p><p class="lenormand-reflect"><strong>Reflect:</strong> ${card.reflection}</p><a href="/lenormand/${card.slug}">Explore ${card.name} meaning</a></article>`;
}

function combinationsHtml(reading) {
  const pairs = reading?.pairs || [];
  return `${pairs.map((pair) => `<article class="lenormand-combo"><strong>${pair.left} + ${pair.right}</strong><p>${pair.text}</p></article>`).join("")}<p class="lenormand-summary">${reading?.summary || ""}</p>`;
}

async function draw() {
  const button = document.querySelector("[data-lenormand-draw]");
  const results = document.querySelector("[data-lenormand-results]");
  const combinations = document.querySelector("[data-lenormand-combinations]");
  const actions = document.querySelector("[data-lenormand-actions]");
  if (!button || !results || !combinations || !actions) return;

  button.disabled = true;
  button.textContent = "The cards are turning…";
  results.innerHTML = '<p class="lenormand-drawing-status">Three symbols rise from the mirror…</p>';
  combinations.innerHTML = "";
  await wait(320);
  const cards = drawLenormand(deck(), randomSeed());
  currentReading = buildLenormandReading(cards);
  if (!currentReading) {
    results.innerHTML = '<p class="lenormand-drawing-status">The deck could not be prepared. Refresh and try again.</p>';
    button.textContent = "Draw Three Cards";
    button.disabled = false;
    return;
  }
  results.innerHTML = currentReading.cards.map(cardHtml).join("");
  combinations.innerHTML = combinationsHtml(currentReading);
  actions.hidden = false;
  button.textContent = "Draw Three Cards";
  button.disabled = false;
  track("result_rendered", { realm: "lenormand", result_kind: "three_card_line", state: currentReading.cards.map((card) => card.slug).join("|") });
}

function reset() {
  currentReading = null;
  const results = document.querySelector("[data-lenormand-results]");
  const combinations = document.querySelector("[data-lenormand-combinations]");
  const actions = document.querySelector("[data-lenormand-actions]");
  if (results) results.innerHTML = "";
  if (combinations) combinations.innerHTML = "";
  if (actions) actions.hidden = true;
  document.querySelector("[data-lenormand-draw]")?.focus();
}

async function share() {
  if (!currentReading?.cards || currentReading.cards.length !== 3) return;
  await openShareCard({
    kind: "lenormand",
    cards: currentReading.cards.map((card) => card.name),
    positions: currentReading.cards.map((card) => card.position.label),
  }, "lenormand");
  track("share_completed", { realm: "lenormand", result_kind: "three_card_line" });
}

document.querySelector("[data-lenormand-draw]")?.addEventListener("click", draw);
document.querySelector("[data-lenormand-reset]")?.addEventListener("click", reset);
document.querySelector("[data-lenormand-share]")?.addEventListener("click", share);

export { draw };
