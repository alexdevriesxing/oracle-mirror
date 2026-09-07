import {
  MIRROR_JOURNAL_ARCHIVE_KEY,
  readMirrorJournal,
  writeMirrorJournal,
} from "./mirror-journal-core.js";
import { markMirrorJournalFollowUp } from "./mirror-journal-recovery-core.js";
import {
  journalFollowUpDashboard,
  journalJourneyBridge,
  journalMonthComparison,
  journalMonthlyTrend,
  journalOnThisDay,
  journalReflectionPrompts,
} from "./mirror-journal-retrospective-core.js";

const JOURNEY_STORAGE_KEY = "oracle-mirror-journey-v1";
const STYLE_ID = "mirror-journal-retrospective-styles";
const ROOT_SELECTOR = "[data-journal-retrospective]";

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "/mirror-journal-retrospective.css";
stylesheet.id = STYLE_ID;
if (!document.getElementById(STYLE_ID)) document.head.appendChild(stylesheet);

let observer = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, className = "btn-ghost btn-small") {
  const node = el("button", className, text);
  node.type = "button";
  return node;
}

function prettyRealm(value) {
  return String(value || "Saved Reading")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function loadJson(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function readEntries() {
  return readMirrorJournal(window.localStorage).entries;
}

function notifyRefresh() {
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: MIRROR_JOURNAL_ARCHIVE_KEY }));
  } catch {
    window.dispatchEvent(new Event("mirror-journal-refresh"));
  }
}

function monthLabel(key) {
  const [year, month] = String(key).split("-").map(Number);
  const date = new Date(year, Math.max(0, month - 1), 1, 12);
  try {
    return new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(date);
  } catch {
    return key;
  }
}

function shortMonthLabel(key) {
  const [year, month] = String(key).split("-").map(Number);
  const date = new Date(year, Math.max(0, month - 1), 1, 12);
  try {
    return new Intl.DateTimeFormat(undefined, { month: "short" }).format(date);
  } catch {
    return key.slice(5);
  }
}

function deltaCopy(metric) {
  if (!metric?.change) return "No change";
  const sign = metric.change > 0 ? "+" : "";
  return `${sign}${metric.change} vs last month`;
}

function metricTile(label, metric) {
  const tile = el("div", "mirror-retro-metric");
  const value = el("strong", "", String(metric.current));
  const change = el("span", "", deltaCopy(metric));
  change.dataset.direction = metric.direction;
  tile.append(el("small", "", label), value, change);
  return tile;
}

function trendChart(trend) {
  const wrap = el("div", "mirror-retro-trend");
  const max = Math.max(1, ...trend.months.map((month) => month.readings));
  const list = el("ol", "mirror-retro-trend-bars");
  list.setAttribute("aria-label", "Six month saved-reading trend");
  for (const month of trend.months) {
    const item = el("li", "mirror-retro-trend-item");
    const bar = el("span", "mirror-retro-trend-bar");
    bar.style.setProperty("--retro-bar", `${Math.max(8, Math.round((month.readings / max) * 100))}%`);
    bar.setAttribute("aria-label", `${monthLabel(month.key)}: ${month.readings} saved reading${month.readings === 1 ? "" : "s"}`);
    bar.append(el("i", ""));
    item.append(bar, el("small", "", shortMonthLabel(month.key)), el("strong", "", String(month.readings)));
    list.append(item);
  }
  const continuity = el("p", "mirror-retro-continuity");
  continuity.textContent = trend.currentStreakMonths
    ? `${trend.currentStreakMonths} consecutive active month${trend.currentStreakMonths === 1 ? "" : "s"} · ${trend.activeMonths}/${trend.months.length} months active in this view.`
    : `${trend.activeMonths}/${trend.months.length} months contain saved readings in this view.`;
  wrap.append(list, continuity);
  return wrap;
}

function focusEntry(id) {
  if (!/^journal-[a-z0-9-]+$/i.test(String(id || ""))) return;
  window.dispatchEvent(new CustomEvent("oracle:journal-focus", { detail: { id } }));
}

