// Oracle Mirror — Client-side application

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

// --- Navigation ---
const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link[data-nav], .dropdown-item[data-nav]");
const navLinksContainer = document.getElementById("nav-links");
const hamburger = document.getElementById("nav-hamburger");

function showPage(pageId) {
  for (const p of pages) {
    p.classList.remove("active");
  }
  const target = document.getElementById(`page-${pageId}`);
  if (target) {
    target.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Update active nav link
  for (const link of document.querySelectorAll(".nav-link[data-nav]")) {
    link.classList.toggle("active", link.dataset.nav === pageId);
  }

  // Close mobile menu
  navLinksContainer?.classList.remove("open");
}

function goHome() {
  showPage("home");
}

document.getElementById("nav-home")?.addEventListener("click", (e) => {
  e.preventDefault();
  goHome();
});

// Nav links (header + dropdown + any data-nav buttons)
for (const link of document.querySelectorAll("[data-nav]")) {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.nav;
    if (target) showPage(target);
  });
}

// Realm cards
for (const card of document.querySelectorAll(".card[data-realm]")) {
  card.addEventListener("click", (e) => {
    e.preventDefault();
    const realm = card.dataset.realm;
    showPage(realm);
  });
}

// Back buttons
for (const btn of document.querySelectorAll("[data-back]")) {
  btn.addEventListener("click", goHome);
}

// Hamburger menu
hamburger?.addEventListener("click", () => {
  navLinksContainer?.classList.toggle("open");
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

let conversationHistory = [];
let chatBusy = false;

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

  const text = chatInput.value.trim();
  if (!text) return;

  chatBusy = true;
  chatInput.value = "";
  chatSend.disabled = true;

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
    saveToArchive("chat", text, response);
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

  chatBusy = false;
  chatSend.disabled = false;
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
      "Ahhhh... a new soul approaches the crystal ball. I am Madame Fortuna, and the mists have been expecting you. What question burns within your heart, dear seeker?"
    );
    chatMessages.appendChild(greeting);
    conversationHistory.push({
      role: "assistant",
      content:
        "Ahhhh... a new soul approaches the crystal ball. I am Madame Fortuna, and the mists have been expecting you. What question burns within your heart, dear seeker?",
    });
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
    } catch {
      setOutput(realm, "The spirits are silent. Please try again later.");
    }
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
    try {
      const data = await callAPI("/api/western-zodiac", {
        sign: selectedSign,
      });
      const answer = extractResponse(data);
      setOutput("western-zodiac", answer);
      saveToArchive("western-zodiac", selectedSign, answer);
    } catch {
      setOutput(
        "western-zodiac",
        "The stars are obscured. Please try again later."
      );
    }
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
  try {
    const data = await callAPI("/api/chinese-zodiac", { year });
    const answer = extractResponse(data);
    setOutput("chinese-zodiac", answer);
    saveToArchive("chinese-zodiac", `Born ${year}`, answer);
  } catch {
    setOutput(
      "chinese-zodiac",
      "The jade pavilion is clouded. Please try again later."
    );
  }
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
  } catch {
    setOutput("love", "The hearts are silent. Please try again later.");
  }
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
    try {
      const data = await callAPI("/api/numerology", { birthday });
      const answer = extractResponse(data);
      if (data.lifePathNumber) {
        const core = document.getElementById("life-path-display");
        if (core) core.textContent = data.lifePathNumber;
      }
      setOutput("numerology", answer);
      saveToArchive("numerology", `Birthday: ${birthday}`, answer);
    } catch {
      setOutput(
        "numerology",
        "The sacred numbers are veiled. Please try again later."
      );
    }
    btn.disabled = false;
  });

// --- Daily Fortune ---
document.getElementById("btn-daily")?.addEventListener("click", async () => {
  const signSelect = document.getElementById("daily-sign");
  const sign = signSelect?.value || "";
  const btn = document.getElementById("btn-daily");

  setOutput("daily-fortune", getLoadingMessage("daily-fortune"), true);
  btn.disabled = true;
  try {
    const body = {};
    if (sign) body.sign = sign;
    const data = await callAPI("/api/daily-fortune", body);
    const answer = extractResponse(data);
    setOutput("daily-fortune", answer);
    saveToArchive("daily-fortune", sign || "General", answer);
  } catch {
    setOutput(
      "daily-fortune",
      "The dawn light is obscured. Please try again later."
    );
  }
  btn.disabled = false;
});

// --- Magic 8 Ball shake animation ---
const magic8Ball = document.getElementById("magic8-ball");
magic8Ball?.addEventListener("click", () => {
  magic8Ball.classList.add("shaking");
  setTimeout(() => magic8Ball.classList.remove("shaking"), 500);
});
