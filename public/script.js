import {
  activateAdSlot,
  activateSlotsForScreen,
  createArchiveFeedAdSlot,
  createResultAdSlot,
  initAdSystem,
  registerAdSlots,
  scheduleAmbientPopunder,
  trackEvent,
} from "./ads.js";

// Oracle Mirror - Client-side application

// --- Particles ---
const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  const PARTICLE_COUNT = 60;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3 - 0.1,
      opacity: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,
    };
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, createParticle);
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += 0.02;
      const alpha = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212, 175, 55, ${alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  initParticles();
  drawParticles();
  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });
}

// --- Navigation, routes, and virtual screens ---
const pages = document.querySelectorAll(".page");
const navLinksContainer = document.getElementById("nav-links");
const hamburger = document.getElementById("nav-hamburger");

const ROUTE_BY_PAGE = {
  home: "/",
  "crystal-ball": "/crystal-ball",
  "western-zodiac": "/western-zodiac",
  "chinese-zodiac": "/chinese-zodiac",
  tarot: "/tarot",
  love: "/love-oracle",
  magic8: "/magic-8-ball",
  numerology: "/numerology",
  "daily-fortune": "/daily-fortune",
  personas: "/mystics",
  archive: "/archive",
  "privacy-policy": "/privacy-policy",
  "cookie-policy": "/cookie-policy",
  contact: "/contact",
};

const RESULT_ROUTE_BY_REALM = {
  "crystal-ball": "/result/crystal-ball",
  "western-zodiac": "/result/western-zodiac",
  "chinese-zodiac": "/result/chinese-zodiac",
  tarot: "/result/tarot",
  love: "/result/love-oracle",
  magic8: "/result/magic-8-ball",
  numerology: "/result/numerology",
  "daily-fortune": "/result/daily-fortune",
};

const PAGE_BY_ROUTE = new Map(Object.entries(ROUTE_BY_PAGE).map(([page, path]) => [path, page]));
const PAGE_BY_RESULT_ROUTE = new Map(Object.entries(RESULT_ROUTE_BY_REALM).map(([page, path]) => [path, page]));
const REALM_PAGES = new Set([
  "crystal-ball",
  "western-zodiac",
  "chinese-zodiac",
  "tarot",
  "love",
  "magic8",
  "numerology",
  "daily-fortune",
]);

const SCREEN_META = {
  home: {
    title: "Oracle Mirror | Tarot, Horoscopes, Numerology & Fortune Readings",
    description: "Explore interactive tarot readings, zodiac horoscopes, numerology, daily fortunes, and crystal ball guidance inside Oracle Mirror.",
  },
  "crystal-ball": {
    title: "Crystal Ball Reading | Oracle Mirror",
    description: "Ask Madame Fortuna's crystal ball for a mystical fortune reading and save the answer to your Oracle Mirror archive.",
  },
  "western-zodiac": {
    title: "Western Zodiac Horoscope | Oracle Mirror",
    description: "Choose your zodiac sign for a celestial horoscope reading from the Oracle Mirror observatory.",
  },
  "chinese-zodiac": {
    title: "Chinese Zodiac Reading | Oracle Mirror",
    description: "Enter your birth year for a Chinese zodiac fortune from the Jade Pavilion of Oracle Mirror.",
  },
  tarot: {
    title: "Tarot Reading | Oracle Mirror",
    description: "Draw a Past, Present, and Future tarot spread inside Oracle Mirror's arcane library.",
  },
  love: {
    title: "Love Oracle Reading | Oracle Mirror",
    description: "Ask the Love Oracle for romantic guidance, compatibility insight, and heart-centered reflection.",
  },
  magic8: {
    title: "Magic 8 Ball Oracle | Oracle Mirror",
    description: "Shake the Cosmic 8 Ball for a quick mystical answer to your yes-or-no question.",
  },
  numerology: {
    title: "Numerology Life Path Reading | Oracle Mirror",
    description: "Calculate your life path number and receive a numerology reading from Oracle Mirror.",
  },
  "daily-fortune": {
    title: "Daily Fortune | Oracle Mirror",
    description: "Reveal today's fortune with the Dawn Oracle and receive a daily mystical affirmation.",
  },
  personas: {
    title: "Oracle Mirror Mystics | Fortune-Telling Personas",
    description: "Meet the mystics behind Oracle Mirror's crystal ball, tarot, zodiac, love, numerology, and daily fortune realms.",
  },
  archive: {
    title: "Reading Archive | Oracle Mirror",
    description: "Review saved Oracle Mirror readings in your private browser archive.",
  },
  "privacy-policy": {
    title: "Privacy Policy | Oracle Mirror",
    description: "Read how Oracle Mirror handles local reading history, analytics events, advertising consent, and API requests.",
  },
  "cookie-policy": {
    title: "Cookie Policy | Oracle Mirror",
    description: "Manage Oracle Mirror cookie and advertising script preferences.",
  },
  contact: {
    title: "Contact | Oracle Mirror",
    description: "Contact Oracle Mirror about the site, privacy, cookies, or advertising.",
  },
};

