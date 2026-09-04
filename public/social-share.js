import { buildDailyMirror, localDateKey } from "./daily-ritual-core.js";
import {
  SHARE_CARD_HEIGHT,
  SHARE_CARD_WIDTH,
  payloadText,
  safeFileName,
  sanitizeSharePayload,
} from "./share-card-core.js";

const STYLESHEET_ID = "oracle-social-share-styles";
const MODAL_ID = "oracle-share-card-modal";
const SHAREABLE_REALMS = new Set(["tarot", "numerology", "love-match"]);

function track(event, details = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: "Oracle Mirror",
    timestamp: new Date().toISOString(),
    source: "social_share_v1",
    page_path: window.location.pathname,
    ...details,
  });
}

function ensureStylesheet() {
  if (document.getElementById(STYLESHEET_ID)) return;
  const link = document.createElement("link");
  link.id = STYLESHEET_ID;
  link.rel = "stylesheet";
  link.href = "/social-share.css";
  document.head.appendChild(link);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines - 1) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function drawStars(ctx) {
  for (let index = 0; index < 46; index += 1) {
    const x = (index * 197) % SHARE_CARD_WIDTH;
    const y = (index * 313 + 97) % SHARE_CARD_HEIGHT;
    const radius = index % 5 === 0 ? 3 : 1.5;
    ctx.globalAlpha = 0.25 + ((index % 7) / 20);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export async function renderShareCard(rawPayload) {
  const payload = sanitizeSharePayload(rawPayload);
  if (!payload) throw new Error("Unsupported share payload");

  const canvas = document.createElement("canvas");
  canvas.width = SHARE_CARD_WIDTH;
  canvas.height = SHARE_CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");

  const background = ctx.createLinearGradient(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);
  background.addColorStop(0, "#090714");
  background.addColorStop(0.48, "#171027");
  background.addColorStop(1, "#07050d");
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  const glow = ctx.createRadialGradient(540, 670, 60, 540, 670, 680);
  glow.addColorStop(0, "rgba(167,139,250,0.24)");
  glow.addColorStop(0.45, "rgba(212,175,55,0.09)");
  glow.addColorStop(1, "rgba(7,5,13,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, SHARE_CARD_WIDTH, SHARE_CARD_HEIGHT);

  ctx.fillStyle = "#f8e8b1";
  drawStars(ctx);

  ctx.strokeStyle = "rgba(212,175,55,0.72)";
  ctx.lineWidth = 3;
  ctx.strokeRect(54, 54, SHARE_CARD_WIDTH - 108, SHARE_CARD_HEIGHT - 108);
  ctx.strokeStyle = "rgba(212,175,55,0.2)";
  ctx.strokeRect(72, 72, SHARE_CARD_WIDTH - 144, SHARE_CARD_HEIGHT - 144);

  ctx.textAlign = "center";
  ctx.fillStyle = "#d4af37";
  ctx.font = "600 38px Georgia, serif";
  ctx.fillText("ORACLE MIRROR", 540, 172);
  ctx.fillStyle = "rgba(245,243,255,0.72)";
  ctx.font = "500 26px system-ui, sans-serif";
  ctx.fillText(payload.eyebrow, 540, 232);

  ctx.fillStyle = "#f6e8ff";
  ctx.font = "700 190px Georgia, serif";
  ctx.fillText(payload.glyph, 540, 535);

  ctx.fillStyle = "#fff9e8";
  ctx.font = "700 72px Georgia, serif";
  const titleBottom = drawWrappedText(ctx, payload.title, 540, 690, 850, 84, 3);

  ctx.fillStyle = "rgba(244,238,255,0.86)";
  ctx.font = "400 39px Georgia, serif";
  const subtitleBottom = drawWrappedText(ctx, payload.subtitle, 540, titleBottom + 58, 820, 54, 4);

  let lineY = subtitleBottom + 100;
  ctx.font = "600 34px system-ui, sans-serif";
  for (const line of payload.lines) {
    ctx.fillStyle = "rgba(212,175,55,0.95)";
    ctx.fillText("✦", 540, lineY);
    ctx.fillStyle = "rgba(245,243,255,0.9)";
    ctx.font = "500 34px system-ui, sans-serif";
    lineY = drawWrappedText(ctx, line, 540, lineY + 54, 790, 46, 3) + 50;
    ctx.font = "600 34px system-ui, sans-serif";
  }

  ctx.fillStyle = "rgba(255,255,255,0.58)";
  ctx.font = "400 27px system-ui, sans-serif";
  drawWrappedText(ctx, payload.footer, 540, 1665, 810, 38, 3);

  ctx.fillStyle = "#d4af37";
  ctx.font = "600 31px system-ui, sans-serif";
  ctx.fillText("oraclemirror.com", 540, 1780);
  ctx.fillStyle = "rgba(255,255,255,0.48)";
  ctx.font = "400 21px system-ui, sans-serif";
  ctx.fillText("Mystical entertainment · private inputs excluded", 540, 1830);

  return await new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not render PNG")), "image/png", 0.94);
  });
}

function tarotPayload() {
  const output = document.querySelector('[data-output="tarot"]');
  const cards = [...(output?.querySelectorAll(".drawn-card") || [])].map((node) => {
    const text = node.textContent?.trim() || "";
    return text.replace(/^(Past|Present|Future):\s*/i, "");
  }).filter(Boolean);
  return sanitizeSharePayload({ kind: "tarot", cards });
}

function numerologyPayload() {
  const lifePath = document.getElementById("life-path-display")?.textContent?.trim() || "";
  return sanitizeSharePayload({ kind: "numerology", lifePath });
}

function loveMatchPayload() {
  const output = document.querySelector('[data-output="love-match"]');
  const scoreNode = output?.querySelector(".score-num");
  const scoreMatch = scoreNode?.textContent?.match(/\d{1,3}/);
  if (!scoreMatch) return null;
  const score = Number(scoreMatch[0]);
  const tier = output?.querySelector(".love-match-tier")?.textContent?.replace(/💝/g, "").trim() || "";
  return sanitizeSharePayload({ kind: "love-match", score, tier });
}

function dailyPayload() {
  const mirror = buildDailyMirror(localDateKey());
  return sanitizeSharePayload({
    kind: "daily",
    card: mirror.tarot.name,
    glyph: mirror.tarot.glyph,
    theme: mirror.theme,
    moon: mirror.moon.name,
    luckyNumber: mirror.luckyNumber,
    element: mirror.element,
  });
}

function payloadForRealm(realm) {
  if (realm === "tarot") return tarotPayload();
  if (realm === "numerology") return numerologyPayload();
  if (realm === "love-match") return loveMatchPayload();
  if (realm === "daily") return dailyPayload();
  return null;
}

function triggerDownload(blob, payload) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeFileName(payload);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function closeModal() {
  const modal = document.getElementById(MODAL_ID);
  if (!modal) return;
  const previewUrl = modal.dataset.previewUrl;
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  modal.remove();
}

async function nativeShare(blob, payload, realm) {
  const file = new File([blob], safeFileName(payload), { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      title: "Oracle Mirror",
      text: payloadText(payload),
      files: [file],
    });
    track("share_complete", { realm, result_kind: `social_card_${payload.kind}`, state: "native_file" });
    return true;
  }
  if (navigator.share) {
    await navigator.share({ title: "Oracle Mirror", text: payloadText(payload), url: "https://oraclemirror.com/" });
    track("share_complete", { realm, result_kind: `social_card_${payload.kind}`, state: "native_text" });
    return true;
  }
  return false;
}

