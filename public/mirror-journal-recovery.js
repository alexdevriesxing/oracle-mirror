import {
  MIRROR_JOURNAL_ARCHIVE_KEY,
  readMirrorJournal,
  writeMirrorJournal,
} from "./mirror-journal-core.js";
import {
  markMirrorJournalFollowUp,
  mergeMirrorJournalBackup,
  mirrorJournalInsights,
  validateMirrorJournalBackup,
} from "./mirror-journal-recovery-core.js";

const STYLE_ID = "mirror-journal-recovery-styles";
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "/mirror-journal-recovery.css";
stylesheet.id = STYLE_ID;
if (!document.getElementById(STYLE_ID)) document.head.appendChild(stylesheet);

let pendingRestore = null;
let insightsPeriod = "week";
let observer = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(text, className = "btn-ghost") {
  const node = el("button", className, text);
  node.type = "button";
  return node;
}

function prettyRealm(value) {
  return String(value || "Saved Reading").replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function notifyJournalReload() {
  try {
    window.dispatchEvent(new StorageEvent("storage", { key: MIRROR_JOURNAL_ARCHIVE_KEY }));
  } catch {
    window.dispatchEvent(new Event("mirror-journal-refresh"));
  }
  setTimeout(() => {
    renderInsights();
    patchEntryFollowUps();
  }, 0);
}

function readEntries() {
  return readMirrorJournal(window.localStorage).entries;
}

function formatPairs(items, formatter = (key) => prettyRealm(key)) {
  if (!items?.length) return "None yet";
  return items.map(([key, count]) => `${formatter(key)} (${count})`).join(" · ");
}

function insightMetric(label, value) {
  const tile = el("div", "mirror-journal-insight-metric");
  tile.append(el("strong", "", String(value)), el("span", "", label));
  return tile;
}

function renderInsights() {
  const root = document.querySelector("[data-journal-insights]");
  if (!root) return;
  const insight = mirrorJournalInsights(readEntries(), { period: insightsPeriod, anchorDate: new Date() });
  const periodLabel = insightsPeriod === "month" ? "This month" : "This week";
  const recurringRealms = formatPairs(insight.recurringRealms);
  const recurringTags = formatPairs(insight.recurringTags, (tag) => `#${tag}`);
  const topRealms = formatPairs(insight.topRealms);
  const topTags = formatPairs(insight.topTags, (tag) => `#${tag}`);

  const header = el("div", "mirror-journal-insights-header");
  const copy = el("div");
  copy.append(el("p", "mirror-journal-insights-kicker", "Local pattern recap"), el("h3", "", `${periodLabel} in your mirror`));
  const toggles = el("div", "mirror-journal-insights-toggle");
  for (const period of ["week", "month"]) {
    const control = button(period === "week" ? "This Week" : "This Month", "btn-ghost btn-small");
    control.dataset.selected = insightsPeriod === period ? "true" : "false";
    control.setAttribute("aria-pressed", insightsPeriod === period ? "true" : "false");
    control.addEventListener("click", () => { insightsPeriod = period; renderInsights(); });
    toggles.append(control);
  }
  header.append(copy, toggles);

  const metrics = el("div", "mirror-journal-insight-metrics");
  metrics.append(
    insightMetric("Readings", insight.readings),
    insightMetric("Active days", insight.activeDays),
    insightMetric("Favorites", insight.favorites),
    insightMetric("Notes", insight.notes),
    insightMetric("Follow-ups", insight.pendingFollowUps),
  );

  const patterns = el("div", "mirror-journal-patterns");
  const cards = [
    ["Most visited realms", topRealms],
    ["Recurring realms", recurringRealms],
    ["Most used tags", topTags],
    ["Recurring tags", recurringTags],
    ["Busiest reading day", insight.busiestWeekday || "No pattern yet"],
  ];
  for (const [title, body] of cards) {
    const card = el("article", "mirror-journal-pattern-card");
    card.append(el("strong", "", title), el("p", "", body));
    patterns.append(card);
  }

  const note = el("p", "mirror-journal-insights-note", "These summaries are computed from dates, realms, favorites and your own tags in this browser. Oracle Mirror does not upload or infer patterns from your private reading text.");
  root.replaceChildren(header, metrics, patterns, note);
}

function restoreStatus(message, error = false) {
  const root = document.querySelector("[data-journal-restore-status]");
  if (!root) return;
  root.textContent = message;
  root.dataset.error = error ? "true" : "false";
}

function clearRestorePreview() {
  pendingRestore = null;
  const preview = document.querySelector("[data-journal-restore-preview]");
  if (preview) preview.replaceChildren();
  restoreStatus("");
}

function renderRestorePreview(validation) {
  const preview = document.querySelector("[data-journal-restore-preview]");
  if (!preview) return;
  const merged = mergeMirrorJournalBackup(readEntries(), validation.entries);
  pendingRestore = { validation, merged };

  const summary = merged.summary;
  const heading = el("strong", "", "Backup checked — nothing has been changed yet.");
  const copy = el("p", "", `${validation.entries.length} valid backup entr${validation.entries.length === 1 ? "y" : "ies"}. ${summary.added} new, ${summary.duplicates} duplicate${summary.duplicates === 1 ? "" : "s"}, ${summary.enriched} existing entr${summary.enriched === 1 ? "y" : "ies"} can gain metadata.${validation.rejected ? ` ${validation.rejected} malformed entr${validation.rejected === 1 ? "y was" : "ies were"} rejected.` : ""}${summary.truncated ? ` ${summary.truncated} imported entr${summary.truncated === 1 ? "y does" : "ies do"} not fit within the 100-reading limit and will be skipped.` : ""}`);
  const policy = el("p", "mirror-journal-restore-policy", "Merge policy: every reading already in this browser is preserved. Existing reading text and local notes win; imported favorites, tags and follow-up markers may enrich duplicates. Only open capacity is filled with the newest valid imported readings.");
  const actions = el("div", "mirror-journal-restore-actions");
  const confirm = button("Merge Backup Into Journal", "btn-gold btn-small");
  confirm.addEventListener("click", confirmRestore);
  const cancel = button("Cancel", "btn-ghost btn-small");
  cancel.addEventListener("click", clearRestorePreview);
  actions.append(confirm, cancel);
  preview.replaceChildren(heading, copy, policy, actions);
  restoreStatus("Backup validated locally. Review the merge summary before confirming.");
}

async function selectBackup(event) {
  const file = event.target?.files?.[0];
  event.target.value = "";
  if (!file) return;
  clearRestorePreview();
  if (file.size > MAX_BACKUP_BYTES) {
    restoreStatus("That backup is larger than 2 MB and was not opened.", true);
    return;
  }
  let text;
  try { text = await file.text(); } catch {
    restoreStatus("The selected backup could not be read.", true);
    return;
  }
  const validation = validateMirrorJournalBackup(text);
  if (!validation.ok) {
    const messages = {
      "invalid-json": "That file is not valid JSON.",
      "wrong-format": "That JSON file is not an Oracle Mirror journal backup.",
      "missing-entries": "The backup does not contain a journal entries array.",
      "backup-too-large": "The backup contains too many entries to restore safely.",
      "unsupported-version": "This backup was created by a newer journal format and cannot be restored safely here.",
      "no-valid-entries": "No valid saved readings were found in that backup.",
    };
    restoreStatus(messages[validation.error] || "The backup failed validation and was not imported.", true);
    return;
  }
  renderRestorePreview(validation);
}

function confirmRestore() {
  if (!pendingRestore) return;
  const { merged } = pendingRestore;
  if (!writeMirrorJournal(merged.entries, window.localStorage)) {
    restoreStatus("The browser blocked local storage, so the backup was not merged.", true);
    return;
  }
  const { added, duplicates, enriched, truncated } = merged.summary;
  clearRestorePreview();
  restoreStatus(`Backup merged locally: ${added} added, ${duplicates} duplicate${duplicates === 1 ? "" : "s"}, ${enriched} enriched${truncated ? `, ${truncated} skipped at the 100-reading limit` : ""}.`);
  notifyJournalReload();
}

function buildRecoveryPanel(shell) {
  if (shell.querySelector("[data-journal-recovery]")) return;
  const section = el("section", "mirror-journal-recovery");
  section.dataset.journalRecovery = "";
  section.setAttribute("aria-labelledby", "mirror-journal-recovery-title");
  const copy = el("div");
  copy.append(
    el("p", "mirror-journal-insights-kicker", "Backup recovery"),
    el("h3", "", "Restore without overwriting your current journal"),
    el("p", "", "Choose an Oracle Mirror journal JSON backup. It is read and validated entirely in this browser, then shown as a merge preview before you confirm."),
  );
  copy.querySelector("h3").id = "mirror-journal-recovery-title";
  const choose = button("Choose Backup File", "btn-ghost");
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json,application/json";
  input.hidden = true;
  input.dataset.journalRestoreFile = "";
  choose.addEventListener("click", () => input.click());
  input.addEventListener("change", selectBackup);
  const status = el("p", "mirror-journal-restore-status");
  status.dataset.journalRestoreStatus = "";
  status.setAttribute("aria-live", "polite");
  const preview = el("div", "mirror-journal-restore-preview");
  preview.dataset.journalRestorePreview = "";
  section.append(copy, choose, input, status, preview);

  const insights = el("section", "mirror-journal-insights");
  insights.dataset.journalInsights = "";
  insights.setAttribute("aria-label", "Private journal insights");

  const calendar = shell.querySelector("[data-journal-calendar]");
  if (calendar) {
    calendar.before(insights);
    insights.before(section);
  } else {
    shell.append(section, insights);
  }
  renderInsights();
}

function setFollowUp(id, next) {
  const entries = readEntries();
  const updated = markMirrorJournalFollowUp(entries, id, next, new Date());
  if (!writeMirrorJournal(updated, window.localStorage)) return;
  notifyJournalReload();
}

function patchEntryFollowUps() {
  const entries = readEntries();
  const byId = new Map(entries.map((entry) => [entry.journal.id, entry]));
  for (const card of document.querySelectorAll("[data-journal-entry]")) {
    const id = card.dataset.journalEntry;
    const entry = byId.get(id);
    if (!entry) continue;
    const actions = card.querySelector(".mirror-journal-entry-actions");
    if (!actions || actions.querySelector("[data-journal-follow-up]")) continue;
    const control = button(entry.journal.followUp ? "✓ Follow-up Pending" : "Mark for Follow-up", "btn-ghost btn-small mirror-journal-follow-up");
    control.dataset.journalFollowUp = "";
    control.setAttribute("aria-pressed", entry.journal.followUp ? "true" : "false");
    control.title = entry.journal.followUp ? "Mark this follow-up complete" : "Keep this reading in your follow-up queue";
    control.addEventListener("click", () => setFollowUp(id, !entry.journal.followUp));
    actions.insertBefore(control, actions.firstChild);
    if (entry.journal.followUp) {
      const row = card.querySelector(".mirror-journal-tags");
      if (row && !row.querySelector(".mirror-journal-follow-up-badge")) row.append(el("span", "mirror-journal-follow-up-badge", "Follow-up"));
    }
  }
}

function install() {
  const shell = document.querySelector(".mirror-journal-shell");
  const list = document.getElementById("archive-list");
  if (!shell || !list) return;
  buildRecoveryPanel(shell);
  patchEntryFollowUps();
  if (!observer) {
    observer = new MutationObserver(() => {
      patchEntryFollowUps();
      renderInsights();
    });
    observer.observe(list, { childList: true, subtree: false });
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === MIRROR_JOURNAL_ARCHIVE_KEY) setTimeout(() => { install(); renderInsights(); patchEntryFollowUps(); }, 0);
});
window.addEventListener("mirror-journal-refresh", () => setTimeout(() => { install(); renderInsights(); patchEntryFollowUps(); }, 0));
document.addEventListener("click", (event) => {
  if (event.target instanceof Element && event.target.closest('a[href="/archive"], [data-nav="archive"]')) setTimeout(install, 0);
}, { capture: true });

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => setTimeout(install, 0), { once: true });
else setTimeout(install, 0);

export {};