function canonicalUrl(path) {
  return `https://oraclemirror.com${path === "/" ? "/" : path}`;
}

function getRouteState(pathname = window.location.pathname) {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : "/";
  if (PAGE_BY_RESULT_ROUTE.has(normalized)) {
    return { pageId: PAGE_BY_RESULT_ROUTE.get(normalized), isResult: true, path: normalized };
  }
  return {
    pageId: PAGE_BY_ROUTE.get(normalized) || "home",
    isResult: false,
    path: PAGE_BY_ROUTE.has(normalized) ? normalized : "/",
  };
}

function updateDocumentMeta(pageId, isResult = false) {
  const routePath = isResult ? RESULT_ROUTE_BY_REALM[pageId] : ROUTE_BY_PAGE[pageId] || "/";
  const baseMeta = SCREEN_META[pageId] || SCREEN_META.home;
  const title = isResult ? `Your ${baseMeta.title.replace(" | Oracle Mirror", "")} Result | Oracle Mirror` : baseMeta.title;
  const description = isResult
    ? `Read your completed Oracle Mirror result for this ${baseMeta.title.split("|")[0].trim().toLowerCase()} session.`
    : baseMeta.description;
  const url = canonicalUrl(routePath);

  document.title = title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", description);
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", description);
}

function trackVirtualPage(pageId, isResult = false) {
  const path = isResult ? RESULT_ROUTE_BY_REALM[pageId] : ROUTE_BY_PAGE[pageId] || "/";
  trackEvent("virtual_page_view", {
    page_path: path,
    page_title: document.title,
    screen: isResult ? `result/${pageId}` : pageId,
    realm: pageId,
  });
}

function adScreenForPage(pageId, isResult = false) {
  if (isResult) return "result";
  if (pageId === "home") return "home";
  if (pageId === "archive") return "archive";
  if (REALM_PAGES.has(pageId)) return "realm";
  return "home";
}

function showPage(pageId, options = {}) {
  const { push = true, isResult = false, scroll = true, emitTracking = true } = options;
  for (const p of pages) {
    p.classList.remove("active");
  }

  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.add("active");
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const routePath = isResult ? RESULT_ROUTE_BY_REALM[pageId] : ROUTE_BY_PAGE[pageId] || "/";
  if (push && routePath && window.location.pathname !== routePath) {
    history.pushState({ pageId, isResult }, "", routePath);
  }

  updateDocumentMeta(pageId, isResult);

  for (const link of document.querySelectorAll(".nav-link[data-nav]")) {
    link.classList.toggle("active", link.dataset.nav === pageId || (pageId === "love" && link.dataset.nav === "love"));
  }

  navLinksContainer?.classList.remove("open");
  registerAdSlots(target || document);
  activateSlotsForScreen(adScreenForPage(pageId, isResult), pageId);

  if (emitTracking) {
    trackVirtualPage(pageId, isResult);
    if (REALM_PAGES.has(pageId) && !isResult) {
      trackEvent("realm_open", { realm: pageId, page_path: routePath });
    }
    if (pageId === "archive") {
      trackEvent("archive_open", { page_path: routePath });
      setTimeout(renderArchive, 50);
    }
  }
}

function goHome(event) {
  event?.preventDefault();
  showPage("home");
}

for (const link of document.querySelectorAll("[data-nav]")) {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.nav;
    if (target) showPage(target);
  });
}

