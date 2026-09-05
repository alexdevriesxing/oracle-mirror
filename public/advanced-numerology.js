import { calculateNumerologyProfile, isMasterNumber } from "./advanced-numerology-core.js";
import { openShareCard } from "./social-share.js";

let currentProfile = null;

function parseNumberData() {
  const node = document.getElementById("advanced-numerology-number-data");
  if (!node) return [];
  try { return JSON.parse(node.textContent || "[]"); }
  catch { return []; }
}

const numberData = parseNumberData();
const meaningByValue = new Map(numberData.map((item) => [Number(item.value), item]));

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, site_name: "Oracle Mirror", source: "advanced_numerology_v1", page_path: window.location.pathname, timestamp: new Date().toISOString(), ...details });
}

const labels = [
  ["lifePath", "Life Path", "life-path"],
  ["expression", "Expression", "expression"],
  ["soulUrge", "Soul Urge", "soul-urge"],
  ["personality", "Personality", "personality"],
  ["birthday", "Birthday", "birthday"],
  ["personalYear", "Personal Year", "personal-year"],
];

function resultCard(key, label, guideSlug) {
  const value = currentProfile?.[key];
  const meaning = meaningByValue.get(Number(value));
  if (!value || !meaning) return "";
  const extra = key === "personalYear" ? ` · ${currentProfile.personalYearCalendar}` : "";
  return `<article class="advanced-numerology-result-card${isMasterNumber(value) ? " master" : ""}">
    <p class="advanced-numerology-result-label">${esc(label)}${esc(extra)}</p>
    <div class="advanced-numerology-result-number">${esc(value)}</div>
    <h3>${esc(meaning.name)}</h3>
    <p>${esc(meaning.core)}</p>
    <div class="advanced-numerology-result-links"><a href="/numerology/numbers/${esc(value)}">Meaning of ${esc(value)}</a><a href="/numerology/core-numbers/${esc(guideSlug)}">How ${esc(label)} is calculated</a></div>
  </article>`;
}

function renderProfile(profile) {
  currentProfile = profile;
  const results = document.querySelector("[data-numerology-results]");
  const actions = document.querySelector("[data-numerology-actions]");
  if (!results || !actions) return;
  results.innerHTML = `<div class="advanced-numerology-result-grid">${labels.map(([key, label, slug]) => resultCard(key, label, slug)).join("")}</div><p class="advanced-numerology-result-note">These values are interpretive numerology results, not scientific measurements. Your name and birth date remain in the form and are not included in this result markup beyond the derived numbers.</p>`;
  actions.hidden = false;
}

function calculate(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const data = new FormData(form);
  const name = String(data.get("name") || "");
  const birthDate = String(data.get("birthDate") || "");
  const profile = calculateNumerologyProfile(name, birthDate, new Date().getFullYear());
  const results = document.querySelector("[data-numerology-results]");
  if (!profile) {
    currentProfile = null;
    if (results) results.innerHTML = '<p class="advanced-numerology-error">Enter a valid name with at least one vowel and consonant, plus a valid date of birth.</p>';
    document.querySelector("[data-numerology-actions]")?.setAttribute("hidden", "");
    return;
  }
  renderProfile(profile);
  track("result_rendered", { realm: "advanced-numerology", result_kind: "six-number-profile", state: "calculated" });
}

function reset() {
  currentProfile = null;
  const form = document.querySelector("[data-numerology-form]");
  const results = document.querySelector("[data-numerology-results]");
  const actions = document.querySelector("[data-numerology-actions]");
  form?.reset();
  if (results) results.innerHTML = "";
  if (actions) actions.hidden = true;
  form?.querySelector('input[name="name"]')?.focus();
}

async function share() {
  if (!currentProfile) return;
  await openShareCard({
    kind: "advanced-numerology",
    numbers: labels.map(([key]) => currentProfile[key]),
    labels: labels.map(([, label]) => label),
    year: currentProfile.personalYearCalendar,
  }, "advanced-numerology");
  track("share_completed", { realm: "advanced-numerology", result_kind: "six-number-profile" });
}

document.querySelector("[data-numerology-form]")?.addEventListener("submit", calculate);
document.querySelector("[data-numerology-reset]")?.addEventListener("click", reset);
document.querySelector("[data-numerology-share]")?.addEventListener("click", share);

export { calculate, renderProfile };
