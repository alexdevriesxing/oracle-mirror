import {
  MIRROR_JOURNAL_ARCHIVE_KEY,
  MIRROR_JOURNAL_MAX_NOTE_LENGTH,
  MIRROR_JOURNAL_MAX_TAGS,
  MIRROR_JOURNAL_MAX_TAG_LENGTH,
  deleteMirrorJournalEntry,
  filterMirrorJournal,
  mirrorJournalCalendar,
  mirrorJournalDateKey,
  mirrorJournalEntryDate,
  mirrorJournalExport,
  mirrorJournalFacets,
  mirrorJournalStats,
  readMirrorJournal,
  updateMirrorJournalEntry,
  writeMirrorJournal,
} from "./mirror-journal-core.js";

const STYLE_ID = "mirror-journal-styles";
const PAGE_ID = "page-archive";
const LIST_ID = "archive-list";
const CLEAR_ID = "btn-clear-archive";

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "/mirror-journal.css";
stylesheet.id = STYLE_ID;
if (!document.getElementById(STYLE_ID)) document.head.appendChild(stylesheet);

const state = {
  entries: [],
  query: "",
  realm: "all",
  tag: "all",
  favoritesOnly: false,
  sort: "newest",
  dateKey: "",
  calendarCursor: new Date(),
  storageError: "",
};

let page;
let list;
let shell;
let observer;
let initialized = false;

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