for (const card of document.querySelectorAll(".card[data-realm]")) {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const realm = card.dataset.realm;
    if (realm) showPage(realm);
  });
}

for (const btn of document.querySelectorAll("[data-back]")) {
  btn.addEventListener("click", goHome);
}

hamburger?.addEventListener("click", () => {
  navLinksContainer?.classList.toggle("open");
});

window.addEventListener("popstate", () => {
  const route = getRouteState();
  showPage(route.pageId, { push: false, isResult: route.isResult, scroll: false });
});

// Close mobile menu on outside click
document.addEventListener("click", (e) => {
  if (
    navLinksContainer?.classList.contains("open") &&
    !navLinksContainer.contains(e.target) &&
    e.target !== hamburger &&
    !hamburger?.contains(e.target)
  ) {
    navLinksContainer.classList.remove("open");
  }
});

// --- Helpers ---
const LOADING_MESSAGES = {
  "crystal-ball": "The mists swirl within the crystal ball...",
  "western-zodiac": "Consulting the celestial charts...",
  "chinese-zodiac": "Aligning the celestial animals...",
  tarot: "The cards are being drawn...",
  love: "Rosalind reads the hearts...",
  magic8: "Shaking the cosmic 8-ball...",
  numerology: "Calculating sacred vibrations...",
  "daily-fortune": "The Dawn Oracle inscribes your fortune...",
  default: "Consulting the spirits...",
};

function getLoadingMessage(realm) {
  return LOADING_MESSAGES[realm] || LOADING_MESSAGES.default;
}

function setOutput(realm, text, isLoading = false) {
  const el = document.querySelector(`[data-output="${realm}"]`);
  if (!el) return;
  el.textContent = text;
  el.style.display = "block";
  if (isLoading) {
    el.classList.add("loading");
    clearResultAftercare(realm);
  } else {
    el.classList.remove("loading");
  }
}

function setOutputHTML(realm, html) {
  const el = document.querySelector(`[data-output="${realm}"]`);
  if (!el) return;
  el.innerHTML = html;
  el.style.display = "block";
  el.classList.remove("loading");
}

async function callAPI(endpoint, body) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