function onThisDayPanel(entries) {
  const panel = el("article", "mirror-retro-panel mirror-retro-anniversary");
  panel.append(el("p", "mirror-retro-kicker", "On this day"), el("h3", "", "A past reflection, back in view"));
  if (!entries.length) {
    panel.append(el("p", "mirror-retro-muted", "Nothing from this calendar date is stored in the current journal yet. Anniversary resurfacing will appear automatically when a matching date exists."));
    return panel;
  }
  const list = el("div", "mirror-retro-list");
  for (const entry of entries) {
    const row = el("div", "mirror-retro-list-row");
    const copy = el("div");
    copy.append(
      el("strong", "", `${prettyRealm(entry.realm)} · ${entry.year}`),
      el("span", "", `${entry.favorite ? "★ Favorite · " : ""}${entry.tags.length ? entry.tags.map((tag) => `#${tag}`).join(" · ") : "Saved reflection"}`),
    );
    const revisit = button("Revisit");
    revisit.addEventListener("click", () => focusEntry(entry.id));
    row.append(copy, revisit);
    list.append(row);
  }
  panel.append(list);
  return panel;
}

function completeFollowUp(id) {
  const entries = readEntries();
  const next = markMirrorJournalFollowUp(entries, id, false, new Date());
  if (!writeMirrorJournal(next, window.localStorage)) return;
  notifyRefresh();
  render();
}

function followUpPanel(dashboard) {
  const panel = el("article", "mirror-retro-panel mirror-retro-followups");
  const heading = el("div", "mirror-retro-panel-heading");
  const copy = el("div");
  copy.append(el("p", "mirror-retro-kicker", "Follow-up desk"), el("h3", "", "Open loops worth revisiting"));
  const count = el("span", "mirror-retro-count", String(dashboard.pendingCount));
  count.setAttribute("aria-label", `${dashboard.pendingCount} pending follow-ups`);
  heading.append(copy, count);
  panel.append(heading);

  if (!dashboard.pendingCount) {
    panel.append(el("p", "mirror-retro-muted", dashboard.completedCount
      ? `No pending follow-ups. ${dashboard.completedCount} saved reading${dashboard.completedCount === 1 ? " has" : "s have"} already been marked complete.`
      : "No readings are marked for follow-up yet. Use the Follow-up button on any journal entry when something deserves a later look."));
    return panel;
  }

  const summary = el("div", "mirror-retro-followup-buckets");
  summary.append(
    el("span", "", `${dashboard.buckets.fresh} under 7 days`),
    el("span", "", `${dashboard.buckets.aging} at 7–29 days`),
    el("span", "", `${dashboard.buckets.longstanding} at 30+ days`),
  );
  panel.append(summary);

  const list = el("div", "mirror-retro-list");
  for (const item of dashboard.pending.slice(0, 8)) {
    const row = el("div", "mirror-retro-list-row");
    const copy = el("div");
    copy.append(
      el("strong", "", prettyRealm(item.realm)),
      el("span", "", `${item.ageDays} day${item.ageDays === 1 ? "" : "s"} ago · ${item.dateKey}${item.tags.length ? ` · ${item.tags.map((tag) => `#${tag}`).join(" · ")}` : ""}`),
    );
    const actions = el("div", "mirror-retro-row-actions");
    const view = button("View");
    view.addEventListener("click", () => focusEntry(item.id));
    const complete = button("Complete");
    complete.addEventListener("click", () => completeFollowUp(item.id));
    actions.append(view, complete);
    row.append(copy, actions);
    list.append(row);
  }
  if (dashboard.pendingCount > 8) list.append(el("p", "mirror-retro-muted", `${dashboard.pendingCount - 8} more pending follow-up${dashboard.pendingCount - 8 === 1 ? "" : "s"} remain in the journal.`));
  panel.append(list);
  return panel;
}

function journeyPanel(bridge) {
  const panel = el("article", "mirror-retro-panel mirror-retro-bridge");
  panel.append(el("p", "mirror-retro-kicker", "Journal × Mirror Journey"), el("h3", "", "Two local histories, one month-long view"));
  const metrics = el("div", "mirror-retro-bridge-metrics");
  const values = [
    ["Journal days", bridge.journalDays],
    ["Daily Mirror days", bridge.journeyDays],
    ["Paired days", bridge.pairedDays],
    ["Journey cards", bridge.uniqueJourneyCards],
  ];
  for (const [label, value] of values) {
    const metric = el("div");
    metric.append(el("strong", "", String(value)), el("span", "", label));
    metrics.append(metric);
  }
  panel.append(metrics);
  const shared = bridge.sharedRealms.length
    ? `Shared realms in the last ${bridge.windowDays} days: ${bridge.sharedRealms.map(prettyRealm).join(" · ")}.`
    : `No realm overlap is recorded between Journal saves and Journey visits in the last ${bridge.windowDays} days yet.`;
  panel.append(el("p", "mirror-retro-muted", shared));
  const home = document.createElement("a");
  home.href = "/#mirror-journey";
  home.className = "btn-ghost btn-small mirror-retro-journey-link";
  home.textContent = "Open Mirror Journey";
  panel.append(home);
  return panel;
}

function promptsPanel(prompts) {
  const panel = el("article", "mirror-retro-panel mirror-retro-prompts");
  panel.append(el("p", "mirror-retro-kicker", "Private reflection prompts"), el("h3", "", "Questions generated from structure, not your text"));
  const list = el("ol", "mirror-retro-prompts-list");
  for (const prompt of prompts) {
    const item = el("li");
    item.append(el("strong", "", prompt.title), el("p", "", prompt.prompt));
    list.append(item);
  }
  panel.append(list, el("p", "mirror-retro-privacy", "These prompts use only dates, counts, realm names and follow-up state. Your saved questions, answers and private notes are not interpreted by AI or sent anywhere."));
  return panel;
}

function render() {
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;
  const entries = readEntries();
  const journey = loadJson(JOURNEY_STORAGE_KEY);
  const anchor = new Date();
  const comparison = journalMonthComparison(entries, anchor);
  const trend = journalMonthlyTrend(entries, anchor, 6);
  const followUps = journalFollowUpDashboard(entries, anchor);
  const anniversaries = journalOnThisDay(entries, anchor);
  const bridge = journalJourneyBridge(entries, journey, anchor, 30);
  const prompts = journalReflectionPrompts({ comparison, followUps, onThisDay: anniversaries, journeyBridge: bridge });

  const intro = el("div", "mirror-retro-intro");
  const copy = el("div");
  copy.append(
    el("p", "mirror-retro-kicker", "Long view · local only"),
    el("h2", "", "Mirror Retrospectives"),
    el("p", "", "Compare your journal over time, reopen unfinished reflections, and connect saved readings with your Daily Mirror history without uploading the journal."),
  );
  copy.querySelector("h2").id = "mirror-retrospective-title";
  const badge = el("span", "mirror-retro-local-badge", "Browser-only analysis");
  intro.append(copy, badge);

  const comparisonCard = el("section", "mirror-retro-comparison");
  const compareHeader = el("div", "mirror-retro-comparison-header");
  const compareCopy = el("div");
  compareCopy.append(el("p", "mirror-retro-kicker", "Month over month"), el("h3", "", `${monthLabel(comparison.current.key)} vs ${monthLabel(comparison.previous.key)}`));
  const currentTop = comparison.current.topRealm ? `${prettyRealm(comparison.current.topRealm[0])} leads this month` : "No leading realm yet";
  compareHeader.append(compareCopy, el("span", "mirror-retro-top-realm", currentTop));
  const metrics = el("div", "mirror-retro-metrics");
  metrics.append(
    metricTile("Saved readings", comparison.readings),
    metricTile("Active days", comparison.activeDays),
    metricTile("Favorites", comparison.favorites),
    metricTile("Private notes", comparison.notes),
  );
  comparisonCard.append(compareHeader, metrics, trendChart(trend));

  const grid = el("div", "mirror-retro-grid");
  grid.append(onThisDayPanel(anniversaries), followUpPanel(followUps), journeyPanel(bridge), promptsPanel(prompts));

  root.replaceChildren(intro, comparisonCard, grid);
}

function install() {
  const shell = document.querySelector(".mirror-journal-shell");
  if (!shell) return;
  let root = shell.querySelector(ROOT_SELECTOR);
  if (!root) {
    root = el("section", "mirror-journal-retrospective");
    root.dataset.journalRetrospective = "";
    root.setAttribute("aria-labelledby", "mirror-retrospective-title");
    const insights = shell.querySelector("[data-journal-insights]");
    if (insights) insights.insertAdjacentElement("afterend", root);
    else shell.append(root);
  }
  render();

  const list = document.getElementById("archive-list");
  if (list && !observer) {
    observer = new MutationObserver(() => render());
    observer.observe(list, { childList: true, subtree: false });
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === MIRROR_JOURNAL_ARCHIVE_KEY || event.key === JOURNEY_STORAGE_KEY) setTimeout(() => { install(); render(); }, 0);
});
window.addEventListener("mirror-journal-refresh", () => setTimeout(() => { install(); render(); }, 0));
document.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest('a[href="/archive"], [data-nav="archive"]')) setTimeout(install, 0);
}, { capture: true });

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(install, 0), { once: true });
else setTimeout(install, 0);

export {};