function formatDate(entry) {
  const date = mirrorJournalEntryDate(entry);
  if (!date) return "Date unavailable";
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function prettyRealm(value) {
  const known = {
    "crystal-ball": "Crystal Ball",
    "dream-interpreter": "Dream Interpreter",
    "western-zodiac": "Western Zodiac",
    "chinese-zodiac": "Chinese Zodiac",
    tarot: "Tarot",
    love: "Love Oracle",
    "love-match": "Love Match",
    magic8: "Magic 8 Ball",
    numerology: "Numerology",
    "daily-fortune": "Daily Fortune",
    birthchart: "Birth Chart",
    palmistry: "Palm Reading",
    iching: "I Ching",
  };
  return known[value] || String(value || "Saved Reading").replace(/[-_]+/g, " ");
}

function routeForEntry(entry) {
  const routes = {
    "crystal-ball": "/crystal-ball",
    "dream-interpreter": "/dream-interpreter",
    "western-zodiac": "/western-zodiac",
    "chinese-zodiac": "/chinese-zodiac",
    tarot: "/tarot",
    love: "/love-oracle",
    "love-match": "/love-match",
    magic8: "/magic-8-ball",
    numerology: "/numerology",
    "daily-fortune": "/daily-fortune",
    birthchart: "/birth-chart",
    palmistry: "/palm-reading",
    iching: "/iching-oracle",
    "Council of Mystics": "/#council-of-mystics",
  };
  return routes[entry.realm] || "/";
}

function saveEntries(entries) {
  if (!writeMirrorJournal(entries, window.localStorage)) {
    state.storageError = "Your browser blocked local storage, so this journal change could not be saved.";
    renderStatus();
    return false;
  }
  state.entries = entries;
  state.storageError = "";
  return true;
}

function loadEntries() {
  const result = readMirrorJournal(window.localStorage);
  state.entries = result.entries;
  state.storageError = result.error ? "Your browser archive could not be read. Journal tools are unavailable until local storage is accessible." : "";
  populateFilters();
  render();
}

function controlGroup(labelText, control) {
  const label = el("label", "mirror-journal-control");
  label.append(el("span", "mirror-journal-control-label", labelText), control);
  return label;
}

function buildShell() {
  if (!page || !list || shell) return;
  shell = el("section", "mirror-journal-shell");
  shell.setAttribute("aria-labelledby", "mirror-journal-title");

  const intro = el("div", "mirror-journal-intro");
  const introCopy = el("div");
  const kicker = el("p", "mirror-journal-kicker", "Private · local-first · stays in this browser");
  const title = el("h2", "", "Mirror Journal 2.0");
  title.id = "mirror-journal-title";
  const copy = el("p", "", "Search past readings, mark favorites, add private notes and tags, and revisit your history by calendar day. Journal content is never sent to Oracle Mirror analytics.");
  introCopy.append(kicker, title, copy);
  const backup = button("Download Private Backup", "btn-ghost mirror-journal-backup");
  backup.dataset.journalExport = "";
  intro.append(introCopy, backup);

  const stats = el("div", "mirror-journal-stats");
  stats.dataset.journalStats = "";
  stats.setAttribute("aria-label", "Journal summary");

  const tools = el("div", "mirror-journal-tools");
  const search = document.createElement("input");
  search.type = "search";
  search.placeholder = "Search readings, answers, notes or tags";
  search.autocomplete = "off";
  search.dataset.journalSearch = "";
  search.setAttribute("aria-label", "Search private journal");

  const realm = document.createElement("select");
  realm.dataset.journalRealm = "";
  realm.setAttribute("aria-label", "Filter by realm");

  const tag = document.createElement("select");
  tag.dataset.journalTag = "";
  tag.setAttribute("aria-label", "Filter by tag");

  const sort = document.createElement("select");
  sort.dataset.journalSort = "";
  sort.innerHTML = '<option value="newest">Newest first</option><option value="oldest">Oldest first</option>';

  const favoriteWrap = el("label", "mirror-journal-favorite-filter");
  const favorite = document.createElement("input");
  favorite.type = "checkbox";
  favorite.dataset.journalFavorites = "";
  favoriteWrap.append(favorite, el("span", "", "Favorites only"));

  const reset = button("Reset Filters", "btn-ghost mirror-journal-reset");
  reset.dataset.journalReset = "";

  tools.append(
    controlGroup("Search", search),
    controlGroup("Realm", realm),
    controlGroup("Tag", tag),
    controlGroup("Sort", sort),
    favoriteWrap,
    reset,
  );

  const status = el("p", "mirror-journal-status");
  status.dataset.journalStatus = "";
  status.setAttribute("aria-live", "polite");

  const calendar = el("section", "mirror-journal-calendar");
  calendar.dataset.journalCalendar = "";
  calendar.setAttribute("aria-labelledby", "mirror-journal-calendar-title");

  shell.append(intro, stats, tools, status, calendar);
  list.before(shell);

  search.addEventListener("input", () => { state.query = search.value; renderEntries(); renderStatus(); });
  realm.addEventListener("change", () => { state.realm = realm.value; renderEntries(); renderStatus(); });
  tag.addEventListener("change", () => { state.tag = tag.value; renderEntries(); renderStatus(); });
  sort.addEventListener("change", () => { state.sort = sort.value; renderEntries(); renderStatus(); });
  favorite.addEventListener("change", () => { state.favoritesOnly = favorite.checked; renderEntries(); renderStatus(); });
  reset.addEventListener("click", resetFilters);
  backup.addEventListener("click", downloadBackup);
}

function updateHeader() {
  if (!page) return;
  const heading = page.querySelector(".realm-header h1, .realm-header h2");
  const paragraph = page.querySelector(".realm-header p");
  if (heading) heading.textContent = "Your Private Mirror Journal";
  if (paragraph) paragraph.textContent = "A local history of the readings you chose to keep — searchable, taggable, and private to this browser.";
  const clear = document.getElementById(CLEAR_ID);
  if (clear) clear.textContent = "Clear Journal";
}

function populateFilters() {
  if (!shell) return;
  const realmSelect = shell.querySelector("[data-journal-realm]");
  const tagSelect = shell.querySelector("[data-journal-tag]");
  if (!realmSelect || !tagSelect) return;
  const facets = mirrorJournalFacets(state.entries);

  const realmValue = state.realm;
  realmSelect.replaceChildren();
  const realmAll = document.createElement("option");
  realmAll.value = "all";
  realmAll.textContent = "All realms";
  realmSelect.append(realmAll);
  for (const [realm, count] of facets.realms) {
    const option = document.createElement("option");
    option.value = realm;
    option.textContent = `${prettyRealm(realm)} (${count})`;
    realmSelect.append(option);
  }
  if ([...realmSelect.options].some((option) => option.value === realmValue)) realmSelect.value = realmValue;
  else state.realm = "all";

  const tagValue = state.tag;
  tagSelect.replaceChildren();
  const tagAll = document.createElement("option");
  tagAll.value = "all";
  tagAll.textContent = "All tags";
  tagSelect.append(tagAll);
  for (const [tag, count] of facets.tags) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = `#${tag} (${count})`;
    tagSelect.append(option);
  }
  if ([...tagSelect.options].some((option) => option.value === tagValue)) tagSelect.value = tagValue;
  else state.tag = "all";
}

function statTile(label, value) {
  const tile = el("div", "mirror-journal-stat");
  tile.append(el("strong", "", String(value)), el("span", "", label));
  return tile;
}