function extractResponse(data) {
  return (data.response ?? data.message ?? JSON.stringify(data)).trim();
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function setReadingState(isAnimating) {
  if (isAnimating) {
    document.body.dataset.readingState = "animating";
  } else {
    delete document.body.dataset.readingState;
  }
}

function clearResultAftercare(realm) {
  if (realm === "crystal-ball") {
    chatMessages?.querySelectorAll(".oracle-ad-chat-result").forEach((el) => el.remove());
    return;
  }

  const output = document.querySelector(`[data-output="${realm}"]`);
  let next = output?.nextElementSibling;
  while (next?.classList.contains("result-aftercare")) {
    const current = next;
    next = next.nextElementSibling;
    current.remove();
  }
}

function focusRealmInput(realm) {
  if (realm === "crystal-ball" && !fortuneProfileReady()) {
    fortuneFocus?.focus();
    return;
  }
  const focusSelectors = {
    "crystal-ball": "#chat-input",
    "western-zodiac": ".zodiac-btn",
    "chinese-zodiac": "#birth-year",
    tarot: '[data-input="tarot"]',
    love: '[data-input="love"]',
    magic8: '[data-input="magic8"]',
    numerology: "#numerology-birthday",
    "daily-fortune": "#daily-sign",
  };
  document.querySelector(focusSelectors[realm])?.focus();
}

function addResultActions(realm, afterNode) {
  const actions = document.createElement("div");
  actions.className = "result-actions result-aftercare";
  actions.innerHTML = `
    <button class="btn-gold btn-small" data-another-reading="${realm}">Try Another Reading</button>
    <a class="btn-ghost btn-small" href="/archive" data-nav="archive">Open Archive</a>
  `;
  afterNode.insertAdjacentElement("afterend", actions);

  actions.querySelector("[data-another-reading]")?.addEventListener("click", () => {
    trackEvent("another_reading_click", { realm });
    clearResultAftercare(realm);
    showPage(realm, { isResult: false, scroll: false });
    focusRealmInput(realm);
  });

  actions.querySelector('[data-nav="archive"]')?.addEventListener("click", (event) => {
    event.preventDefault();
    showPage("archive");
  });
}

function markResultRendered(realm, answer) {
  const resultPath = RESULT_ROUTE_BY_REALM[realm];
  const output = document.querySelector(`[data-output="${realm}"]`);
  trackEvent("result_rendered", {
    realm,
    answer_length: answer?.length || 0,
    page_path: resultPath,
  });
  scheduleAmbientPopunder("result_rendered");

  if (resultPath) {
    if (window.location.pathname !== resultPath) {
      history.pushState({ pageId: realm, isResult: true }, "", resultPath);
    } else {
      history.replaceState({ pageId: realm, isResult: true }, "", resultPath);
    }
    updateDocumentMeta(realm, true);
    trackVirtualPage(realm, true);
  }

  if (realm === "crystal-ball" && chatMessages) {
    clearResultAftercare(realm);
    const adSlot = createResultAdSlot(realm);
    adSlot.classList.add("oracle-ad-chat-result");
    chatMessages.appendChild(adSlot);
    registerAdSlots(adSlot);
    activateSlotsForScreen("result", realm);
    scrollChatToBottom();
    return;
  }

  if (output) {
    clearResultAftercare(realm);
    const adSlot = createResultAdSlot(realm);
    adSlot.classList.add("result-aftercare");
    output.insertAdjacentElement("afterend", adSlot);
    addResultActions(realm, adSlot);
    registerAdSlots(adSlot);
    activateSlotsForScreen("result", realm);
  }
}

// --- Archive (LocalStorage) ---
const ARCHIVE_KEY = "oracle-mirror-archive";

function getArchive() {
  try {
    return JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveToArchive(realm, question, answer, extra) {
  const archive = getArchive();
  archive.unshift({
    realm,
    question,
    answer,
    extra,
    date: new Date().toISOString(),
  });
  if (archive.length > 100) archive.length = 100;
  localStorage.setItem(ARCHIVE_KEY, JSON.stringify(archive));
  trackEvent("result_saved", {
    realm,
    has_question: Boolean(question),
    answer_length: answer?.length || 0,
  });
}

function renderArchive() {
  const list = document.getElementById("archive-list");
  if (!list) return;
  const archive = getArchive();
  if (archive.length === 0) {
    list.innerHTML =
      '<p class="archive-empty">No readings have been saved yet. Visit a realm to begin your journey.</p>';
    return;
  }
  const realmLabels = {
    "crystal-ball": "Crystal Ball",
    "western-zodiac": "Western Zodiac",
    "chinese-zodiac": "Chinese Zodiac",
    tarot: "Tarot",
    love: "Love Oracle",
    magic8: "Magic 8 Ball",
    numerology: "Numerology",
    "daily-fortune": "Daily Fortune",
    reading: "Crystal Ball",
    chat: "Crystal Ball Chat",
  };
  list.innerHTML = archive
    .map((entry) => {
      const d = new Date(entry.date);
      const dateStr = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      const label = realmLabels[entry.realm] || entry.realm;
      const questionLine = entry.question
        ? `<p class="archive-question">"${escapeHTML(entry.question)}"</p>`
        : "";
      return `<div class="archive-entry">
        <div class="archive-entry-header">
          <span class="archive-realm">${escapeHTML(label)}</span>
          <span class="archive-date">${dateStr}</span>
        </div>
        ${questionLine}
        <div class="archive-answer">${escapeHTML(entry.answer)}</div>
      </div>`;
    })
    .join("");

  const thirdEntry = list.querySelectorAll(".archive-entry")[2];
  if (thirdEntry) {
    const feedAd = createArchiveFeedAdSlot();
    thirdEntry.insertAdjacentElement("afterend", feedAd);
    activateAdSlot("oracle-archive-native", { realm: "archive" });
  }

  activateAdSlot("oracle-archive-bottom-slot", { realm: "archive" });
}

document.getElementById("btn-clear-archive")?.addEventListener("click", () => {
  localStorage.removeItem(ARCHIVE_KEY);
  renderArchive();
});

for (const card of document.querySelectorAll('.card[data-realm="archive"]')) {
  card.addEventListener("click", () => {
    setTimeout(renderArchive, 50);
  });
}

// Also render archive when navigating via nav
for (const link of document.querySelectorAll('[data-nav="archive"]')) {
  link.addEventListener("click", () => {
    setTimeout(renderArchive, 50);
  });
}

// =========================================================
// CRYSTAL BALL CHAT (Madame Fortuna Conversational AI)
// =========================================================
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const chatSend = document.getElementById("chat-send");
const orbStatus = document.getElementById("orb-status");
const fortuneFocus = document.getElementById("fortune-focus");
const fortuneTimeframe = document.getElementById("fortune-timeframe");
const fortuneOmen = document.getElementById("fortune-omen");
const fortuneMood = document.getElementById("fortune-mood");
const fortuneQuestionnaireHint = document.getElementById("fortune-questionnaire-hint");

let conversationHistory = [];
let chatBusy = false;

function getFortuneProfile() {
  return {
    focus: fortuneFocus?.value || "",
    timeframe: fortuneTimeframe?.value || "",
    omen: fortuneOmen?.value || "",
    mood: fortuneMood?.value || "",
  };
}

function fortuneProfileReady() {
  const profile = getFortuneProfile();
  return Boolean(profile.focus && profile.timeframe);
}

function describeFortuneProfile(profile = getFortuneProfile()) {
  const fragments = [];
  if (profile.focus) fragments.push(`matter: ${profile.focus}`);
  if (profile.timeframe) fragments.push(`season: ${profile.timeframe}`);
  if (profile.omen) fragments.push(`omen: ${profile.omen}`);
  if (profile.mood) fragments.push(`heart: ${profile.mood}`);
  return fragments.join("; ");
}

function syncFortuneQuestionnaire() {
  const ready = fortuneProfileReady();
  if (chatSend) chatSend.disabled = chatBusy || !ready;
  if (fortuneQuestionnaireHint) {
    fortuneQuestionnaireHint.classList.toggle("ready", ready);
    fortuneQuestionnaireHint.textContent = ready
      ? `The mirror is tuned to ${describeFortuneProfile()}.`
      : "Select at least a matter and a season before the mirror opens fully.";
  }
  if (orbStatus && !chatBusy) {
    orbStatus.textContent = ready ? "The mists are listening..." : "Choose a matter and season...";
  }
}

for (const el of [fortuneFocus, fortuneTimeframe, fortuneOmen, fortuneMood]) {
  el?.addEventListener("change", syncFortuneQuestionnaire);
}

function createMessageEl(role, text) {
  const msg = document.createElement("div");
  msg.className = `chat-msg ${role === "user" ? "user" : "fortuna"}`;

  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.textContent = role === "user" ? "\u{1F9D1}" : "\u{1F52E}";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.textContent = text;

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  return msg;
}

function createTypingEl() {
  const msg = document.createElement("div");
  msg.className = "chat-msg fortuna";
  msg.id = "typing-indicator";

  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.textContent = "\u{1F52E}";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble typing-indicator";
  bubble.innerHTML =
    '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

  msg.appendChild(avatar);
  msg.appendChild(bubble);
  return msg;
}

function scrollChatToBottom() {
  if (chatMessages) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

async function sendChatMessage() {
  if (chatBusy || !chatInput || !chatMessages) return;
  if (!fortuneProfileReady()) {
    syncFortuneQuestionnaire();
    fortuneFocus?.focus();
    return;
  }

  const text = chatInput.value.trim();
  if (!text) return;
  const readingProfile = getFortuneProfile();

  chatBusy = true;
  chatInput.value = "";
  chatSend.disabled = true;
  setReadingState(true);
  clearResultAftercare("crystal-ball");
  trackEvent("question_submitted", {
    realm: "crystal-ball",
    question_length: text.length,
    questionnaire_focus: readingProfile.focus,
    questionnaire_timeframe: readingProfile.timeframe,
    questionnaire_has_omen: Boolean(readingProfile.omen),
    questionnaire_has_mood: Boolean(readingProfile.mood),
  });
  trackEvent("reading_started", {
    realm: "crystal-ball",
    questionnaire_focus: readingProfile.focus,
    questionnaire_timeframe: readingProfile.timeframe,
  });

  // Add user message
  conversationHistory.push({ role: "user", content: text });
  chatMessages.appendChild(createMessageEl("user", text));
  scrollChatToBottom();

  // Show typing indicator
  if (orbStatus) orbStatus.textContent = "The mists swirl...";
  const typingEl = createTypingEl();
  chatMessages.appendChild(typingEl);
  scrollChatToBottom();

  try {
    const data = await callAPI("/api/chat", {
      messages: conversationHistory,
      readingProfile,
    });

    // Remove typing indicator
    typingEl.remove();

    const response = extractResponse(data);
    conversationHistory.push({ role: "assistant", content: response });

    // Add Fortuna's response
    chatMessages.appendChild(createMessageEl("assistant", response));
    scrollChatToBottom();

    // Update orb
    if (orbStatus) orbStatus.textContent = "Ask another question...";

    // Save to archive
    saveToArchive("chat", `${text} (${describeFortuneProfile(readingProfile)})`, response);
    markResultRendered("crystal-ball", response);
  } catch {
    typingEl.remove();
    const errorMsg = createMessageEl(
      "assistant",
      "The mists grow cloudy... The spirits are silent for now. Please try again, dear seeker."
    );
    chatMessages.appendChild(errorMsg);
    scrollChatToBottom();
    if (orbStatus) orbStatus.textContent = "The mists are clouded...";
  }

  setReadingState(false);
  chatBusy = false;
  syncFortuneQuestionnaire();
  chatInput.focus();
}

chatSend?.addEventListener("click", sendChatMessage);

chatInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendChatMessage();
  }
});

// Auto-greet when entering crystal ball page
function initChatGreeting() {
  if (chatMessages && conversationHistory.length === 0) {
    chatMessages.innerHTML = "";
    const greeting = createMessageEl(
      "assistant",
      "Ahhhh... a new soul approaches the crystal ball. I am Madame Fortuna, and the mists have been expecting you. Set the lens of the mirror, then whisper the question that burns within your heart."
    );
    chatMessages.appendChild(greeting);
    conversationHistory.push({
      role: "assistant",
      content:
        "Ahhhh... a new soul approaches the crystal ball. I am Madame Fortuna, and the mists have been expecting you. Set the lens of the mirror, then whisper the question that burns within your heart.",
    });
    syncFortuneQuestionnaire();
  }
}

// Trigger greeting when crystal ball page becomes visible
const crystalBallObserver = new MutationObserver(() => {
  const crystalPage = document.getElementById("page-crystal-ball");
  if (crystalPage?.classList.contains("active")) {
    initChatGreeting();
    chatInput?.focus();
  }
});

const crystalPage = document.getElementById("page-crystal-ball");
if (crystalPage) {
  crystalBallObserver.observe(crystalPage, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

// =========================================================
// REALM HANDLERS (existing functionality)
// =========================================================

// --- Generic Realm Buttons (simple text input realms) ---
for (const btn of document.querySelectorAll(
  ".btn-realm[data-endpoint][data-body-key][data-source]"
)) {
  btn.addEventListener("click", async () => {
    const endpoint = btn.dataset.endpoint;
    const bodyKey = btn.dataset.bodyKey;
    const realm = btn.dataset.source;
    const inputEl = document.querySelector(`[data-input="${realm}"]`);
    const value = inputEl?.value?.trim();

    if (!value) {
      setOutput(realm, "Please enter your question first.");
      return;
    }

    setOutput(realm, getLoadingMessage(realm), true);
    btn.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", {
      realm,
      question_length: value.length,
    });
    trackEvent("reading_started", { realm });
    try {
      const data = await callAPI(endpoint, { [bodyKey]: value });
      if (realm === "tarot" && data.cards) {
        const cardSlots = document.querySelectorAll(".tarot-card-slot");
        const labels = ["Past", "Present", "Future"];
        data.cards.forEach((card, i) => {
          if (cardSlots[i]) {
            cardSlots[i].classList.add("revealed");
            cardSlots[i].querySelector(".tarot-card-back").textContent = card;
          }
        });
        const cardsHTML = data.cards
          .map(
            (c, i) =>
              `<span class="drawn-card">${labels[i]}: ${escapeHTML(c)}</span>`
          )
          .join("");
        setOutputHTML(
          realm,
          `<div class="cards-drawn">${cardsHTML}</div><div>${escapeHTML(extractResponse(data))}</div>`
        );
      } else {
        const answer = extractResponse(data);
        setOutput(realm, answer);
      }
      saveToArchive(realm, value, extractResponse(data));
      markResultRendered(realm, extractResponse(data));
    } catch {
      setOutput(realm, "The spirits are silent. Please try again later.");
    }
    setReadingState(false);
    btn.disabled = false;
  });

  const inputEl = document.querySelector(
    `[data-input="${btn.dataset.source}"]`
  );
  inputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      btn.click();
    }
  });
}

