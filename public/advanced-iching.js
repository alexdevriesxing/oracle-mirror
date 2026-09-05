import { castIChing } from "./advanced-iching-core.js";
import { openShareCard } from "./social-share.js";

let currentReading = null;

function parseHexagrams() {
  const node = document.getElementById("advanced-iching-data");
  if (!node) return new Map();
  try { return new Map(JSON.parse(node.textContent || "[]").map((item) => [item.number, item])); }
  catch { return new Map(); }
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
  window.dataLayer.push({ event, site_name: "Oracle Mirror", source: "advanced_iching_v1", page_path: window.location.pathname, timestamp: new Date().toISOString(), ...details });
}

function esc(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function lineHtml(line) {
  const className = `${line.yang ? "yang" : "yin"}${line.changing ? " changing" : ""}`;
  return `<div class="iching-line-row ${className}"><span class="iching-line-number">${line.position}</span><span class="iching-line-figure" aria-hidden="true"><i></i>${line.yang ? "" : "<i></i>"}</span><span class="iching-line-label">${esc(line.label)}</span></div>`;
}

function hexagramHtml(item, label) {
  return `<article class="iching-reading-card"><p class="advanced-iching-kicker">${esc(label)}</p><div class="iching-reading-symbol" aria-hidden="true">${esc(item.symbol)}</div><h3>Hexagram ${item.number}: ${esc(item.name)}</h3><p>${esc(item.summary)}</p><p class="iching-reading-guidance">${esc(item.guidance)}</p><a href="${esc(item.path)}">Explore Hexagram ${item.number}</a></article>`;
}

async function cast() {
  const data = parseHexagrams();
  const results = document.querySelector("[data-iching-results]");
  const actions = document.querySelector("[data-iching-actions]");
  const button = document.querySelector("[data-iching-cast]");
  if (!data.size || !results || !actions || !button) return;
  button.disabled = true;
  button.textContent = "Casting the six lines…";
  results.innerHTML = '<p class="advanced-iching-status">Three coins turn six times in the mirror…</p>';
  await wait(420);
  const castResult = castIChing(randomSeed());
  const current = data.get(castResult.currentNumber);
  const transformed = data.get(castResult.transformedNumber);
  if (!current || !transformed) {
    results.innerHTML = '<p class="advanced-iching-status">The cast could not be resolved. Please try again.</p>';
    button.disabled = false;
    button.textContent = "Cast Six Lines";
    return;
  }
  currentReading = { ...castResult, current, transformed };
  const lines = [...castResult.lines].reverse().map(lineHtml).join("");
  const changeText = castResult.hasChanges
    ? `Changing line${castResult.changingLines.length === 1 ? "" : "s"}: ${castResult.changingLines.join(", ")}. These positions flip to form Hexagram ${transformed.number}.`
    : "No changing lines appeared, so the cast remains in one stable hexagram.";
  results.innerHTML = `<div class="iching-cast-layout"><div class="iching-line-stack" aria-label="Six I Ching lines, displayed top to bottom">${lines}</div><div class="iching-reading-pair">${hexagramHtml(current, "Primary hexagram")}${castResult.hasChanges ? `<div class="iching-change-arrow" aria-hidden="true">→</div>${hexagramHtml(transformed, "Transformed hexagram")}` : ""}</div></div><p class="iching-change-summary">${esc(changeText)}</p><p class="iching-trigram-summary">Lower trigram: <strong>${esc(castResult.lower?.name)}</strong> ${esc(castResult.lower?.glyph)} · Upper trigram: <strong>${esc(castResult.upper?.name)}</strong> ${esc(castResult.upper?.glyph)}</p>`;
  actions.hidden = false;
  button.disabled = false;
  button.textContent = "Cast Six Lines";
  track("result_rendered", { realm: "advanced-iching", result_kind: castResult.hasChanges ? "changing" : "stable", state: `${current.number}${castResult.hasChanges ? `>${transformed.number}` : ""}` });
}

function reset() {
  currentReading = null;
  const results = document.querySelector("[data-iching-results]");
  const actions = document.querySelector("[data-iching-actions]");
  if (results) results.innerHTML = "";
  if (actions) actions.hidden = true;
  document.querySelector("[data-iching-cast]")?.focus();
}

async function share() {
  if (!currentReading) return;
  await openShareCard({
    kind: "iching",
    current: `Hexagram ${currentReading.current.number}: ${currentReading.current.name}`,
    currentSymbol: currentReading.current.symbol,
    transformed: currentReading.hasChanges ? `Hexagram ${currentReading.transformed.number}: ${currentReading.transformed.name}` : "",
    changingLines: currentReading.changingLines,
  }, "advanced-iching");
  track("share_completed", { realm: "advanced-iching", result_kind: currentReading.hasChanges ? "changing" : "stable" });
}

document.querySelector("[data-iching-cast]")?.addEventListener("click", cast);
document.querySelector("[data-iching-reset]")?.addEventListener("click", reset);
document.querySelector("[data-iching-share]")?.addEventListener("click", share);

export { cast };