function renderStats() {
  const root = shell?.querySelector("[data-journal-stats]");
  if (!root) return;
  const stats = mirrorJournalStats(state.entries);
  root.replaceChildren(
    statTile("Saved", stats.total),
    statTile("Favorites", stats.favorites),
    statTile("With notes", stats.notes),
    statTile("Tagged", stats.tagged),
    statTile("Realms", stats.realms),
  );
}

function activeEntries() {
  return filterMirrorJournal(state.entries, {
    query: state.query,
    realm: state.realm,
    tag: state.tag === "all" ? "" : state.tag,
    favoritesOnly: state.favoritesOnly,
    sort: state.sort,
    dateKey: state.dateKey,
  });
}

function renderStatus() {
  const root = shell?.querySelector("[data-journal-status]");
  if (!root) return;
  if (state.storageError) {
    root.textContent = state.storageError;
    root.dataset.error = "true";
    return;
  }
  delete root.dataset.error;
  const count = activeEntries().length;
  const total = state.entries.length;
  const bits = [];
  if (state.query.trim()) bits.push("search");
  if (state.realm !== "all") bits.push(prettyRealm(state.realm));
  if (state.tag !== "all") bits.push(`#${state.tag}`);
  if (state.favoritesOnly) bits.push("favorites");
  if (state.dateKey) bits.push(state.dateKey);
  root.textContent = bits.length
    ? `${count} of ${total} saved reading${total === 1 ? "" : "s"} shown · ${bits.join(" · ")}`
    : `${total} saved reading${total === 1 ? "" : "s"} in this browser.`;
}

function createTagChip(tag) {
  return el("span", "mirror-journal-tag", `#${tag}`);
}

function createEntryCard(entry) {
  const card = el("article", "mirror-journal-entry");
  card.dataset.journalEntry = entry.journal.id;
  if (entry.journal.favorite) card.dataset.favorite = "true";

  const header = el("header", "mirror-journal-entry-header");
  const identity = el("div", "mirror-journal-entry-identity");
  identity.append(el("span", "mirror-journal-realm", prettyRealm(entry.realm)));
  const time = el("time", "mirror-journal-date", formatDate(entry));
  const date = mirrorJournalEntryDate(entry);
  if (date) time.dateTime = date.toISOString();
  identity.append(time);

  const favorite = button(entry.journal.favorite ? "★ Favorite" : "☆ Favorite", "mirror-journal-favorite");
  favorite.setAttribute("aria-pressed", entry.journal.favorite ? "true" : "false");
  favorite.setAttribute("aria-label", entry.journal.favorite ? "Remove from favorites" : "Add to favorites");
  favorite.addEventListener("click", () => toggleFavorite(entry.journal.id));
  header.append(identity, favorite);

  const content = el("div", "mirror-journal-content");
  if (entry.question) {
    const question = el("div", "mirror-journal-question");
    question.append(el("span", "", "You asked"), el("p", "", String(entry.question)));
    content.append(question);
  }
  if (entry.answer) {
    const answer = el("div", "mirror-journal-answer");
    answer.append(el("span", "", "The mirror answered"), el("p", "", String(entry.answer)));
    content.append(answer);
  }

  const tagRow = el("div", "mirror-journal-tags");
  for (const tag of entry.journal.tags) tagRow.append(createTagChip(tag));
  if (entry.journal.note) tagRow.append(el("span", "mirror-journal-note-badge", "Private note"));

  const details = document.createElement("details");
  details.className = "mirror-journal-editor";
  const summary = document.createElement("summary");
  summary.textContent = entry.journal.note || entry.journal.tags.length ? "Edit note & tags" : "Add note & tags";
  details.append(summary);

  const editor = el("div", "mirror-journal-editor-body");
  const noteLabel = el("label", "mirror-journal-editor-field");
  noteLabel.append(el("span", "", `Private note · max ${MIRROR_JOURNAL_MAX_NOTE_LENGTH} characters`));
  const note = document.createElement("textarea");
  note.rows = 4;
  note.maxLength = MIRROR_JOURNAL_MAX_NOTE_LENGTH;
  note.value = entry.journal.note;
  note.placeholder = "What stood out? What changed later? What do you want to remember?";
  noteLabel.append(note);

  const tagsLabel = el("label", "mirror-journal-editor-field");
  tagsLabel.append(el("span", "", `Tags · up to ${MIRROR_JOURNAL_MAX_TAGS}, ${MIRROR_JOURNAL_MAX_TAG_LENGTH} characters each`));
  const tags = document.createElement("input");
  tags.type = "text";
  tags.value = entry.journal.tags.join(", ");
  tags.placeholder = "career, recurring, follow-up";
  tags.autocomplete = "off";
  tagsLabel.append(tags);

  const actions = el("div", "mirror-journal-entry-actions");
  const save = button("Save Journal Details", "btn-gold btn-small");
  save.addEventListener("click", () => saveDetails(entry.journal.id, note.value, tags.value, details));
  const revisit = document.createElement("a");
  revisit.href = routeForEntry(entry);
  revisit.className = "btn-ghost btn-small";
  revisit.textContent = "Visit Realm";
  const remove = button("Delete Reading", "btn-ghost btn-small mirror-journal-delete");
  remove.addEventListener("click", () => deleteEntry(entry.journal.id));
  actions.append(save, revisit, remove);

  editor.append(noteLabel, tagsLabel, actions);
  details.append(editor);
  card.append(header, content, tagRow, details);
  return card;
}

