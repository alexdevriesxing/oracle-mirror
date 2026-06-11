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

window.spawnParticleBurst = window.spawnParticleBurst || (() => {});

// --- Magical Stardust & Twist Sparkle Particle Engine ---
const canvas = document.getElementById("particles");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let particles = [];
  const BACKGROUND_PARTICLE_COUNT = 70;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Draw a beautiful four-pointed star for stardust sparkles
  function drawSparkleStar(ctx, cx, cy, spikes, outerRadius, innerRadius, alpha, color) {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = color.replace("ALPHA", alpha.toFixed(2));
    ctx.fill();
  }

  function createBackgroundParticle() {
    const colors = [
      "rgba(212, 175, 55, ALPHA)", // gold
      "rgba(240, 208, 96, ALPHA)",  // light gold
      "rgba(167, 139, 250, ALPHA)", // soft purple
      "rgba(255, 255, 255, ALPHA)"  // pure white
    ];
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2.5 + 0.6,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2 - 0.08,
      opacity: Math.random() * 0.55 + 0.15,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulse: Math.random() * Math.PI * 2,
      type: Math.random() > 0.68 ? "star" : "dot",
      colorTemplate: colors[Math.floor(Math.random() * colors.length)]
    };
  }

  function initParticles() {
    particles = Array.from({ length: BACKGROUND_PARTICLE_COUNT }, createBackgroundParticle);
  }

  // Interactive Cursor Sparkle Generation
  function spawnCursorSparkle(mx, my) {
    const colors = [
      "rgba(212, 175, 55, ALPHA)", // Gold stardust
      "rgba(167, 139, 250, ALPHA)", // Purple stardust
      "rgba(251, 113, 133, ALPHA)"  // Romantic rose stardust
    ];
    particles.push({
      x: mx,
      y: my,
      size: Math.random() * 3.5 + 1.5,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: (Math.random() - 0.5) * 1.5 + 0.2,
      opacity: 1.0,
      decay: Math.random() * 0.025 + 0.015,
      pulse: 0,
      type: Math.random() > 0.4 ? "star" : "dot",
      colorTemplate: colors[Math.floor(Math.random() * colors.length)],
      isCursorSparkle: true
    });
  }

  // Globally exposed magical stardust burst for compatibility reveals and drawing rituals
  window.spawnParticleBurst = function(cx, cy, count = 30) {
    const colors = [
      "rgba(212, 175, 55, ALPHA)", // Gold stardust
      "rgba(167, 139, 250, ALPHA)", // Purple stardust
      "rgba(251, 113, 133, ALPHA)"  // Romantic rose stardust
    ];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3.5 + 1.5;
      particles.push({
        x: cx,
        y: cy,
        size: Math.random() * 4.0 + 1.5,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed - 0.5,
        opacity: 1.0,
        decay: Math.random() * 0.018 + 0.012,
        pulse: 0,
        type: Math.random() > 0.35 ? "star" : "dot",
        colorTemplate: colors[Math.floor(Math.random() * colors.length)],
        isCursorSparkle: true
      });
    }
  };

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Limit total particles to avoid memory growth
    if (particles.length > 250) {
      particles = particles.slice(-250);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.isCursorSparkle) {
        // Cursor sparkles shrink, float down, and decay opacity
        p.opacity -= p.decay;
        p.size *= 0.97;
        if (p.opacity <= 0 || p.size < 0.2) {
          particles.splice(i, 1);
          continue;
        }
      } else {
        // Background particles float slowly and pulse
        p.pulse += p.pulseSpeed;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }

      const currentAlpha = p.isCursorSparkle 
        ? p.opacity 
        : p.opacity * (0.45 + 0.55 * Math.sin(p.pulse));

      if (p.type === "star") {
        drawSparkleStar(ctx, p.x, p.y, 4, p.size * 2, p.size * 0.45, currentAlpha, p.colorTemplate);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.colorTemplate.replace("ALPHA", currentAlpha.toFixed(2));
        ctx.fill();
      }
    }
    requestAnimationFrame(drawParticles);
  }

  // Bind mouse move and mobile touch trails
  window.addEventListener("mousemove", (e) => {
    // Spawn 2 stardust particles per move
    spawnCursorSparkle(e.clientX, e.clientY);
    if (Math.random() > 0.5) spawnCursorSparkle(e.clientX, e.clientY);
  });

  window.addEventListener("touchmove", (e) => {
    if (e.touches && e.touches[0]) {
      spawnCursorSparkle(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

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
  "love-match": "/love-match",
  olympus: "/oracle-of-olympus",
  magic8: "/magic-8-ball",
  numerology: "/numerology",
  "daily-fortune": "/daily-fortune",
  birthchart: "/birth-chart",
  palmistry: "/palm-reading",
  iching: "/iching-oracle",
  personas: "/mystics",
  archive: "/archive",
  "ad-debug": "/ad-debug",
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
  "love-match": "/result/love-match",
  magic8: "/result/magic-8-ball",
  numerology: "/result/numerology",
  "daily-fortune": "/result/daily-fortune",
  birthchart: "/result/birth-chart",
  palmistry: "/result/palm-reading",
  iching: "/result/iching-oracle",
};

const PAGE_BY_ROUTE = new Map(Object.entries(ROUTE_BY_PAGE).map(([page, path]) => [path, page]));
const PAGE_BY_RESULT_ROUTE = new Map(Object.entries(RESULT_ROUTE_BY_REALM).map(([page, path]) => [path, page]));
const REALM_PAGES = new Set([
  "crystal-ball",
  "western-zodiac",
  "chinese-zodiac",
  "tarot",
  "love",
  "love-match",
  "magic8",
  "numerology",
  "daily-fortune",
  "birthchart",
  "palmistry",
  "iching",
  "olympus",
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
  "love-match": {
    title: "Love Match Compatibility Reading | Oracle Mirror",
    description: "Peers into your compatibility using zodiac signs, numerology calculation, and Tarot drawings.",
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
  "ad-debug": {
    title: "Ad Debug | Oracle Mirror",
    description: "Review Oracle Mirror ad loader diagnostics for the current browser session.",
  },
  birthchart: {
    title: "Astrological Birth Chart | Oracle Mirror",
    description: "Calculate your astronomical birth chart and reveal planetary placements inside the Oracle Mirror observatory.",
  },
  palmistry: {
    title: "Psychic Palm Reading | Oracle Mirror",
    description: "Read your hand lines and discover palmistry secrets of your heart, head, and life lines.",
  },
  iching: {
    title: "I Ching Book of Changes Coin Toss | Oracle Mirror",
    description: "Cast three ancient Chinese coins and build hexagrams to consult the philosophical I Ching Book of Changes.",
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
  olympus: {
    title: "Oracle of Olympus | Mystical Sports Predictions | Oracle Mirror",
    description: "Summon Pythia Nikephoros for divine verdicts, omens, and football match outcomes.",
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
  if (normalized.startsWith("/oracle-of-olympus")) {
    const matchId = normalized.substring("/oracle-of-olympus".length + 1);
    return { pageId: "olympus", isResult: false, path: normalized, matchId: matchId || null };
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
  if (pageId === "ad-debug") return "debug";
  if (REALM_PAGES.has(pageId)) return "realm";
  return "home";
}

function showPage(pageId, options = {}) {
  const { push = true, isResult = false, scroll = true, emitTracking = true } = options;
  for (const p of pages) {
    p.classList.remove("active");
  }

  const targetId = pageId === "olympus" ? "page-olympus" : `page-${pageId}`;
  const target = document.getElementById(targetId);
  if (target) {
    target.classList.add("active");
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const routePath = options.matchId 
    ? `/oracle-of-olympus/${options.matchId}` 
    : (isResult ? RESULT_ROUTE_BY_REALM[pageId] : ROUTE_BY_PAGE[pageId] || "/");
  if (push && routePath && window.location.pathname !== routePath) {
    history.pushState({ pageId, isResult, matchId: options.matchId }, "", routePath);
  }

  updateDocumentMeta(pageId, isResult);

  if (pageId === "olympus" && options.matchId) {
    const match = OLYMPUS_MATCHES_JS[options.matchId];
    if (match) {
      document.title = `${match.teamA} vs ${match.teamB} Mystical Prediction | Oracle Mirror`;
      document.querySelector('meta[name="description"]')?.setAttribute("content", `Mystical sports prediction and analysis for ${match.teamA} vs ${match.teamB} in the ${match.competition}. Summon the oracle for celestial omens.`);
    }
  }

  if (pageId === "olympus" && !options.matchId) {
    showMatchList();
  }

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
  showPage(route.pageId, { push: false, isResult: route.isResult, scroll: false, matchId: route.matchId });
  if (route.pageId === "olympus") {
    if (route.matchId) {
      showMatchDetail(route.matchId);
    } else {
      showMatchList();
    }
  }
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
  birthchart: "Astaria reads your planetary placements...",
  palmistry: "Cassandra studies the lines of your palm...",
  iching: "Sage Lao-Tan interprets the hexagram...",
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

function setOutputHTML(realm, html, isLoading = false) {
  const el = document.querySelector(`[data-output="${realm}"]`);
  if (!el) return;
  el.innerHTML = html;
  el.style.display = "block";
  if (isLoading) {
    el.classList.add("loading");
    clearResultAftercare(realm);
  } else {
    el.classList.remove("loading");
  }
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

function formatResponse(text) {
  if (!text) return "";
  let html = text
    .replace(/```html/g, '')
    .replace(/```/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''); // basic XSS protection
  
  if (!html.includes('<p>') && !html.includes('<h3>')) {
    html = escapeHTML(html);
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.split('\n\n').filter(p => p.trim()).map(p => `<p>${p.trim().replace(/\n/g, '<br>')}</p>`).join('');
  }
  return html;
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
    "love-match": "Love Compatibility",
    magic8: "Magic 8 Ball",
    numerology: "Numerology",
    "daily-fortune": "Daily Fortune",
    birthchart: "Birth Chart",
    palmistry: "Palm Reading",
    iching: "I Ching",
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
// CRYSTAL BALL CHAT (Madame Fortuna Conversational AI & Wizard)
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

// --- Expanded Wizard Setup ---
const wizardContainer = document.getElementById("fortune-wizard");
const wizardSteps = document.querySelectorAll(".wizard-step");
const progressBeads = document.querySelectorAll(".progress-bead");
const progressBar = document.getElementById("wizard-progress-bar");
const prevBtn = document.getElementById("wizard-prev-btn");
const nextBtn = document.getElementById("wizard-next-btn");

let currentStep = 1;
let conversationHistory = [];
let chatBusy = false;

function getFortuneProfile() {
  return {
    focus: document.getElementById("fortune-focus")?.value || "",
    timeframe: document.getElementById("fortune-timeframe")?.value || "",
    omen: document.getElementById("fortune-omen")?.value || "",
    mood: document.getElementById("fortune-mood")?.value || "",
    element: document.getElementById("fortune-element")?.value || "",
    moonPhase: document.getElementById("fortune-moonphase")?.value || "",
    tarotSigil: document.getElementById("fortune-tarotsigil")?.value || "",
  };
}

function fortuneProfileReady() {
  const profile = getFortuneProfile();
  return Boolean(profile.focus && profile.timeframe && profile.element && profile.moonPhase && profile.tarotSigil);
}

function describeFortuneProfile(profile = getFortuneProfile()) {
  const fragments = [];
  if (profile.focus) fragments.push(`matter: ${profile.focus}`);
  if (profile.timeframe) fragments.push(`season: ${profile.timeframe}`);
  if (profile.element) fragments.push(`element: ${profile.element}`);
  if (profile.omen) fragments.push(`omen: ${profile.omen}`);
  if (profile.mood) fragments.push(`heart: ${profile.mood}`);
  if (profile.moonPhase) fragments.push(`moon: ${profile.moonPhase}`);
  if (profile.tarotSigil) fragments.push(`sigil: ${profile.tarotSigil}`);
  return fragments.join("; ");
}

function syncFortuneQuestionnaire() {
  const ready = fortuneProfileReady();
  if (chatSend) chatSend.disabled = chatBusy || !ready;
  if (fortuneQuestionnaireHint) {
    fortuneQuestionnaireHint.classList.toggle("ready", ready);
    fortuneQuestionnaireHint.textContent = ready
      ? `The mirror is tuned to ${describeFortuneProfile()}.`
      : "Complete all 7 steps of the ritual before the mirror opens.";
  }
  if (orbStatus && !chatBusy) {
    orbStatus.textContent = ready ? "The mists are listening..." : "Align your frequencies below...";
  }
}

// Initialise options selection
function initWizardOptions() {
  document.querySelectorAll(".wizard-opt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.field;
      const value = btn.dataset.value;

      // Deselect siblings
      btn.parentElement.querySelectorAll(".wizard-opt-btn").forEach((sibling) => {
        sibling.classList.remove("selected");
      });

      // Select clicked
      btn.classList.add("selected");

      // Sync to hidden input/select
      if (field === "focus") {
        const sel = document.getElementById("fortune-focus");
        if (sel) sel.value = value;
      } else if (field === "timeframe") {
        const sel = document.getElementById("fortune-timeframe");
        if (sel) sel.value = value;
      } else if (field === "mood") {
        const sel = document.getElementById("fortune-mood");
        if (sel) sel.value = value;
      } else if (field === "omen") {
        const sel = document.getElementById("fortune-omen");
        if (sel) sel.value = value;
      } else if (field === "element") {
        const inp = document.getElementById("fortune-element");
        if (inp) inp.value = value;
      } else if (field === "moonphase") {
        const inp = document.getElementById("fortune-moonphase");
        if (inp) inp.value = value;
      }

      trackEvent("wizard_option_selected", { field, value });
      syncFortuneQuestionnaire();
      updateWizardNavigation();
    });
  });

  // Tarot Sigil Drew
  document.querySelectorAll(".tarot-draw-card").forEach((card) => {
    card.addEventListener("click", () => {
      if (document.getElementById("fortune-tarotsigil").value) return; // Already drew

      const cardName = card.dataset.cardReveal;
      card.classList.add("flipped", "selected");

      const inp = document.getElementById("fortune-tarotsigil");
      if (inp) inp.value = cardName;

      const hint = document.getElementById("tarot-draw-hint");
      if (hint) {
        hint.innerHTML = `You drew <strong>${cardName}</strong>! The ritual is complete.`;
        hint.style.color = "var(--gold-light)";
      }

      trackEvent("wizard_tarot_drawn", { card: cardName });
      syncFortuneQuestionnaire();
      updateWizardNavigation();
    });
  });
}

function updateWizardNavigation() {
  if (!progressBar || !prevBtn || !nextBtn) return;
  // Update progress
  progressBar.style.width = `${((currentStep - 1) / 6) * 100}%`;

  // Update beads
  progressBeads.forEach((bead, i) => {
    bead.classList.toggle("active", i < currentStep);
  });

  // Toggle visible panel
  wizardSteps.forEach((stepPanel) => {
    const stepNum = parseInt(stepPanel.dataset.stepPanel, 10);
    stepPanel.classList.toggle("active", stepNum === currentStep);
  });

  // Enable/Disable Back
  prevBtn.disabled = currentStep === 1;

  // Next state
  const isStepComplete = checkCurrentStepComplete();
  nextBtn.disabled = !isStepComplete;

  if (currentStep === 7) {
    nextBtn.textContent = "Seal Intention & Enter";
  } else {
    nextBtn.textContent = "Next \u2192";
  }
}

function checkCurrentStepComplete() {
  const profile = getFortuneProfile();
  switch (currentStep) {
    case 1: return Boolean(profile.focus);
    case 2: return Boolean(profile.timeframe);
    case 3: return Boolean(profile.mood);
    case 4: return Boolean(profile.element);
    case 5: return Boolean(profile.omen);
    case 6: return Boolean(profile.moonPhase);
    case 7: return Boolean(profile.tarotSigil);
    default: return false;
  }
}

prevBtn?.addEventListener("click", () => {
  if (currentStep > 1) {
    currentStep--;
    updateWizardNavigation();
  }
});

nextBtn?.addEventListener("click", () => {
  if (currentStep < 7) {
    currentStep++;
    updateWizardNavigation();
  } else if (currentStep === 7) {
    sealWizard();
  }
});

function sealWizard() {
  wizardContainer?.classList.add("wizard-sealed");
  trackEvent("wizard_completed", describeFortuneProfile());
  
  if (orbStatus) orbStatus.textContent = "The crystal is fully tuned. Speak your question...";
  syncFortuneQuestionnaire();
  chatInput?.focus();
}

// Initialise options on page load
initWizardOptions();
updateWizardNavigation();

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
        setOutputHTML(realm, formatResponse(answer));
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
      setOutputHTML("western-zodiac", formatResponse(answer));
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
    setOutputHTML("chinese-zodiac", formatResponse(answer));
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
      setOutputHTML("numerology", formatResponse(answer));
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
    setOutputHTML("daily-fortune", formatResponse(answer));
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

// =========================================================
// THE TEMPLE OF MATCHES (Love Match & Compatibility Systems)
// =========================================================
let activeLoveMatchPanel = "zodiac";

// --- Love Match Sub-Tab Navigation ---
const loveMatchTypeSelector = document.getElementById("love-match-type-selector");
if (loveMatchTypeSelector) {
  loveMatchTypeSelector.addEventListener("change", (e) => {
    activeLoveMatchPanel = e.target.value;

    for (const panel of document.querySelectorAll(".love-option-panel")) {
      panel.classList.remove("active");
    }
    const targetPanel = document.querySelector(`[data-love-panel="${activeLoveMatchPanel}"]`);
    if (targetPanel) {
      targetPanel.classList.add("active");
    }
    trackEvent("love_match_tab_switch", { tab: activeLoveMatchPanel });
  });
}

// --- Interactive Dual Tarot Draw Deck ---
const LOVE_TAROT_CARDS = [
  { name: "The Lovers", symbol: "❤️" },
  { name: "The Empress", symbol: "🌸" },
  { name: "The Emperor", symbol: "👑" },
  { name: "The Sun", symbol: "☀️" },
  { name: "The Star", symbol: "⭐" },
  { name: "The Moon", symbol: "🌙" },
  { name: "The World", symbol: "🌍" },
  { name: "The High Priestess", symbol: "🔮" },
  { name: "The Magician", symbol: "⚡" },
  { name: "Wheel of Fortune", symbol: "🌀" }
];

const seekerCardReveal = document.getElementById("love-seeker-card-reveal");
const partnerCardReveal = document.getElementById("love-partner-card-reveal");
const matchSeekerCardInput = document.getElementById("match-seeker-card");
const matchPartnerCardInput = document.getElementById("match-partner-card");

function checkLoveTarotHint() {
  const isSeekerFlipped = seekerCardReveal?.classList.contains("flipped");
  const isPartnerFlipped = partnerCardReveal?.classList.contains("flipped");
  const hintEl = document.getElementById("love-tarot-hint");
  if (hintEl) {
    if (isSeekerFlipped && isPartnerFlipped) {
      hintEl.innerHTML = "✨ Your combined destiny is drawn. Click below to reveal compatibility! ✨";
    } else if (isSeekerFlipped) {
      hintEl.textContent = "Draw their destiny card to proceed...";
    } else if (isPartnerFlipped) {
      hintEl.textContent = "Draw your destiny card to proceed...";
    } else {
      hintEl.textContent = "Click cards to draw your combined destiny...";
    }
  }
}

seekerCardReveal?.addEventListener("click", () => {
  if (seekerCardReveal.classList.contains("flipped")) return;
  const card = LOVE_TAROT_CARDS[Math.floor(Math.random() * LOVE_TAROT_CARDS.length)];
  const backName = seekerCardReveal.querySelector(".card-back .card-name");
  const backArt = seekerCardReveal.querySelector(".card-back .card-art");
  if (backName) backName.textContent = card.name;
  if (backArt) backArt.innerHTML = card.symbol;
  if (matchSeekerCardInput) matchSeekerCardInput.value = card.name;
  seekerCardReveal.classList.add("flipped");
  checkLoveTarotHint();
  const rect = seekerCardReveal.getBoundingClientRect();
  window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
});

partnerCardReveal?.addEventListener("click", () => {
  if (partnerCardReveal.classList.contains("flipped")) return;
  const card = LOVE_TAROT_CARDS[Math.floor(Math.random() * LOVE_TAROT_CARDS.length)];
  const backName = partnerCardReveal.querySelector(".card-back .card-name");
  const backArt = partnerCardReveal.querySelector(".card-back .card-art");
  if (backName) backName.textContent = card.name;
  if (backArt) backArt.innerHTML = card.symbol;
  if (matchPartnerCardInput) matchPartnerCardInput.value = card.name;
  partnerCardReveal.classList.add("flipped");
  checkLoveTarotHint();
  const rect = partnerCardReveal.getBoundingClientRect();
  window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
});

// --- Deterministic Cosmic Compatibility Score ---
function calculateCosmicScore(name1, name2, matchType, val1, val2) {
  const combinedStr = `${name1.trim().toLowerCase()}+${name2.trim().toLowerCase()}+${matchType}+${(val1 || "").toLowerCase()}+${(val2 || "").toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < combinedStr.length; i++) {
    hash = combinedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 55) + 45; // Deterministic score between 45% and 99%
}

// --- Reveal Love Compatibility ---
document.getElementById("btn-love-match")?.addEventListener("click", async () => {
  const btn = document.getElementById("btn-love-match");

  if (activeLoveMatchPanel === "vision") {
    const energy = document.getElementById("vision-energy")?.value;
    const element = document.getElementById("vision-element")?.value;
    const age = document.getElementById("vision-age")?.value?.trim();
    const idealDate = document.getElementById("vision-ideal-date")?.value?.trim();
    if (!energy || !element || !age || !idealDate) {
      setOutput("love-match", "Please answer all of Rosalind's questions so she may glimpse your cosmic partner.");
      return;
    }
    
    setOutputHTML("love-match", `
      <div class="vision-loading">
        <p>Rosalind is gazing into the cosmic weave. This intense vision may take up to 60 seconds to manifest...</p>
        <div class="vision-progress-bar">
          <div class="vision-progress-fill"></div>
        </div>
      </div>
    `, true);
    btn.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", { realm: "love-match", match_type: "vision" });
    trackEvent("reading_started", { realm: "love-match" });
    
    try {
      const data = await callAPI("/api/soulmate-vision", { energy, element, age, idealDate });
      
      const disclaimer = `<div class="vision-disclaimer">
        <i>Disclaimer: This is an AI-generated vision based on probability and astrological symbolism. We do not suggest spending time or money looking for this specific individual.</i>
      </div>`;
      
      const resultHtml = `
        <div class="soulmate-vision-result">
          <h3 class="vision-title">Your Destined Encounter</h3>
          <img src="${data.imageBase64}" alt="Your Soulmate Vision" class="vision-image" />
          <div class="reading-body vision-body">
            ${formatResponse(data.response || data.message)}
          </div>
          ${disclaimer}
        </div>
      `;
      
      displayResult("love-match", resultHtml, "/result/soulmate-vision");
      btn.disabled = false;
      setReadingState(false);
      scheduleAmbientPopunder("vision_delivered");
    } catch (err) {
      setOutput("love-match", getFallbackResponse());
      btn.disabled = false;
      setReadingState(false);
    }
    return;
  }

  if (activeLoveMatchPanel === "oracle") {
    const question = document.getElementById("love-oracle-question")?.value?.trim();
    if (!question) {
      setOutput("love-match", "Please ask a question about matters of the heart.");
      return;
    }
    const name1 = document.getElementById("match-seeker-name")?.value?.trim() || "";
    const name2 = document.getElementById("match-partner-name")?.value?.trim() || "";
    
    setOutput("love-match", getLoadingMessage("love"), true);
    btn.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", { realm: "love-match", match_type: "oracle", question_length: question.length });
    trackEvent("reading_started", { realm: "love-match" });
    
    try {
      const body = { question };
      if (name1) body.name1 = name1;
      if (name2) body.name2 = name2;
      const data = await callAPI("/api/love", body);
      const answer = extractResponse(data);
      displayResult("love-match", formatResponse(answer), "/result/love-oracle");
      const label = name1 && name2 ? `${name1} & ${name2}: ${question}` : question;
      saveToArchive("love", label, answer);
      scheduleAmbientPopunder("oracle_delivered");
    } catch {
      setOutput("love-match", "The hearts are silent. Please try again later.");
    }
    btn.disabled = false;
    setReadingState(false);
    return;
  }

  const seekerName = document.getElementById("match-seeker-name")?.value?.trim();
  const partnerName = document.getElementById("match-partner-name")?.value?.trim();

  if (!seekerName || !partnerName) {
    setOutput("love-match", "Please enter both names to weigh the cosmic compatibility.");
    return;
  }

  let seekerValue = "";
  let partnerValue = "";

  if (activeLoveMatchPanel === "zodiac") {
    seekerValue = document.getElementById("match-seeker-zodiac")?.value;
    partnerValue = document.getElementById("match-partner-zodiac")?.value;
    if (!seekerValue || !partnerValue) {
      setOutput("love-match", "Please select zodiac signs for both seekers.");
      return;
    }
  } else if (activeLoveMatchPanel === "numerology") {
    seekerValue = document.getElementById("match-seeker-birthday")?.value;
    partnerValue = document.getElementById("match-partner-birthday")?.value;
    if (!seekerValue || !partnerValue) {
      setOutput("love-match", "Please enter dates of birth for both seekers.");
      return;
    }
  } else if (activeLoveMatchPanel === "tarot") {
    seekerValue = matchSeekerCardInput?.value;
    partnerValue = matchPartnerCardInput?.value;
    if (!seekerValue || !partnerValue) {
      setOutput("love-match", "Please flip and draw a destiny card for both partners first.");
      return;
    }
  } else if (activeLoveMatchPanel === "quiz") {
    seekerValue = document.getElementById("match-quiz-sanctuary")?.value;
    partnerValue = document.getElementById("match-quiz-frequency")?.value;
    if (!seekerValue || !partnerValue) {
      setOutput("love-match", "Please select answers for both cosmic quiz questions.");
      return;
    }
  } else if (activeLoveMatchPanel === "omen") {
    seekerValue = document.getElementById("match-seeker-omen")?.value;
    partnerValue = document.getElementById("match-partner-omen")?.value;
    if (!seekerValue || !partnerValue) {
      setOutput("love-match", "Please choose a prevailing omen for both individuals.");
      return;
    }
  }

  setOutput("love-match", getLoadingMessage("love"), true);
  btn.disabled = true;
  setReadingState(true);
  trackEvent("question_submitted", {
    realm: "love-match",
    match_type: activeLoveMatchPanel,
  });
  trackEvent("reading_started", { realm: "love-match" });

  try {
    const score = calculateCosmicScore(seekerName, partnerName, activeLoveMatchPanel, seekerValue, partnerValue);
    const body = {
      type: activeLoveMatchPanel,
      seekerName,
      partnerName,
      seekerValue,
      partnerValue
    };

    const data = await callAPI("/api/love-match", body);
    const answer = extractResponse(data);

    let tier = "Karmic Partners";
    let color = "var(--rose)";
    if (score >= 90) {
      tier = "Twin Flames (Divine Union)";
      color = "#ff3b70";
    } else if (score >= 75) {
      tier = "Cosmic Resonance (High Affinity)";
      color = "#d4af37";
    } else if (score >= 60) {
      tier = "Karmic Partners (Soul Growth)";
      color = "#a78bfa";
    } else if (score >= 45) {
      tier = "Spiritual Crossroads (Aligned Journey)";
      color = "#60a5fa";
    } else {
      tier = "Restless Constellations (Karmic Mirror)";
      color = "#94a3b8";
    }

    const scoreHtml = `
      <div class="love-match-result-card">
        <div class="love-match-badge-container">
          <svg class="love-match-circle" viewBox="0 0 100 100">
            <circle class="circle-bg" cx="50" cy="50" r="42" />
            <circle class="circle-fill" cx="50" cy="50" r="42" style="stroke: ${color}; stroke-dasharray: 264; stroke-dashoffset: ${264 - (264 * score) / 100};" />
          </svg>
          <div class="love-match-score-text" style="color: ${color};">
            <span class="score-num">${score}%</span>
            <span class="score-label">CHEMISTRY</span>
          </div>
        </div>
        <div class="love-match-tier" style="background: rgba(251, 113, 133, 0.08); border-color: ${color}; color: ${color};">
          💝 ${tier} 💝
        </div>
        <div class="love-match-couple-names">
          ${escapeHTML(seekerName)} & ${escapeHTML(partnerName)}
        </div>
        <div class="love-match-reading-text">
          ${formatResponse(answer)}
        </div>
        <button class="btn-gold btn-save-archive" id="btn-save-love-match-archive">Save Compatibility to Archive</button>
      </div>
    `;

    setOutputHTML("love-match", scoreHtml);

    document.getElementById("btn-save-love-match-archive")?.addEventListener("click", () => {
      saveToArchive(
        "love-match",
        `${seekerName} & ${partnerName} (${activeLoveMatchPanel.toUpperCase()})`,
        `Chemistry Score: ${score}% (${tier})\n\nProphecy:\n${answer}`
      );
      const saveBtn = document.getElementById("btn-save-love-match-archive");
      if (saveBtn) {
        saveBtn.textContent = "Saved to Archive ✓";
        saveBtn.disabled = true;
        saveBtn.style.opacity = "0.7";
      }
    });

    markResultRendered("love-match", answer);

    setTimeout(() => {
      const badge = document.querySelector(".love-match-badge-container");
      if (badge) {
        const rect = badge.getBoundingClientRect();
        window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
      }
    }, 150);

  } catch (err) {
    setOutput("love-match", "The hearts are silent. Please check your connection and try again.");
  }
  setReadingState(false);
  btn.disabled = false;
});

// =========================================================
// ORACLE OF OLYMPUS (Mystical Sports Predictions)
// =========================================================

const OLYMPUS_MATCHES_JS = {
  "wc2026-netherlands-japan": {
    matchId: "wc2026-netherlands-japan",
    teamA: "Netherlands",
    teamB: "Japan",
    competition: "FIFA World Cup 2026",
    stage: "Group Stage",
    date: "2026-06-18",
    venue: "MetLife Stadium",
    predictedScore: "Netherlands 2–1 Japan",
    probabilities: { teamAWin: 48, draw: 27, teamBWin: 25 },
    confidence: "Medium",
    historicalSummary: "Netherlands have a strong World Cup record and attacking tradition. Japan are disciplined, tactically organized, and dangerous in transition.",
    dataReasoning: "Historical tournament depth and attacking form give the Netherlands a narrow statistical advantage, though Japan's tactical cohesion keeps the draw probability high."
  },
  "wc2026-argentina-france": {
    matchId: "wc2026-argentina-france",
    teamA: "Argentina",
    teamB: "France",
    competition: "FIFA World Cup 2026",
    stage: "Quarter-Finals",
    date: "2026-06-10",
    venue: "Azteca Stadium",
    predictedScore: "Argentina 1–2 France",
    probabilities: { teamAWin: 32, draw: 28, teamBWin: 40 },
    confidence: "High",
    historicalSummary: "A rematch of the legendary 2022 final. Argentina's aging core faces France's explosive young forward lines.",
    dataReasoning: "France's superior speed in transition and recent squad depth give them a strong statistical edge over Argentina's transitional lineup."
  },
  "wc2026-germany-spain": {
    matchId: "wc2026-germany-spain",
    teamA: "Germany",
    teamB: "Spain",
    competition: "FIFA World Cup 2026",
    stage: "Group Stage",
    date: "2026-06-11",
    venue: "SoFi Stadium",
    predictedScore: "Germany 2–2 Spain",
    probabilities: { teamAWin: 35, draw: 33, teamBWin: 32 },
    confidence: "Medium",
    historicalSummary: "Two European giants with contrasting styles. Germany's direct counter-pressing versus Spain's high-possession tiki-taka control.",
    dataReasoning: "A highly balanced matchup. Possession metrics favor Spain, while physical dominance and home-continent proximity favor Germany, pointing strongly to a draw."
  }
};

const OLYMPUS_FALLBACK_TEMPLATES = {
  divineVerdict: [
    "Nike's gaze flickers over the pitch, where {teamA} and {teamB} clash. The stars align closely, indicating that {winner} shall find the golden paths to victory, leaving the adversary in shadows.",
    "Ares rattles his shield above the arena. Though {teamA} fights with the strength of lions, the swift spears of {teamB} will strike like lightning at the turning of the tide.",
    "Hermes stands balanced between the hosts. Neither side holds the supreme favor of the heavens; they shall match goal for goal, and the scales of battle will remain in perfect equilibrium."
  ],
  olympianOmen: [
    "Athena whispers of tactical structure in the midfield, but Poseidon warns that the defense of {loser} may flood under pressure.",
    "Apollo shines upon the frontline of {winner}, predicting that three key chances will test the keeper's shield.",
    "Zeus casts a shadow of storm over the pitch; the midfield struggle will be harsh, and a single card of crimson may shift the balance."
  ],
  whyTheMirrorSeesThis: [
    "The statistical mirror reflects the deep tournament legacy and defensive structures of {winner}. They possess the stamina of Heracles in the final minutes.",
    "The mirror shows a clash of elements: the fire of {teamA}'s attack meets the deep water of {teamB}'s defense, pointing to a dramatic finish."
  ]
};

let currentMatchId = null;

// How many days a finished match stays on the landing list before it is hidden.
const OLYMPUS_MATCH_RETENTION_DAYS = 7;

// Status is derived from the match date in the visitor's local time, so the
// list updates by itself — no manual edits needed when a match is played.
function deriveMatchStatus(dateStr) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  if (dateStr === today) return "today";
  return dateStr < today ? "completed" : "upcoming";
}

function isMatchExpired(dateStr) {
  const matchEnd = new Date(`${dateStr}T23:59:59`).getTime();
  if (!Number.isFinite(matchEnd)) return false;
  return Date.now() - matchEnd > OLYMPUS_MATCH_RETENTION_DAYS * 24 * 60 * 60 * 1000;
}

function getLocalMysticalProphecy(match) {
  const winner = match.probabilities.teamAWin > match.probabilities.teamBWin ? match.teamA : match.teamB;
  const loser = match.probabilities.teamAWin > match.probabilities.teamBWin ? match.teamB : match.teamA;
  const isDrawFavored = Math.abs(match.probabilities.teamAWin - match.probabilities.teamBWin) <= 5 || match.probabilities.draw > 30;

  let verdictTpl = "";
  if (isDrawFavored) {
    verdictTpl = OLYMPUS_FALLBACK_TEMPLATES.divineVerdict[2];
  } else if (winner === match.teamA) {
    verdictTpl = OLYMPUS_FALLBACK_TEMPLATES.divineVerdict[0];
  } else {
    verdictTpl = OLYMPUS_FALLBACK_TEMPLATES.divineVerdict[1];
  }

  const omenTpl = OLYMPUS_FALLBACK_TEMPLATES.olympianOmen[Math.floor(Math.random() * OLYMPUS_FALLBACK_TEMPLATES.olympianOmen.length)];
  const whyTpl = OLYMPUS_FALLBACK_TEMPLATES.whyTheMirrorSeesThis[Math.floor(Math.random() * OLYMPUS_FALLBACK_TEMPLATES.whyTheMirrorSeesThis.length)];

  const replacePlaceholders = (text) => {
    return text
      .replace(/{teamA}/g, match.teamA)
      .replace(/{teamB}/g, match.teamB)
      .replace(/{winner}/g, winner)
      .replace(/{loser}/g, loser);
  };

  return {
    persona: "Pythia Nikephoros",
    title: "Oracle of Olympus",
    divineVerdict: replacePlaceholders(verdictTpl),
    predictedScore: match.predictedScore,
    mostLikelyOutcome: isDrawFavored ? "Draw" : `${winner} win`,
    confidence: match.confidence,
    whyTheMirrorSeesThis: replacePlaceholders(whyTpl),
    olympianOmen: replacePlaceholders(omenTpl),
    mortalWarning: "The clouds over Olympus are temporarily silent, but the statistical mirror still speaks.",
    disclaimer: "Oracle Mirror sports predictions are mystical entertainment powered by historical patterns and public football data. They are not betting advice, financial advice, or guaranteed outcomes."
  };
}

function getTeamFlagCode(teamName) {
  const codes = {
    "Netherlands": "nl",
    "Japan": "jp",
    "Argentina": "ar",
    "France": "fr",
    "Germany": "de",
    "Spain": "es"
  };
  return codes[teamName] || "un";
}

function getTeamFlagHtml(teamName, sizeClass = "small") {
  const code = getTeamFlagCode(teamName);
  const size = sizeClass === "large" ? 80 : 40;
  return `<img src="https://flagcdn.com/w${size}/${code}.png" class="flag-img flag-${sizeClass}" alt="${teamName} flag" onerror="this.src='https://flagcdn.com/w${size}/un.png'" />`;
}

function showMatchList() {
  const landing = document.getElementById("olympus-landing-view");
  const detail = document.getElementById("olympus-detail-view");
  if (landing) landing.style.display = "flex";
  if (detail) detail.style.display = "none";
  
  const container = document.getElementById("olympus-match-list");
  if (!container) return;
  
  const visibleMatches = Object.values(OLYMPUS_MATCHES_JS).filter(match => !isMatchExpired(match.date));

  if (visibleMatches.length === 0) {
    container.innerHTML = `
      <p class="olympus-empty-state" style="text-align:center; font-style:italic; color: var(--gold-light, #d4af37); padding: 2rem 1rem;">
        The arena lies silent — Pythia Nikephoros awaits the next contests. New prophecies will appear here soon.
      </p>`;
    return;
  }

  container.innerHTML = visibleMatches.map(match => {
    const status = deriveMatchStatus(match.date);
    const statusLabel = status === "completed"
      ? '<span class="match-status status-completed">Completed</span>'
      : (status === "today" ? '<span class="match-status status-today">Today</span>' : '<span class="match-status status-upcoming">Upcoming</span>');

    return `
      <div class="match-card" data-match-id="${match.matchId}">
        <div class="match-card-header">
          <span class="match-comp">${match.competition} — ${match.stage}</span>
          ${statusLabel}
        </div>
        <div class="match-teams-layout">
          <div class="match-team-box team-a-box" style="--flag-url: url('https://flagcdn.com/w160/${getTeamFlagCode(match.teamA)}.png')">
            <span class="match-team-name">${match.teamA}</span>
            ${getTeamFlagHtml(match.teamA, "small")}
          </div>
          <div class="match-vs-coin">
            <span>VS</span>
          </div>
          <div class="match-team-box team-b-box" style="--flag-url: url('https://flagcdn.com/w160/${getTeamFlagCode(match.teamB)}.png')">
            ${getTeamFlagHtml(match.teamB, "small")}
            <span class="match-team-name">${match.teamB}</span>
          </div>
        </div>
        <div class="match-meta-info">
          <span>📅 ${match.date}</span>
          <span>📍 ${match.venue}</span>
        </div>
        <div class="match-prediction-preview">
          <div class="predicted-score-preview">Score: <strong>${match.predictedScore}</strong></div>
          <div class="outcome-confidence">Confidence: <span class="conf-badge conf-${match.confidence.toLowerCase()}">${match.confidence}</span></div>
        </div>
        <p class="entertainment-disclaimer mini-disclaimer">
          Oracle Mirror sports predictions are mystical entertainment. They are not betting advice or guaranteed outcomes.
        </p>
      </div>
    `;
  }).join("");
  
  container.querySelectorAll(".match-card").forEach(card => {
    card.addEventListener("click", () => {
      const matchId = card.dataset.matchId;
      showPage("olympus", { matchId });
      showMatchDetail(matchId);
    });
  });
}

function showMatchDetail(matchId) {
  currentMatchId = matchId;
  const match = OLYMPUS_MATCHES_JS[matchId];
  if (!match) return;
  
  const landing = document.getElementById("olympus-landing-view");
  const detail = document.getElementById("olympus-detail-view");
  if (landing) landing.style.display = "none";
  if (detail) detail.style.display = "flex";
  
  const detailCard = document.getElementById("olympus-detail-card");
  if (!detailCard) return;

  const totalProb = match.probabilities.teamAWin + match.probabilities.draw + match.probabilities.teamBWin;
  const teamAWinPct = Math.round((match.probabilities.teamAWin / totalProb) * 100);
  const drawPct = Math.round((match.probabilities.draw / totalProb) * 100);
  const teamBWinPct = Math.round((match.probabilities.teamBWin / totalProb) * 100);
  
  detailCard.innerHTML = `
    <div class="match-detail-main">
      <div class="match-detail-header">
        <span class="match-comp">${match.competition} — ${match.stage}</span>
        <span class="match-venue-date">📅 ${match.date} | 📍 ${match.venue}</span>
      </div>
      <div class="match-teams-large-layout">
        <div class="match-team-box-lg team-a-box-lg" style="--flag-url: url('https://flagcdn.com/w320/${getTeamFlagCode(match.teamA)}.png')">
          <div class="flag-wrapper-lg">
            ${getTeamFlagHtml(match.teamA, "large")}
          </div>
          <span class="match-team-name-lg">${match.teamA}</span>
        </div>
        
        <div class="match-vs-coin-lg">
          <span>VS</span>
        </div>
        
        <div class="match-team-box-lg team-b-box-lg" style="--flag-url: url('https://flagcdn.com/w320/${getTeamFlagCode(match.teamB)}.png')">
          <div class="flag-wrapper-lg">
            ${getTeamFlagHtml(match.teamB, "large")}
          </div>
          <span class="match-team-name-lg">${match.teamB}</span>
        </div>
      </div>
      
      <div class="deterministic-prediction-block">
        <h3>Statistical Prediction</h3>
        <div class="predicted-score-large">${match.predictedScore}</div>
        
        <div class="probabilities-gauge">
          <div class="gauge-bar">
            <div class="gauge-fill fill-team-a" style="width: ${teamAWinPct}%;" title="${match.teamA} Win: ${teamAWinPct}%"></div>
            <div class="gauge-fill fill-draw" style="width: ${drawPct}%;" title="Draw: ${drawPct}%"></div>
            <div class="gauge-fill fill-team-b" style="width: ${teamBWinPct}%;" title="${match.teamB} Win: ${teamBWinPct}%"></div>
          </div>
          <div class="gauge-labels">
            <span class="gauge-lbl-team-a">${match.teamA}: ${teamAWinPct}%</span>
            <span class="gauge-lbl-draw">Draw: ${drawPct}%</span>
            <span class="gauge-lbl-team-b">${match.teamB}: ${teamBWinPct}%</span>
          </div>
        </div>

        <div class="match-meta-grid">
          <div class="meta-item">
            <strong>Confidence</strong>
            <span class="conf-badge conf-${match.confidence.toLowerCase()}">${match.confidence}</span>
          </div>
          <div class="meta-item">
            <strong>Most Likely Outcome</strong>
            <span>${teamAWinPct > teamBWinPct ? match.teamA + ' Win' : match.teamB + ' Win'}</span>
          </div>
        </div>

        <div class="reasoning-text">
          <strong>Statistical Reasoning:</strong>
          <p>${match.dataReasoning}</p>
        </div>

        <div class="history-summary-text">
          <strong>Historical Summary:</strong>
          <p>${match.historicalSummary}</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("olympus-response-container").style.display = "none";
  document.getElementById("btn-summon-oracle").style.display = "inline-block";
  document.getElementById("olympus-loading").style.display = "none";
}

async function summonOracle() {
  const match = OLYMPUS_MATCHES_JS[currentMatchId];
  if (!match) return;

  const btn = document.getElementById("btn-summon-oracle");
  const loading = document.getElementById("olympus-loading");
  const container = document.getElementById("olympus-response-container");
  const output = document.querySelector('[data-output="olympus"]');

  if (btn) btn.style.display = "none";
  if (loading) loading.style.display = "block";
  if (container) container.style.display = "none";
  setReadingState(true);

  trackEvent("question_submitted", {
    realm: "olympus",
    question_length: match.matchId.length,
  });
  trackEvent("reading_started", { realm: "olympus" });

  let prophecyData = null;

  try {
    const data = await callAPI("/api/oracle-of-olympus/predict", match);
    if (data.error) {
      throw new Error(data.error);
    }
    prophecyData = data;
  } catch (err) {
    console.warn("API prediction failed, falling back to local templates:", err);
    prophecyData = getLocalMysticalProphecy(match);
  }

  if (output) {
    output.innerHTML = `
      <div class="oracle-scroll-wrapper">
        <div class="oracle-scroll-title">Pythia Nikephoros Speaks</div>
        
        <div class="prophecy-section divine-verdict-section">
          <h4>⚡ Divine Verdict</h4>
          <p class="prophecy-text">"${prophecyData.divineVerdict}"</p>
        </div>

        <div class="prophecy-two-column">
          <div class="prophecy-section">
            <h4>🕊️ Olympian Omen</h4>
            <p class="prophecy-text">${prophecyData.olympianOmen}</p>
          </div>
          <div class="prophecy-section">
            <h4>🌟 Why the Mirror Sees This</h4>
            <p class="prophecy-text">${prophecyData.whyTheMirrorSeesThis}</p>
          </div>
        </div>

        <div class="prophecy-meta-row">
          <div><strong>Outcome:</strong> ${prophecyData.mostLikelyOutcome}</div>
          <div><strong>Predicted Score:</strong> ${prophecyData.predictedScore}</div>
          <div><strong>Confidence:</strong> ${prophecyData.confidence}</div>
        </div>

        <div class="prophecy-warning-block">
          <p>⚠️ <strong>Mortal Warning:</strong> ${prophecyData.mortalWarning}</p>
        </div>

        <p class="entertainment-disclaimer prophecy-disclaimer">
          ${prophecyData.disclaimer}
        </p>
      </div>
      
      <div class="prophecy-actions">
        <button class="btn-gold btn-small" id="btn-save-olympus-archive">Save Prophecy to Archive</button>
      </div>
    `;
  }

  if (loading) loading.style.display = "none";
  if (container) container.style.display = "block";
  setReadingState(false);

  const saveBtn = document.getElementById("btn-save-olympus-archive");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const archiveText = `[Oracle of Olympus Prophecy] Verdict: ${prophecyData.divineVerdict}\n\nOutcome: ${prophecyData.mostLikelyOutcome}\nOmen: ${prophecyData.olympianOmen}\n\n${prophecyData.disclaimer}`;
      saveToArchive("olympus", `${match.teamA} vs ${match.teamB} Prediction`, archiveText, {
        matchId: match.matchId,
        predictedScore: prophecyData.predictedScore
      });
      saveBtn.disabled = true;
      saveBtn.textContent = "Saved to Archive";
      saveBtn.style.opacity = "0.6";
    });
  }

  // Optimize Adsterra Ad placements:
  const adSlot = createResultAdSlot("olympus");
  adSlot.classList.add("result-aftercare");
  if (output) output.appendChild(adSlot);
  registerAdSlots(adSlot);
  activateSlotsForScreen("result", "olympus");
}

// --- Boot ---
initAdSystem();
syncFortuneQuestionnaire();

// Olympus events wireup
document.getElementById("btn-summon-oracle")?.addEventListener("click", summonOracle);
document.getElementById("btn-back-to-matches")?.addEventListener("click", () => {
  showPage("olympus");
  showMatchList();
});

const initialRoute = getRouteState();
showPage(initialRoute.pageId, {
  push: false,
  isResult: initialRoute.isResult,
  scroll: false,
  emitTracking: false,
  matchId: initialRoute.matchId,
});

if (initialRoute.pageId === "olympus") {
  if (initialRoute.matchId) {
    showMatchDetail(initialRoute.matchId);
  } else {
    showMatchList();
  }
}

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

// =========================================================
// TAROT FULL SESSION (Interactive Fan Deck Drawing)
// =========================================================
const TAROT_MAJOR_ARCANA = [
  "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor",
  "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit",
  "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance",
  "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
];

const TAROT_SYMBOLS = {
  "The Fool": "🃏", "The Magician": "⚡", "The High Priestess": "🌙",
  "The Empress": "🌸", "The Emperor": "👑", "The Hierophant": "📿",
  "The Lovers": "❤️", "The Chariot": "⚔️", "Strength": "🦁",
  "The Hermit": "🏔️", "Wheel of Fortune": "🌀", "Justice": "⚖️",
  "The Hanged Man": "🔮", "Death": "💀", "Temperance": "☯",
  "The Devil": "😈", "The Tower": "🗼", "The Star": "⭐",
  "The Moon": "🌕", "The Sun": "☀️", "Judgement": "📯", "The World": "🌍",
};

(function initTarotSession() {
  const fanDeck = document.getElementById("tarot-fan-deck");
  const sessionHint = document.getElementById("tarot-session-hint");
  const formSection = document.getElementById("tarot-form-section");
  const mistsOverlay = document.getElementById("tarot-mists-overlay");
  const questionInput = document.getElementById("tarot-question-input");
  const submitBtn = document.getElementById("btn-tarot-submit");
  if (!fanDeck) return;

  const shuffled = [...TAROT_MAJOR_ARCANA].sort(() => Math.random() - 0.5);
  let drawnCount = 0;
  const drawnCards = [];

  // Build fan of face-down cards
  shuffled.forEach((cardName, i) => {
    const card = document.createElement("div");
    card.className = "fan-card";
    card.style.setProperty("--fan-index", i);
    card.style.setProperty("--fan-total", shuffled.length);
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front"><div class="gold-seal">&#127183;</div></div>
        <div class="card-back">
          <span class="card-art">${TAROT_SYMBOLS[cardName] || "✨"}</span>
          <span class="card-name">${cardName}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => {
      if (drawnCount >= 3 || card.classList.contains("drawn")) return;
      drawnCount++;
      drawnCards.push(cardName);
      card.classList.add("drawn", "flipped");

      // Update the spread slot
      const slot = document.getElementById(`tarot-slot-${drawnCount}`);
      if (slot) {
        const backName = slot.querySelector(".card-name");
        const backArt = slot.querySelector(".card-art");
        if (backName) backName.textContent = cardName;
        if (backArt) backArt.innerHTML = TAROT_SYMBOLS[cardName] || "✨";
        slot.classList.add("flipped");
        const rect = slot.getBoundingClientRect();
        window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      }

      // Store in hidden inputs
      const hiddenInput = document.getElementById(`tarot-card-input-${drawnCount}`);
      if (hiddenInput) hiddenInput.value = cardName;

      const labels = ["Past", "Present", "Future"];
      if (sessionHint) {
        if (drawnCount < 3) {
          sessionHint.textContent = `✨ Card ${drawnCount} drawn: ${cardName}. Draw your ${labels[drawnCount]} card... ✨`;
        } else {
          sessionHint.innerHTML = `✨ All three cards drawn! The spread is complete. Ask your question below... ✨`;
        }
      }

      // Unlock form after 3 cards
      if (drawnCount === 3 && formSection) {
        formSection.classList.remove("locked");
        formSection.classList.add("unlocked");
        if (mistsOverlay) mistsOverlay.style.display = "none";
        if (questionInput) questionInput.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        questionInput?.focus();
        trackEvent("tarot_deck_complete", { cards: drawnCards.join(", ") });
      }
    });
    fanDeck.appendChild(card);
  });

  // Tarot submit handler
  submitBtn?.addEventListener("click", async () => {
    const question = questionInput?.value?.trim();
    if (!question) {
      setOutput("tarot", "Please enter your question for the cards.");
      return;
    }
    if (drawnCards.length < 3) {
      setOutput("tarot", "Please draw three cards from the deck first.");
      return;
    }

    setOutput("tarot", getLoadingMessage("tarot"), true);
    submitBtn.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", { realm: "tarot", question_length: question.length });
    trackEvent("reading_started", { realm: "tarot" });

    try {
      const data = await callAPI("/api/tarot", { question, cards: drawnCards });
      const answer = extractResponse(data);
      const labels = ["Past", "Present", "Future"];
      const cardsHTML = drawnCards
        .map((c, i) => `<span class="drawn-card">${labels[i]}: ${escapeHTML(c)}</span>`)
        .join("");
      setOutputHTML("tarot", `<div class="cards-drawn">${cardsHTML}</div><div class="reading-body">${formatResponse(answer)}</div>`);
      saveToArchive("tarot", `${question} [${drawnCards.join(", ")}]`, answer);
      markResultRendered("tarot", answer);
    } catch {
      setOutput("tarot", "The cards are silent. Please try again later.");
    }
    setReadingState(false);
    submitBtn.disabled = false;
  });
})();

// =========================================================
// BIRTH CHART (Astrological Natal Chart)
// =========================================================
(function initBirthChart() {
  const planetNodes = document.querySelectorAll(".planet-node");
  const planetDisplay = document.getElementById("birthchart-planet-display");
  const btnBirthChart = document.getElementById("btn-birthchart");
  if (!btnBirthChart) return;

  const PLANET_INFO = {
    Sun: { sign: "Leo", symbol: "☀️", desc: "Your core identity, ego, and vital force" },
    Moon: { sign: "Cancer", symbol: "🌙", desc: "Your emotional nature, instincts, and inner self" },
    Ascendant: { sign: "Libra", symbol: "⬆️", desc: "Your outward personality and first impression" },
    Mercury: { sign: "Virgo", symbol: "☿", desc: "Your communication style and intellectual approach" },
    Venus: { sign: "Taurus", symbol: "♀️", desc: "Your love language, beauty, and values" },
    Mars: { sign: "Aries", symbol: "♂️", desc: "Your drive, ambition, and energy" },
  };

  // Deterministic sign assignment based on birthday
  const SIGNS_ORDER = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];

  function computePlacements(birthday) {
    const dateStr = birthday.replace(/\D/g, "");
    let hash = 0;
    for (let i = 0; i < dateStr.length; i++) {
      hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return {
      sun: SIGNS_ORDER[Math.abs(hash) % 12],
      moon: SIGNS_ORDER[Math.abs(hash * 7 + 3) % 12],
      ascendant: SIGNS_ORDER[Math.abs(hash * 13 + 5) % 12],
      mercury: SIGNS_ORDER[Math.abs(hash * 17 + 7) % 12],
      venus: SIGNS_ORDER[Math.abs(hash * 23 + 11) % 12],
      mars: SIGNS_ORDER[Math.abs(hash * 31 + 13) % 12],
    };
  }

  // Planet node click interactivity
  planetNodes.forEach((node) => {
    node.addEventListener("click", () => {
      planetNodes.forEach((n) => n.classList.remove("active"));
      node.classList.add("active");
      const planet = node.dataset.planet;
      const info = PLANET_INFO[planet];
      if (planetDisplay && info) {
        planetDisplay.innerHTML = `
          <h4>${info.symbol} ${planet} — Ruler of ${info.sign}</h4>
          <p>${info.desc}</p>
          <p class="planet-detail-hint">Fill in your details below for a personalized reading.</p>
        `;
      }
      const rect = node.getBoundingClientRect();
      window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
      trackEvent("birthchart_planet_click", { planet });
    });
  });

  // Birth chart form submission
  btnBirthChart.addEventListener("click", async () => {
    const birthday = document.getElementById("birthchart-date")?.value;
    const birthtime = document.getElementById("birthchart-time")?.value || "";
    const sign = document.getElementById("birthchart-sign")?.value;

    if (!birthday || !sign) {
      setOutput("birthchart", "Please enter your date of birth and select your sun sign.");
      return;
    }

    const placements = computePlacements(birthday);

    setOutput("birthchart", getLoadingMessage("birthchart"), true);
    btnBirthChart.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", { realm: "birthchart", selection: sign });
    trackEvent("reading_started", { realm: "birthchart" });

    try {
      const data = await callAPI("/api/birthchart", {
        birthday,
        birthtime,
        sign,
        placements,
      });
      const answer = extractResponse(data);

      // Update planet display with computed placements
      if (planetDisplay) {
        const placementHTML = Object.entries(placements)
          .map(([planet, signName]) => `<span class="placement-tag">${planet}: ${signName}</span>`)
          .join("");
        planetDisplay.innerHTML = `
          <h4>🌌 Your Natal Placements</h4>
          <div class="placements-grid">${placementHTML}</div>
        `;
      }

      // Highlight all planet nodes
      planetNodes.forEach((n) => n.classList.add("active"));

      setOutputHTML("birthchart", formatResponse(answer));
      saveToArchive("birthchart", `Born ${birthday} (${sign})`, answer);
      markResultRendered("birthchart", answer);

      // Particle burst on the wheel
      const wheel = document.getElementById("birthchart-svg-wheel");
      if (wheel) {
        const rect = wheel.getBoundingClientRect();
        window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40);
      }
    } catch {
      setOutput("birthchart", "The stars are veiled. Please try again later.");
    }
    setReadingState(false);
    btnBirthChart.disabled = false;
  });
})();

// =========================================================
// PALMISTRY (Psychic Palm Reading)
// =========================================================
(function initPalmistry() {
  const btnPalmistry = document.getElementById("btn-palmistry");
  const palmLines = document.querySelectorAll(".palm-line");
  const lineDisplay = document.getElementById("palmistry-line-display");
  if (!btnPalmistry) return;

  const LINE_INFO = {
    "palm-line-heart": { name: "Heart Line", color: "rose", desc: "Governs emotions, romantic nature, and emotional stability" },
    "palm-line-head": { name: "Head Line", color: "violet", desc: "Governs intellect, creativity, and mental approach" },
    "palm-line-life": { name: "Life Line", color: "gold", desc: "Governs vitality, life force, and physical wellbeing" },
    "palm-line-fate": { name: "Fate Line", color: "blue", desc: "Governs destiny, career path, and life direction" },
  };

  // Palm line click interactivity
  palmLines.forEach((line) => {
    line.addEventListener("click", () => {
      palmLines.forEach((l) => l.classList.remove("active"));
      line.classList.add("active");
      const info = LINE_INFO[line.id];
      if (lineDisplay && info) {
        lineDisplay.innerHTML = `
          <h4>✋ ${info.name}</h4>
          <p>${info.desc}</p>
          <p class="planet-detail-hint">Configure your line readings below for Cassandra's prophecy.</p>
        `;
      }
      trackEvent("palmistry_line_click", { line: info?.name });
    });

    // Hover highlighting
    line.addEventListener("mouseenter", () => line.classList.add("hover"));
    line.addEventListener("mouseleave", () => line.classList.remove("hover"));
  });

  // Palmistry form submission
  btnPalmistry.addEventListener("click", async () => {
    const handShape = document.getElementById("palmistry-shape")?.value;
    const heart = document.getElementById("palmistry-heart")?.value;
    const head = document.getElementById("palmistry-head")?.value;
    const life = document.getElementById("palmistry-life")?.value;
    const fate = document.getElementById("palmistry-fate")?.value;

    if (!handShape) {
      setOutput("palmistry", "Please select your hand shape.");
      return;
    }

    setOutput("palmistry", getLoadingMessage("palmistry"), true);
    btnPalmistry.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", { realm: "palmistry", hand_shape: handShape });
    trackEvent("reading_started", { realm: "palmistry" });

    try {
      const data = await callAPI("/api/palmistry", {
        handShape,
        lines: { heart, head, life, fate },
      });
      const answer = extractResponse(data);

      // Highlight all lines
      palmLines.forEach((l) => l.classList.add("active"));

      setOutputHTML("palmistry", formatResponse(answer));
      saveToArchive("palmistry", `${handShape}`, answer);
      markResultRendered("palmistry", answer);

      // Particle burst on the hand
      const handSvg = document.getElementById("palmistry-hand-svg");
      if (handSvg) {
        const rect = handSvg.getBoundingClientRect();
        window.spawnParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 35);
      }
    } catch {
      setOutput("palmistry", "The palm lines fade. Please try again later.");
    }
    setReadingState(false);
    btnPalmistry.disabled = false;
  });
})();

// =========================================================
// I CHING COIN TOSS ORACLE
// =========================================================
(function initIChing() {
  const btnToss = document.getElementById("btn-iching-toss");
  const tossHint = document.getElementById("iching-toss-hint");
  const hexTitleDisplay = document.getElementById("hexagram-title-display");
  const formSection = document.getElementById("iching-form-section");
  const mistsOverlay = document.getElementById("iching-mists-overlay");
  const questionInput = document.getElementById("iching-question-input");
  const submitBtn = document.getElementById("btn-iching-submit");
  const hexTitleInput = document.getElementById("iching-hexagram-title");
  const hexLinesInput = document.getElementById("iching-hexagram-lines");
  const coins = [
    document.getElementById("iching-coin-1"),
    document.getElementById("iching-coin-2"),
    document.getElementById("iching-coin-3"),
  ];
  if (!btnToss) return;

  // I Ching hexagram lookup table (simplified — 64 hexagrams)
  const HEXAGRAM_NAMES = [
    "Ch'ien (The Creative)", "K'un (The Receptive)", "Chun (Difficulty at the Beginning)",
    "Mêng (Youthful Folly)", "Hsü (Waiting)", "Sung (Conflict)",
    "Shih (The Army)", "Pi (Holding Together)", "Hsiao Ch'u (Small Taming)",
    "Lü (Treading)", "T'ai (Peace)", "P'i (Standstill)",
    "T'ung Jên (Fellowship)", "Ta Yu (Great Possession)", "Ch'ien (Modesty)",
    "Yü (Enthusiasm)", "Sui (Following)", "Ku (Work on the Decayed)",
    "Lin (Approach)", "Kuan (Contemplation)", "Shih Ho (Biting Through)",
    "Pi (Grace)", "Po (Splitting Apart)", "Fu (Return)",
    "Wu Wang (Innocence)", "Ta Ch'u (Great Taming)", "I (Nourishment)",
    "Ta Kuo (Great Exceeding)", "K'an (The Abysmal)", "Li (The Clinging Fire)",
    "Hsien (Influence)", "Hêng (Duration)", "Tun (Retreat)",
    "Ta Chuang (Great Power)", "Chin (Progress)", "Ming I (Darkening of the Light)",
    "Chia Jên (The Family)", "K'uei (Opposition)", "Chien (Obstruction)",
    "Hsieh (Deliverance)", "Sun (Decrease)", "I (Increase)",
    "Kuai (Breakthrough)", "Kou (Coming to Meet)", "Ts'ui (Gathering Together)",
    "Shêng (Pushing Upward)", "K'un (Oppression)", "Ching (The Well)",
    "Ko (Revolution)", "Ting (The Cauldron)", "Chên (The Arousing Thunder)",
    "Kên (Keeping Still Mountain)", "Chien (Development)", "Kuei Mei (The Marrying Maiden)",
    "Fêng (Abundance)", "Lü (The Wanderer)", "Sun (The Gentle Wind)",
    "Tui (The Joyous Lake)", "Huan (Dispersion)", "Chieh (Limitation)",
    "Chung Fu (Inner Truth)", "Hsiao Kuo (Small Exceeding)",
    "Chi Chi (After Completion)", "Wei Chi (Before Completion)",
  ];

  let tossCount = 0;
  const lineResults = []; // stores yang/yin from bottom (1) to top (6)
  let isTossing = false;

  btnToss.addEventListener("click", () => {
    if (tossCount >= 6 || isTossing) return;
    isTossing = true;
    btnToss.disabled = true;

    // Animate coins
    coins.forEach((coin) => {
      coin.classList.remove("flipped");
      coin.classList.add("tossing");
    });

    setTimeout(() => {
      // Determine each coin: heads (2) or tails (3)
      const results = coins.map(() => (Math.random() > 0.5 ? 2 : 3));
      const sum = results.reduce((a, b) => a + b, 0); // 6, 7, 8, or 9
      const isYang = sum === 7 || sum === 9; // yang = solid, yin = broken

      // Show coin results
      coins.forEach((coin, i) => {
        coin.classList.remove("tossing");
        if (results[i] === 3) {
          coin.classList.add("flipped");
        }
      });

      tossCount++;
      lineResults.push(isYang ? "yang" : "yin");

      // Update hexagram stack (build from bottom)
      const lineEl = document.getElementById(`hexagram-line-${tossCount}`);
      if (lineEl) {
        lineEl.classList.add(isYang ? "yang" : "yin", "revealed");
      }

      // Update hint
      if (tossHint) {
        if (tossCount < 6) {
          tossHint.textContent = `Toss ${tossCount} complete (${isYang ? "Yang ━━━" : "Yin ━ ━"}). Click to make Toss ${tossCount + 1}...`;
        } else {
          tossHint.textContent = "✨ The hexagram is complete! Enter your dilemma below...";
        }
      }

      // Update hexagram title area
      if (hexTitleDisplay) {
        hexTitleDisplay.innerHTML = `
          <h4>${tossCount < 6 ? "Hexagram building..." : "✨ Hexagram Complete ✨"}</h4>
          <p>Tosses remaining: ${6 - tossCount}</p>
        `;
      }

      // Particle burst
      const deckRect = document.querySelector(".iching-coins-deck")?.getBoundingClientRect();
      if (deckRect) {
        window.spawnParticleBurst(deckRect.left + deckRect.width / 2, deckRect.top + deckRect.height / 2, 20);
      }

      // Unlock form after 6 tosses
      if (tossCount === 6) {
        const hexIndex = lineResults.reduce((acc, line, i) => acc + (line === "yang" ? (1 << i) : 0), 0) % 64;
        const hexTitle = HEXAGRAM_NAMES[hexIndex] || "Unknown Hexagram";
        const hexLinesStr = lineResults.map((l) => (l === "yang" ? "━━━" : "━ ━")).join(" / ");

        if (hexTitleInput) hexTitleInput.value = hexTitle;
        if (hexLinesInput) hexLinesInput.value = hexLinesStr;

        if (hexTitleDisplay) {
          hexTitleDisplay.innerHTML = `<h4>✨ ${hexTitle} ✨</h4><p>${hexLinesStr}</p>`;
        }

        if (formSection) {
          formSection.classList.remove("locked");
          formSection.classList.add("unlocked");
        }
        if (mistsOverlay) mistsOverlay.style.display = "none";
        if (questionInput) questionInput.disabled = false;
        if (submitBtn) submitBtn.disabled = false;
        questionInput?.focus();

        trackEvent("iching_hexagram_complete", { hexagram: hexTitle });
      }

      isTossing = false;
      btnToss.disabled = tossCount >= 6;
    }, 800);
  });

  // I Ching submit handler
  submitBtn?.addEventListener("click", async () => {
    const question = questionInput?.value?.trim();
    const hexagramTitle = hexTitleInput?.value;
    const hexagramLines = hexLinesInput?.value;

    if (!question) {
      setOutput("iching", "Please describe your dilemma for Sage Lao-Tan.");
      return;
    }
    if (!hexagramTitle) {
      setOutput("iching", "Please complete the coin toss ritual first.");
      return;
    }

    setOutput("iching", getLoadingMessage("iching"), true);
    submitBtn.disabled = true;
    setReadingState(true);
    trackEvent("question_submitted", { realm: "iching", question_length: question.length });
    trackEvent("reading_started", { realm: "iching" });

    try {
      const data = await callAPI("/api/iching", {
        question,
        hexagramTitle,
        hexagramLines,
      });
      const answer = extractResponse(data);

      setOutputHTML("iching", `
        <div class="iching-result-header">
          <span class="hexagram-badge">☯ ${escapeHTML(hexagramTitle)}</span>
        </div>
        <div>${escapeHTML(answer)}</div>
      `);
      saveToArchive("iching", `${question} [${hexagramTitle}]`, answer);
      markResultRendered("iching", answer);

      // Big particle burst
      const arenaRect = document.querySelector(".iching-arena")?.getBoundingClientRect();
      if (arenaRect) {
        window.spawnParticleBurst(arenaRect.left + arenaRect.width / 2, arenaRect.top + arenaRect.height / 2, 50);
      }
    } catch {
      setOutput("iching", "The coins are silent. Please try again later.");
    }
    setReadingState(false);
    submitBtn.disabled = false;
  });
})();