export async function openShareCard(rawPayload, realm = rawPayload?.kind || "unknown") {
  const payload = sanitizeSharePayload(rawPayload);
  if (!payload) return false;
  ensureStylesheet();
  closeModal();

  const blob = await renderShareCard(payload);
  const previewUrl = URL.createObjectURL(blob);
  const modal = document.createElement("div");
  modal.id = MODAL_ID;
  modal.className = "oracle-share-modal";
  modal.dataset.previewUrl = previewUrl;
  modal.innerHTML = `
    <div class="oracle-share-backdrop" data-share-close></div>
    <section class="oracle-share-dialog" role="dialog" aria-modal="true" aria-labelledby="oracle-share-title">
      <button type="button" class="oracle-share-close" aria-label="Close share card preview" data-share-close>×</button>
      <div class="oracle-share-copy">
        <p class="oracle-share-kicker">Privacy-safe social card</p>
        <h2 id="oracle-share-title">Share your Oracle Mirror</h2>
        <p>Your private question, names and birth date are excluded automatically. The preview only contains the result details shown below.</p>
      </div>
      <div class="oracle-share-preview"><img src="${previewUrl}" alt="Preview of your Oracle Mirror share card"></div>
      <div class="oracle-share-actions">
        <button type="button" class="btn-gold" data-share-native>Share Image</button>
        <button type="button" class="btn-ghost" data-share-save>Save PNG</button>
      </div>
      <p class="oracle-share-status" role="status" aria-live="polite" data-share-status></p>
    </section>`;
  document.body.appendChild(modal);
  document.body.classList.add("oracle-share-open");
  modal.querySelector("[data-share-native]")?.focus();
  track("share_card_open", { realm, result_kind: `social_card_${payload.kind}`, state: "preview" });

  const finishClose = () => {
    document.body.classList.remove("oracle-share-open");
    closeModal();
  };
  modal.querySelectorAll("[data-share-close]").forEach((node) => node.addEventListener("click", finishClose));
  modal.querySelector("[data-share-save]")?.addEventListener("click", () => {
    triggerDownload(blob, payload);
    track("share_complete", { realm, result_kind: `social_card_${payload.kind}`, state: "saved_png" });
    const status = modal.querySelector("[data-share-status]");
    if (status) status.textContent = "PNG ready to post.";
  });
  modal.querySelector("[data-share-native]")?.addEventListener("click", async () => {
    const status = modal.querySelector("[data-share-status]");
    try {
      const shared = await nativeShare(blob, payload, realm);
      if (!shared) {
        triggerDownload(blob, payload);
        if (status) status.textContent = "Direct sharing is unavailable here, so the PNG was saved instead.";
        track("share_complete", { realm, result_kind: `social_card_${payload.kind}`, state: "fallback_png" });
      } else if (status) {
        status.textContent = "Share action opened.";
      }
    } catch (error) {
      if (error?.name !== "AbortError" && status) status.textContent = "Sharing was not completed. You can still save the PNG.";
    }
  });

  const onKeydown = (event) => {
    if (event.key !== "Escape") return;
    document.removeEventListener("keydown", onKeydown);
    finishClose();
  };
  document.addEventListener("keydown", onKeydown);
  return true;
}