function renderEntries() {
  if (!list) return;
  const entries = activeEntries();
  const fragment = document.createDocumentFragment();
  if (!entries.length) {
    const empty = el("div", "mirror-journal-empty");
    if (!state.entries.length) {
      empty.append(el("strong", "", "Your journal is empty."), el("p", "", "Save a reading from any Oracle Mirror realm and it will appear here automatically."));
    } else {
      empty.append(el("strong", "", "No saved readings match these filters."), el("p", "", "Try a broader search, clear the selected date, or reset the filters."));
    }
    fragment.append(empty);
  } else {
    for (const entry of entries) fragment.append(createEntryCard(entry));
  }
  list.replaceChildren(fragment);
}

function renderCalendar() {
  const root = shell?.querySelector("[data-journal-calendar]");
  if (!root) return;
  const cursor = state.calendarCursor;
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" }).format(cursor);
  const days = new Map(mirrorJournalCalendar(state.entries, year, month).map((item) => [item.day, item]));
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  root.replaceChildren();
  const header = el("div", "mirror-journal-calendar-header");
  const previous = button("←", "mirror-journal-calendar-nav");
  previous.setAttribute("aria-label", "Previous month");
  previous.addEventListener("click", () => moveCalendar(-1));
  const title = el("h3", "", monthLabel);
  title.id = "mirror-journal-calendar-title";
  const next = button("→", "mirror-journal-calendar-nav");
  next.setAttribute("aria-label", "Next month");
  next.addEventListener("click", () => moveCalendar(1));
  header.append(previous, title, next);

  const hint = el("p", "mirror-journal-calendar-hint", "Choose a highlighted day to filter the journal. Stars mark days containing favorites.");
  const weekdays = el("div", "mirror-journal-weekdays");
  for (const day of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) weekdays.append(el("span", "", day));

  const grid = el("div", "mirror-journal-calendar-grid");
  for (let blank = 0; blank < firstWeekday; blank += 1) {
    const spacer = el("span", "mirror-journal-calendar-blank");
    spacer.setAttribute("aria-hidden", "true");
    grid.append(spacer);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const data = days.get(day);
    const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayButton = button(String(day), "mirror-journal-calendar-day");
    dayButton.dataset.hasEntries = data ? "true" : "false";
    if (state.dateKey === dateKey) dayButton.dataset.selected = "true";
    if (!data) {
      dayButton.disabled = true;
      dayButton.setAttribute("aria-label", `${monthLabel} ${day}: no saved readings`);
    } else {
      dayButton.append(el("small", "", `${data.count}${data.favorites ? " ★" : ""}`));
      dayButton.setAttribute("aria-label", `${monthLabel} ${day}: ${data.count} saved reading${data.count === 1 ? "" : "s"}${data.favorites ? `, ${data.favorites} favorite${data.favorites === 1 ? "" : "s"}` : ""}`);
      dayButton.addEventListener("click", () => {
        state.dateKey = state.dateKey === dateKey ? "" : dateKey;
        renderCalendar();
        renderEntries();
        renderStatus();
      });
    }
    grid.append(dayButton);
  }

  const clearDate = button(state.dateKey ? `Clear date filter · ${state.dateKey}` : "No date selected", "btn-ghost btn-small mirror-journal-clear-date");
  clearDate.disabled = !state.dateKey;
  clearDate.addEventListener("click", () => {
    state.dateKey = "";
    renderCalendar();
    renderEntries();
    renderStatus();
  });
  root.append(header, hint, weekdays, grid, clearDate);
}

