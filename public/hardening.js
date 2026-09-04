import "./telemetry.js";
import "./daily-ritual.js";
import "./mirror-journey.js";
import "./social-share.js";
import "./instant-mysteries.js";

const hardeningStylesheet = document.createElement("link");
hardeningStylesheet.rel = "stylesheet";
hardeningStylesheet.href = "/hardening.css";
hardeningStylesheet.dataset.v2Hardening = "true";
if (!document.querySelector('link[data-v2-hardening="true"]')) {
  document.head.appendChild(hardeningStylesheet);
}

const media = (query) => {
  try {
    return window.matchMedia?.(query)?.matches ?? false;
  } catch {
    return false;
  }
};

const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
const saveData = Boolean(connection?.saveData);
const reducedMotion = media("(prefers-reduced-motion: reduce)");
const coarsePointer = media("(pointer: coarse)");
const lowMemory = typeof navigator.deviceMemory === "number" && navigator.deviceMemory <= 4;

// The particle canvas is purely decorative. Removing it before script.js loads
// prevents the perpetual animation loop and cursor/touch particle listeners on
// users or devices that explicitly benefit from reduced effects.
if (reducedMotion || saveData || coarsePointer || lowMemory) {
  document.documentElement.dataset.reducedEffects = "true";
  document.getElementById("particles")?.remove();
}

function isNativeInteractive(element) {
  return element.matches("button, a[href], input, select, textarea, summary");
}

function accessibleLabel(element) {
  if (element.classList.contains("fan-card")) return "Draw tarot card";
  if (element.classList.contains("tarot-draw-card")) return "Draw tarot intention card";
  if (element.classList.contains("love-pair-card")) {
    return element.querySelector(".pair-card-label")?.textContent?.trim() || "Draw relationship tarot card";
  }
  if (element.classList.contains("planet-node")) {
    const planet = element.dataset.planet || "Planet";
    return `${planet} birth chart details`;
  }
  if (element.classList.contains("palm-line")) {
    const names = {
      "palm-line-heart": "Heart line details",
      "palm-line-head": "Head line details",
      "palm-line-life": "Life line details",
      "palm-line-fate": "Fate line details",
    };
    return names[element.id] || "Palm line details";
  }
  return null;
}

function makeKeyboardClickable(element) {
  if (!(element instanceof Element) || isNativeInteractive(element)) return;
  if (element.dataset.a11yKeyboardReady === "true") return;

  element.dataset.a11yKeyboardReady = "true";
  element.setAttribute("role", "button");
  if (!element.hasAttribute("tabindex")) element.setAttribute("tabindex", "0");

  const label = accessibleLabel(element);
  if (label && !element.hasAttribute("aria-label")) element.setAttribute("aria-label", label);

  element.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    element.click();
  });
}

const CUSTOM_CONTROL_SELECTOR = [
  ".tarot-draw-card",
  ".fan-card",
  ".love-pair-card",
  ".planet-node",
  ".palm-line",
].join(",");

function patchCustomControls(root = document) {
  if (root instanceof Element && root.matches(CUSTOM_CONTROL_SELECTOR)) {
    makeKeyboardClickable(root);
  }
  root.querySelectorAll?.(CUSTOM_CONTROL_SELECTOR).forEach(makeKeyboardClickable);
}

function patchLiveRegions(root = document) {
  const regions = root.querySelectorAll?.('[data-output], #chat-messages, #dream-messages') || [];
  regions.forEach((region) => {
    if (!region.hasAttribute("aria-live")) region.setAttribute("aria-live", "polite");
    if (!region.hasAttribute("aria-atomic")) region.setAttribute("aria-atomic", "false");
  });
}

function syncNavigationAccessibility() {
  const hamburger = document.getElementById("nav-hamburger");
  const links = document.getElementById("nav-links");
  if (!hamburger || !links) return;

  hamburger.setAttribute("aria-controls", "nav-links");
  hamburger.setAttribute("aria-expanded", links.classList.contains("open") ? "true" : "false");

  document.querySelectorAll(".nav-link[data-nav]").forEach((link) => {
    if (link.classList.contains("active")) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
}

patchCustomControls();
patchLiveRegions();
syncNavigationAccessibility();

const navLinks = document.getElementById("nav-links");
if (navLinks) {
  new MutationObserver(syncNavigationAccessibility).observe(navLinks, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true,
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const links = document.getElementById("nav-links");
  const hamburger = document.getElementById("nav-hamburger");
  if (!links?.classList.contains("open")) return;
  links.classList.remove("open");
  syncNavigationAccessibility();
  hamburger?.focus();
});

new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    for (const node of mutation.addedNodes) {
      if (!(node instanceof Element)) continue;
      patchCustomControls(node);
      patchLiveRegions(node);
    }
  }
  syncNavigationAccessibility();
}).observe(document.body, { childList: true, subtree: true });

export {};