// --- Western Zodiac (sign selection) ---
let selectedSign = null;
for (const btn of document.querySelectorAll(".zodiac-btn[data-sign]")) {
  btn.addEventListener("click", async () => {
    for (const b of document.querySelectorAll(".zodiac-btn")) {
      b.classList.remove("selected");
    }
    btn.classList.add("selected");
    selectedSign = btn.dataset.sign;

    setOutput("western-zodiac", getLoadingMessage("western-zodiac"), true);
    setReadingState(true);
    trackEvent("question_submitted", {
      realm: "western-zodiac",
      question_length: selectedSign.length,
      selection: selectedSign,
    });
    trackEvent("reading_started", { realm: "western-zodiac" });
    try {
      const data = await callAPI("/api/western-zodiac", {
        sign: selectedSign,
      });
      const answer = extractResponse(data);
      setOutput("western-zodiac", answer);
      saveToArchive("western-zodiac", selectedSign, answer);
      markResultRendered("western-zodiac", answer);
    } catch {
      setOutput(
        "western-zodiac",
        "The stars are obscured. Please try again later."
      );
    }
    setReadingState(false);
  });
}

// --- Chinese Zodiac ---
const CHINESE_ANIMALS = [
  "Monkey", "Rooster", "Dog", "Pig", "Rat", "Ox",
  "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat",
];

