import { drawRunes } from "./runes-core.js";
import { openShareCard } from "./social-share.js";

let currentCast = [];

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
  window.dataLayer.push({ event, site_name: "Oracle Mirror", source: "runes_v1", page_path: window.location.pathname, timestamp: new Date().toISOString(), ...details });
}

function runeHtml(item) {
  return `<article class="rune-cast-card"><p class="rune-position">${item.position.label}</p><div class="rune-cast-glyph" aria-hidden="true">${item.glyph}</div><h3>${item.name}</h3><p class="rune-cast-keywords">${item.keywords}</p><p>${item.message}</p><p class="rune-cast-reflection"><strong>Reflect:</strong> ${item.reflection}</p><a href="/runes/${item.slug}">Explore ${item.name} meaning</a></article>`;
}

async function cast() {
  const button = document.querySelector("[data-rune-cast]");
  const results = document.querySelector("[data-rune-results]");
  const actions = document.querySelector("[data-rune-actions]");
  if (!button || !results || !actions) return;

  button.disabled = true;
  button.textContent = "The runes are turning…";
  results.innerHTML = '<p class="rune-casting-status">The stones scatter across the mirror…</p>';
  await wait(360);
  currentCast = drawRunes(randomSeed());
  results.innerHTML = currentCast.map(runeHtml).join("");
  actions.hidden = false;
  button.textContent = "Cast Three Runes";
  button.disabled = false;
  track("result_rendered", { realm: "runes", result_kind: "three_rune_cast", state: currentCast.map((item) => item.slug).join("|") });
}

function reset() {
  currentCast = [];
  const results = document.querySelector("[data-rune-results]");
  const actions = document.querySelector("[data-rune-actions]");
  if (results) results.innerHTML = "";
  if (actions) actions.hidden = true;
  document.querySelector("[data-rune-cast]")?.focus();
}

async function share() {
  if (currentCast.length !== 3) return;
  await openShareCard({ kind: "runes", runes: currentCast.map((item) => item.name), positions: currentCast.map((item) => item.position.label) }, "runes");
  track("share_completed", { realm: "runes", result_kind: "three_rune_cast" });
}

document.querySelector("[data-rune-cast]")?.addEventListener("click", cast);
document.querySelector("[data-rune-reset]")?.addEventListener("click", reset);
document.querySelector("[data-rune-share]")?.addEventListener("click", share);

export { cast };
