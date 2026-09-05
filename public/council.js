import {
  COUNCIL_ENDPOINT,
  councilSharePayload,
  isCouncilResult,
  normalizeCouncilQuestion,
  saveCouncilToArchive,
} from "./council-core.js";
import { openShareCard } from "./social-share.js";

const ROOT_ID = "council-of-mystics";
const STYLESHEET_ID = "council-of-mystics-styles";
let latestResult = null;
let latestQuestion = "";

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    source: "council_v1",
    page_path: window.location.pathname,
    realm: "council",
    ...details,
  });
}

function ensureStylesheet() {
  if (document.getElementById(STYLESHEET_ID)) return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = "/council.css";
  document.head.appendChild(link);
}

function createShell() {
  if (document.getElementById(ROOT_ID) || !document.getElementById("page-home")) return null;
  ensureStylesheet();

  const section = document.createElement("section");
  section.id = ROOT_ID;
  section.className = "council-of-mystics";
  section.setAttribute("aria-labelledby", "council-title");
  section.innerHTML = `
    <p class="council-kicker">Signature Oracle · One question, three perspectives</p>
    <h2 id="council-title">Council of Mystics</h2>
    <p class="council-intro">Ask one question. Three mystics examine it through different lenses, then the Mirror distills their disagreement into one practical verdict. One Council reading uses one AI request.</p>
    <form class="council-form" data-council-form>
      <label class="sr-only" for="council-question">Question for the Council of Mystics</label>
      <textarea id="council-question" name="question" minlength="8" maxlength="500" required placeholder="What question would benefit from more than one perspective?"></textarea>
      <div class="council-form-meta">
        <span>For reflection and entertainment. Avoid sensitive personal information.</span>
        <span data-council-count>0 / 500</span>
      </div>
      <button type="submit" class="council-submit">Convene the Council</button>
    </form>
    <p class="council-status" role="status" aria-live="polite" data-council-status></p>
    <div class="council-results" data-council-results hidden>
      <div class="council-seats" data-council-seats></div>
      <article class="council-verdict" aria-labelledby="council-verdict-title">
        <p class="council-kicker">Mirror Verdict</p>
        <h3 id="council-verdict-title" data-council-verdict-title></h3>
        <p data-council-verdict-summary></p>
        <p class="council-next-step"><strong>Next step:</strong> <span data-council-next-step></span></p>
      </article>
      <div class="council-actions">
        <button type="button" data-council-save>Save to Private Archive</button>
        <button type="button" data-council-share>Share Council Card</button>
        <button type="button" data-council-reset>Ask Another Question</button>
      </div>
      <p class="council-disclaimer">The Council offers fictional symbolic perspectives, not factual prediction or professional advice. Saving is local to this browser. The share card excludes your question and the Council's answer text.</p>
    </div>`;

  const instant = document.getElementById("instant-mysteries");
  const modules = document.getElementById("modules");
  if (instant?.parentNode) instant.insertAdjacentElement("afterend", section);
  else if (modules?.parentNode) modules.parentNode.insertBefore(section, modules);
  else document.getElementById("page-home")?.appendChild(section);

  track("council_view", { result_kind: "council_v1", state: "ready" });
  return section;
}

function renderResult(root, result) {
  const seats = root.querySelector("[data-council-seats]");
  const results = root.querySelector("[data-council-results]");
  if (!seats || !results || !isCouncilResult(result)) return;

  seats.replaceChildren();
  for (const voice of result.voices) {
    const article = document.createElement("article");
    article.className = "council-seat";

    const glyph = document.createElement("div");
    glyph.className = "council-seat-glyph";
    glyph.setAttribute("aria-hidden", "true");
    glyph.textContent = voice.glyph || "✦";

    const heading = document.createElement("h3");
    heading.textContent = voice.name;

    const title = document.createElement("p");
    title.className = "council-seat-title";
    title.textContent = voice.title || "Council Mystic";

    const response = document.createElement("p");
    response.className = "council-seat-response";
    response.textContent = voice.response;

    article.append(glyph, heading, title, response);
    seats.appendChild(article);
  }

  root.querySelector("[data-council-verdict-title]").textContent = result.verdict.title;
  root.querySelector("[data-council-verdict-summary]").textContent = result.verdict.summary;
  root.querySelector("[data-council-next-step]").textContent = result.verdict.next_step;
  results.hidden = false;
  results.scrollIntoView({ behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth", block: "start" });
}

async function submitCouncil(root, form) {
  const textarea = root.querySelector("#council-question");
  const status = root.querySelector("[data-council-status]");
  const submit = root.querySelector(".council-submit");
  const question = normalizeCouncilQuestion(textarea?.value || "");

  if (question.length < 8) {
    if (status) status.textContent = "Give the council a little more to work with.";
    textarea?.focus();
    return;
  }

  submit.disabled = true;
  if (status) status.textContent = "The council is gathering around the mirror…";
  root.querySelector("[data-council-results]").hidden = true;
  track("council_start", { result_kind: "council_v1", state: "submitted" });

  try {
    const response = await fetch(COUNCIL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ question }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !isCouncilResult(payload)) {
      throw new Error(payload?.error || "The council could not answer just now.");
    }

    latestResult = payload;
    latestQuestion = question;
    renderResult(root, payload);
    if (status) status.textContent = payload.source === "fallback"
      ? "The mirror answered from its reserve wisdom while the AI oracle was unavailable."
      : "Three voices have spoken. The Mirror Verdict is ready.";
    track("council_complete", {
      result_kind: "council_v1",
      state: payload.source === "fallback" ? "fallback" : "ai",
    });
  } catch (error) {
    if (status) status.textContent = error?.message || "The council could not answer just now. Please try again.";
    track("council_error", { result_kind: "council_v1", state: "request_failed" });
  } finally {
    submit.disabled = false;
  }
}

function bind(root) {
  const form = root.querySelector("[data-council-form]");
  const textarea = root.querySelector("#council-question");
  const count = root.querySelector("[data-council-count]");
  const status = root.querySelector("[data-council-status]");

  textarea?.addEventListener("input", () => {
    if (count) count.textContent = `${textarea.value.length} / 500`;
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    submitCouncil(root, form);
  });

  root.querySelector("[data-council-save]")?.addEventListener("click", () => {
    if (!latestResult) return;
    const saved = saveCouncilToArchive(latestResult, latestQuestion);
    if (status) status.textContent = saved
      ? "Council reading saved to your private browser Archive."
      : "This browser could not save the reading.";
    if (saved) track("council_save", { result_kind: "council_v1", state: "local_archive" });
  });

  root.querySelector("[data-council-share]")?.addEventListener("click", async () => {
    const payload = councilSharePayload(latestResult);
    if (!payload) return;
    await openShareCard(payload, "council");
    track("council_share", { result_kind: "council_v1", state: "privacy_safe_card" });
  });

  root.querySelector("[data-council-reset]")?.addEventListener("click", () => {
    latestResult = null;
    latestQuestion = "";
    root.querySelector("[data-council-results]").hidden = true;
    if (status) status.textContent = "";
    if (textarea) {
      textarea.value = "";
      textarea.focus();
    }
    if (count) count.textContent = "0 / 500";
  });
}

if (window.location.pathname === "/" || window.location.pathname === "") {
  const root = createShell();
  if (root) bind(root);
}

export {};