const birthYearInput = document.getElementById("birth-year");
const animalDisplay = document.getElementById("chinese-animal-display");

birthYearInput?.addEventListener("input", () => {
  const year = parseInt(birthYearInput.value, 10);
  if (year >= 1900 && year <= 2100) {
    const animal = CHINESE_ANIMALS[year % 12];
    animalDisplay.textContent = `Year of the ${animal}`;
    animalDisplay.classList.remove("hidden");
  } else {
    animalDisplay.classList.add("hidden");
  }
});

document.getElementById("btn-chinese")?.addEventListener("click", async () => {
  const year = parseInt(birthYearInput?.value, 10);
  if (!year || year < 1900 || year > 2100) {
    setOutput("chinese-zodiac", "Please enter a valid birth year (1900-2100).");
    return;
  }
  const btn = document.getElementById("btn-chinese");
  setOutput("chinese-zodiac", getLoadingMessage("chinese-zodiac"), true);
  btn.disabled = true;
  setReadingState(true);
  trackEvent("question_submitted", {
    realm: "chinese-zodiac",
    question_length: String(year).length,
    selection: year,
  });
  trackEvent("reading_started", { realm: "chinese-zodiac" });
  try {
    const data = await callAPI("/api/chinese-zodiac", { year });
    const answer = extractResponse(data);
    setOutput("chinese-zodiac", answer);
    saveToArchive("chinese-zodiac", `Born ${year}`, answer);
    markResultRendered("chinese-zodiac", answer);
  } catch {
    setOutput(
      "chinese-zodiac",
      "The jade pavilion is clouded. Please try again later."
    );
  }
  setReadingState(false);
  btn.disabled = false;
});