function render() {
  if (!shell || !list) return;
  renderStats();
  renderStatus();
  renderCalendar();
  renderEntries();
}

function toggleFavorite(id) {
  const entry = state.entries.find((item) => item.journal.id === id);
  if (!entry) return;
  const next = updateMirrorJournalEntry(state.entries, id, { favorite: !entry.journal.favorite });
  if (!saveEntries(next)) return;
  populateFilters();
  render();
}

function saveDetails(id, note, tags, details) {
  const next = updateMirrorJournalEntry(state.entries, id, { note, tags });
  if (!saveEntries(next)) return;
  populateFilters();
  render();
  const updated = list?.querySelector(`[data-journal-entry="${CSS.escape(id)}"] .mirror-journal-editor`);
  if (updated instanceof HTMLDetailsElement) updated.open = false;
  if (details instanceof HTMLDetailsElement) details.open = false;
}

function deleteEntry(id) {
  if (!window.confirm("Delete this saved reading from your private browser journal? This cannot be undone.")) return;
  const next = deleteMirrorJournalEntry(state.entries, id);
  if (!saveEntries(next)) return;
  populateFilters();
  render();
}

function resetFilters() {
  state.query = "";
  state.realm = "all";
  state.tag = "all";
  state.favoritesOnly = false;
  state.sort = "newest";
  state.dateKey = "";
  const search = shell?.querySelector("[data-journal-search]");
  const realm = shell?.querySelector("[data-journal-realm]");
  const tag = shell?.querySelector("[data-journal-tag]");
  const favorites = shell?.querySelector("[data-journal-favorites]");
  const sort = shell?.querySelector("[data-journal-sort]");
  if (search) search.value = "";
  if (realm) realm.value = "all";
  if (tag) tag.value = "all";
  if (favorites) favorites.checked = false;
  if (sort) sort.value = "newest";
  render();
}

function moveCalendar(offset) {
  const current = state.calendarCursor;
  state.calendarCursor = new Date(current.getFullYear(), current.getMonth() + offset, 1, 12);
  renderCalendar();
}

function downloadBackup() {
  const payload = mirrorJournalExport(state.entries);
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const today = new Date();
  const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  anchor.href = url;
  anchor.download = `oracle-mirror-journal-${date}.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function clearJournal(event) {
  if (!page || !event.currentTarget) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  if (!state.entries.length) return;
  if (!window.confirm("Clear every saved reading, favorite, tag, and private journal note from this browser? This cannot be undone.")) return;
  try {
    window.localStorage.removeItem(MIRROR_JOURNAL_ARCHIVE_KEY);
    state.entries = [];
    state.dateKey = "";
    state.storageError = "";
    populateFilters();
    render();
  } catch {
    state.storageError = "Your browser blocked local storage, so the journal could not be cleared.";
    renderStatus();
  }
}

function watchLegacyRenderer() {
  if (!list || observer) return;
  observer = new MutationObserver(() => {
    const legacyMarkup = list.querySelector(".archive-entry, .archive-empty");
    const journalMarkup = list.querySelector(".mirror-journal-entry, .mirror-journal-empty");
    if (legacyMarkup && !journalMarkup) queueMicrotask(() => { loadEntries(); });
  });
  observer.observe(list, { childList: true, subtree: false });
}

function install() {
  if (initialized) return;
  page = document.getElementById(PAGE_ID);
  list = document.getElementById(LIST_ID);
  if (!page || !list) return;
  initialized = true;
  page.dataset.mirrorJournal = "2";
  updateHeader();
  buildShell();
  const clear = document.getElementById(CLEAR_ID);
  clear?.addEventListener("click", clearJournal, { capture: true });
  watchLegacyRenderer();
  loadEntries();
}

function refreshWhenArchiveOpens(event) {
  const target = event.target instanceof Element ? event.target.closest('a[href="/archive"], [data-nav="archive"]') : null;
  if (!target) return;
  setTimeout(() => { if (initialized) loadEntries(); else install(); }, 0);
}

document.addEventListener("click", refreshWhenArchiveOpens, { capture: true });
window.addEventListener("popstate", () => { if (window.location.pathname === "/archive") setTimeout(loadEntries, 0); });
window.addEventListener("storage", (event) => { if (event.key === MIRROR_JOURNAL_ARCHIVE_KEY) loadEntries(); });

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
else install();

export {};