function findResultActions(realm) {
  const output = document.querySelector(`[data-output="${realm}"]`);
  let node = output?.nextElementSibling;
  for (let index = 0; node && index < 4; index += 1, node = node.nextElementSibling) {
    if (node.classList.contains("result-actions")) return node;
  }
  return null;
}

function injectResultShareAction(realm) {
  if (!SHAREABLE_REALMS.has(realm)) return;
  window.setTimeout(() => {
    const actions = findResultActions(realm);
    if (!actions || actions.querySelector("[data-create-share-card]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "btn-ghost btn-small oracle-share-result-button";
    button.dataset.createShareCard = realm;
    button.textContent = "Create Share Card";
    button.addEventListener("click", () => {
      const payload = payloadForRealm(realm);
      if (payload) openShareCard(payload, realm);
    });
    actions.insertBefore(button, actions.lastElementChild);
  }, 0);
}

window.dataLayer = window.dataLayer || [];
const previousPush = window.dataLayer.push.bind(window.dataLayer);
window.dataLayer.push = (...items) => {
  for (const item of items) {
    if (item?.event === "result_rendered" && SHAREABLE_REALMS.has(item.realm)) injectResultShareAction(item.realm);
  }
  return previousPush(...items);
};

document.addEventListener("click", (event) => {
  const journeyButton = event.target?.closest?.(".journey-share");
  if (!journeyButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  const payload = dailyPayload();
  if (payload) openShareCard(payload, "daily");
}, { capture: true });

window.oracleShare = {
  openShareCard,
  payloadForRealm,
  renderShareCard,
};

export { payloadForRealm };