// --- Love Oracle ---
document.getElementById("btn-love")?.addEventListener("click", async () => {
  const inputEl = document.querySelector('[data-input="love"]');
  const question = inputEl?.value?.trim();
  if (!question) {
    setOutput("love", "Please ask a question about matters of the heart.");
    return;
  }
  const name1 = document.getElementById("love-name1")?.value?.trim() || "";
  const name2 = document.getElementById("love-name2")?.value?.trim() || "";
  const btn = document.getElementById("btn-love");

  setOutput("love", getLoadingMessage("love"), true);
  btn.disabled = true;
  setReadingState(true);
  trackEvent("question_submitted", {
    realm: "love",
    question_length: question.length,
  });
  trackEvent("reading_started", { realm: "love" });
  try {
    const body = { question };
    if (name1) body.name1 = name1;
    if (name2) body.name2 = name2;
    const data = await callAPI("/api/love", body);
    const answer = extractResponse(data);
    setOutput("love", answer);
    const label =
      name1 && name2 ? `${name1} & ${name2}: ${question}` : question;
    saveToArchive("love", label, answer);
    markResultRendered("love", answer);
  } catch {
    setOutput("love", "The hearts are silent. Please try again later.");
  }
  setReadingState(false);
  btn.disabled = false;
});

// --- Numerology ---
document
  .getElementById("btn-numerology")
  ?.addEventListener("click", async () => {
    const birthdayInput = document.getElementById("numerology-birthday");
    const birthday = birthdayInput?.value;
    if (!birthday) {
      setOutput("numerology", "Please select your birthday.");
      return;
    }
    const btn = document.getElementById("btn-numerology");
    setOutput("numerology", getLoadingMessage("numerology"), true);
    btn.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", {
      realm: "numerology",
      question_length: birthday.length,
    });
    trackEvent("reading_started", { realm: "numerology" });
    try {
      const data = await callAPI("/api/numerology", { birthday });
      const answer = extractResponse(data);
      if (data.lifePathNumber) {
        const core = document.getElementById("life-path-display");
        if (core) core.textContent = data.lifePathNumber;
      }
      setOutput("numerology", answer);
      saveToArchive("numerology", `Birthday: ${birthday}`, answer);
      markResultRendered("numerology", answer);
    } catch {
      setOutput(
        "numerology",
        "The sacred numbers are veiled. Please try again later."
      );
    }
    setReadingState(false);
    btn.disabled = false;
  });

