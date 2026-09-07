import { searchReferenceEntries } from "./reference-search-core.js";

const dataNode = document.getElementById("reference-search-data");
const input = document.querySelector("[data-reference-search-input]");
const systemSelect = document.querySelector("[data-reference-search-system]");
const themeSelect = document.querySelector("[data-reference-search-theme]");
const clearButton = document.querySelector("[data-reference-search-clear]");
const resultsNode = document.querySelector("[data-reference-search-results]");
const statusNode = document.querySelector("[data-reference-search-status]");
const suggestions = [...document.querySelectorAll("[data-reference-search-suggestion]")];

let entries = [];
try {
  const parsed = JSON.parse(dataNode?.textContent || "[]");
  entries = Array.isArray(parsed) ? parsed : [];
} catch {
  entries = [];
}

function readFragment() {
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw || raw === "focus") return { q: "", system: "all", theme: "all", focus: raw === "focus" };
  const params = new URLSearchParams(raw);
  return {
    q: params.get("q") || "",
    system: params.get("system") || "all",
    theme: params.get("theme") || "all",
    focus: false,
  };
}

function writeFragment() {
  const params = new URLSearchParams();
  const q = input?.value.trim() || "";
  const system = systemSelect?.value || "all";
  const theme = themeSelect?.value || "all";
  if (q) params.set("q", q);
  if (system !== "all") params.set("system", system);
  if (theme !== "all") params.set("theme", theme);
  const suffix = params.toString();
  window.history.replaceState(null, "", suffix ? `${window.location.pathname}#${suffix}` : window.location.pathname);
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderResult(entry) {
  const link = element("a", "reference-search-result");
  link.href = entry.path;
  link.dataset.searchResult = "";

  const glyph = element("span", "reference-search-result-glyph", entry.glyph || "✦");
  glyph.setAttribute("aria-hidden", "true");

  const body = element("span", "reference-search-result-body");
  const top = element("span", "reference-search-result-top");
  top.append(element("strong", "", entry.title));
  top.append(element("span", "reference-search-result-system", entry.system));
  body.append(top);
  body.append(element("span", "reference-search-result-summary", entry.summary));

  const meta = element("span", "reference-search-result-meta");
  for (const theme of (entry.themes || []).slice(0, 3)) meta.append(element("span", "reference-search-theme-chip", theme.replace(/-/g, " ")));
  body.append(meta);

  link.append(glyph, body, element("span", "reference-search-result-arrow", "→"));
  return link;
}

function render() {
  if (!input || !systemSelect || !themeSelect || !resultsNode || !statusNode) return;
  const q = input.value.trim();
  const system = systemSelect.value;
  const theme = themeSelect.value;
  const results = searchReferenceEntries(entries, q, { system, theme, limit: 80 });
  resultsNode.replaceChildren();

  if (!q && system === "all" && theme === "all") {
    statusNode.textContent = `Type a word or phrase to search ${entries.length} reference pages.`;
    resultsNode.append(element("p", "reference-search-empty", "Search by card, symbol, dream image, number, planet, palm feature, divination method, or a broader theme."));
    writeFragment();
    return;
  }

  const filterBits = [];
  if (system !== "all") filterBits.push(system);
  if (theme !== "all") filterBits.push(theme.replace(/-/g, " "));
  const qualifier = filterBits.length ? ` in ${filterBits.join(" · ")}` : "";
  statusNode.textContent = `${results.length} result${results.length === 1 ? "" : "s"}${qualifier}${q ? ` for “${q}”` : ""}.`;

  if (!results.length) {
    const empty = element("div", "reference-search-empty");
    empty.append(element("strong", "", "No matching reference pages."));
    empty.append(element("span", "", "Try fewer words, a broader theme, or clear one of the filters."));
    resultsNode.append(empty);
  } else {
    const fragment = document.createDocumentFragment();
    for (const entry of results) fragment.append(renderResult(entry));
    resultsNode.append(fragment);
  }
  writeFragment();
}

function restoreFromFragment({ focus = false } = {}) {
  if (!input || !systemSelect || !themeSelect) return;
  const state = readFragment();
  input.value = state.q;
  if ([...systemSelect.options].some((option) => option.value === state.system)) systemSelect.value = state.system;
  if ([...themeSelect.options].some((option) => option.value === state.theme)) themeSelect.value = state.theme;
  render();
  if (focus || state.focus || state.q) input.focus({ preventScroll: false });
}

input?.addEventListener("input", render);
systemSelect?.addEventListener("change", render);
themeSelect?.addEventListener("change", render);
clearButton?.addEventListener("click", () => {
  if (!input || !systemSelect || !themeSelect) return;
  input.value = "";
  systemSelect.value = "all";
  themeSelect.value = "all";
  render();
  input.focus();
});

for (const button of suggestions) {
  button.addEventListener("click", () => {
    if (!input) return;
    input.value = button.dataset.referenceSearchSuggestion || "";
    render();
    input.focus();
  });
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const shortcut = (event.ctrlKey || event.metaKey) && key === "k";
  const slash = event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey;
  const target = event.target;
  const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement || target?.isContentEditable;
  if ((shortcut || (slash && !editing)) && input) {
    event.preventDefault();
    input.focus();
    input.select();
  }
  if (event.key === "Escape" && document.activeElement === input && input?.value) {
    input.value = "";
    render();
  }
});

window.addEventListener("hashchange", () => restoreFromFragment());
restoreFromFragment({ focus: window.location.hash === "#focus" });