// --- Daily Fortune ---
document.getElementById("btn-daily")?.addEventListener("click", async () => {
  const signSelect = document.getElementById("daily-sign");
  const sign = signSelect?.value || "";
  const btn = document.getElementById("btn-daily");

  setOutput("daily-fortune", getLoadingMessage("daily-fortune"), true);
  btn.disabled = true;
  setReadingState(true);
  trackEvent("question_submitted", {
    realm: "daily-fortune",
    question_length: sign.length,
    selection: sign || "general",
  });
  trackEvent("reading_started", { realm: "daily-fortune" });
  try {
    const body = {};
    if (sign) body.sign = sign;
    const data = await callAPI("/api/daily-fortune", body);
    const answer = extractResponse(data);
    setOutput("daily-fortune", answer);
    saveToArchive("daily-fortune", sign || "General", answer);
    markResultRendered("daily-fortune", answer);
  } catch {
    setOutput(
      "daily-fortune",
      "The dawn light is obscured. Please try again later."
    );
  }
  setReadingState(false);
  btn.disabled = false;
});

// --- Magic 8 Ball shake animation ---
const magic8Ball = document.getElementById("magic8-ball");
magic8Ball?.addEventListener("click", () => {
  magic8Ball.classList.add("shaking");
  setTimeout(() => magic8Ball.classList.remove("shaking"), 500);
});

// --- Boot ---
initAdSystem();
syncFortuneQuestionnaire();

const initialRoute = getRouteState();
showPage(initialRoute.pageId, {
  push: false,
  isResult: initialRoute.isResult,
  scroll: false,
  emitTracking: false,
});

trackEvent("page_view", {
  page_path: window.location.pathname,
  page_title: document.title,
  screen: initialRoute.isResult ? `result/${initialRoute.pageId}` : initialRoute.pageId,
  realm: initialRoute.pageId,
});
trackVirtualPage(initialRoute.pageId, initialRoute.isResult);

if (REALM_PAGES.has(initialRoute.pageId) && !initialRoute.isResult) {
  trackEvent("realm_open", {
    realm: initialRoute.pageId,
    page_path: ROUTE_BY_PAGE[initialRoute.pageId],
  });
}

if (initialRoute.pageId === "archive") {
  trackEvent("archive_open", { page_path: ROUTE_BY_PAGE.archive });
  renderArchive();
}
