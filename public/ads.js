import { ORACLE_AD_CONFIG } from "./ad-config.js";

const CONSENT_KEY = "oracle-mirror-consent-v1";
const MOBILE_ANCHOR_CLOSED_KEY = "oracle-mobile-anchor-closed";
const AMBIENT_POPUNDER_KEY = "oracle-ambient-popunder-loaded";
const slotConfigs = new Map(ORACLE_AD_CONFIG.slots.map((slot) => [slot.slotId, slot]));
const registeredSlots = new WeakSet();
const loadedInstances = new Set();
const pendingConsentSlots = new Set();
const sessionRefreshCounts = new Map();
const lastRefreshAt = new Map();

let displayLoadQueue = Promise.resolve();
let activeScreen = "home";
let activeRealm = "home";
let slotInstanceCounter = 0;
let sessionStartedAt = Date.now();
let lastUserInteractionAt = 0;
let ambientValueDelivered = false;
let ambientPopunderTimer = null;

export function trackEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    site_name: ORACLE_AD_CONFIG.siteName,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

function getStoredConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY) || "null");
  } catch {
    return null;
  }
}

function setStoredConsent(consent) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify({ ...consent, updatedAt: new Date().toISOString() }));
}

export function getConsentState() {
  const stored = getStoredConsent();
  if (!stored) {
    return { state: "pending", ads: false, analytics: true };
  }
  return stored;
}

function hasAdConsent() {
  const consent = getConsentState();
  return !ORACLE_AD_CONFIG.consentRequired || consent.ads === true;
}

function currentDevice() {
  if (window.matchMedia("(max-width: 767px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 1199px)").matches) return "tablet";
  return "desktop";
}

function deviceAllowed(config) {
  return config.devices.includes(currentDevice());
}

function hasConfiguredAdsterraZone(config) {
  const zoneId = config.adsterra?.zoneId || "";
  return Boolean(config.adsterra?.scriptUrl) && !zoneId.startsWith("TODO_ADSTERRA");
}

function hasConfiguredGlobalScript(config) {
  return Boolean(config?.scriptUrl) && !String(config.zoneId || "").startsWith("TODO_ADSTERRA");
}

function recordUserInteraction() {
  lastUserInteractionAt = Date.now();
}

function runWhenIdle(callback, timeout = 2000) {
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(callback, { timeout });
  } else {
    window.setTimeout(callback, 120);
  }
}

function isElementVisible(el) {
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function slotInstanceId(host, config) {
  if (!host.dataset.adInstance) {
    slotInstanceCounter += 1;
    const realm = host.dataset.adRealm || config.realmType || "global";
    host.dataset.adInstance = `${config.slotId}:${realm}:${slotInstanceCounter}`;
  }
  return host.dataset.adInstance;
}

function renderSlotShell(host, config) {
  const reserve = config.reserve || {};
  host.classList.add("oracle-ad-slot");
  host.style.setProperty("--ad-reserve-width", `${reserve.width || 300}px`);
  host.style.setProperty("--ad-reserve-height", `${reserve.height || 250}px`);
  host.dataset.adPlacement = config.placement;
  host.dataset.adFormat = config.format;

  if (!host.querySelector("[data-ad-mount]")) {
    host.innerHTML = `
      <div class="oracle-ad-label">Advertisement</div>
      <div class="oracle-ad-frame">
        <div class="oracle-ad-mount" data-ad-mount>
          <span class="oracle-ad-pending">The sponsor sigil is preparing.</span>
        </div>
      </div>
    `;
  }
}

function observeViewability(host, config, instanceId) {
  if (!("IntersectionObserver" in window)) return;

  let oneSecondTimer = null;
  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const isVisible50 = entry.isIntersecting && entry.intersectionRatio >= 0.5;

      if (isVisible50 && !host.dataset.visible50Tracked) {
        host.dataset.visible50Tracked = "true";
        host.__oracleAdViewable = true;
        trackEvent("ad_slot_visible_50", {
          slot_id: config.slotId,
          ad_instance_id: instanceId,
          placement: config.placement,
          screen: activeScreen,
          realm: activeRealm,
        });
      }

      if (isVisible50 && !host.dataset.viewable1sTracked) {
        clearTimeout(oneSecondTimer);
        oneSecondTimer = window.setTimeout(() => {
          if (!host.dataset.viewable1sTracked && isElementVisible(host)) {
            host.dataset.viewable1sTracked = "true";
            host.__oracleAdViewable = true;
            trackEvent("ad_slot_viewable_1s", {
              slot_id: config.slotId,
              ad_instance_id: instanceId,
              placement: config.placement,
              screen: activeScreen,
              realm: activeRealm,
            });
          }
        }, 1000);
      } else {
        clearTimeout(oneSecondTimer);
      }
    },
    { threshold: [0, 0.5] }
  );

  observer.observe(host);
}

function registerSlot(host) {
  if (registeredSlots.has(host)) return;

  const config = slotConfigs.get(host.dataset.adSlot);
  if (!config) return;

  registeredSlots.add(host);
  renderSlotShell(host, config);
  const instanceId = slotInstanceId(host, config);

  trackEvent("ad_slot_registered", {
    slot_id: config.slotId,
    ad_instance_id: instanceId,
    placement: config.placement,
    format: config.format,
    screen_type: config.screenType,
    realm_type: host.dataset.adRealm || config.realmType,
    enabled: config.enabled,
    refresh_eligible: config.refreshEligible,
  });

  observeViewability(host, config, instanceId);
}

export function registerAdSlots(root = document) {
  for (const host of root.querySelectorAll("[data-ad-slot]")) {
    registerSlot(host);
  }
}

function slotMatchesActiveContext(host, config, realm = activeRealm) {
  const page = host.closest(".page");
  if (page && !page.classList.contains("active")) return false;
  if (host.dataset.adRealm && host.dataset.adRealm !== realm && host.dataset.adRealm !== "all") return false;
  if (config.screenType === "home" && activeScreen !== "home") return false;
  if (config.screenType === "archive" && activeScreen !== "archive") return false;
  if (config.screenType === "realm" && !["realm", "result"].includes(activeScreen)) return false;
  if (config.screenType === "result" && activeScreen !== "result") return false;
  return true;
}

function markSlotCollapsed(host, config, instanceId, reason) {
  host.dataset.adCollapsed = reason;
  host.classList.add("oracle-ad-collapsed");
  trackEvent("ad_slot_collapsed", {
    slot_id: config.slotId,
    ad_instance_id: instanceId,
    placement: config.placement,
    reason,
    screen: activeScreen,
    realm: activeRealm,
  });
}

function markConsentPending(host, config, instanceId) {
  pendingConsentSlots.add(host);
  host.classList.add("oracle-ad-awaiting-consent");
  const pending = host.querySelector(".oracle-ad-pending");
  if (pending) pending.textContent = "Ads load after cookie consent.";
  trackEvent("ad_slot_collapsed", {
    slot_id: config.slotId,
    ad_instance_id: instanceId,
    placement: config.placement,
    reason: "consent_pending",
    screen: activeScreen,
    realm: activeRealm,
  });
}

function setSlotMessage(host, message) {
  const pending = host.querySelector(".oracle-ad-pending");
  if (pending) pending.textContent = message;
}

function loadDisplayAd(host, config, instanceId) {
  const mount = host.querySelector("[data-ad-mount]");
  const display = config.adsterra.display;
  if (!mount || !display) return Promise.resolve();

  return new Promise((resolve) => {
    mount.innerHTML = "";
    const script = document.createElement("script");
    script.async = true;
    script.src = config.adsterra.scriptUrl;
    script.onload = () => {
      host.classList.remove("oracle-ad-loading");
      host.classList.add("oracle-ad-loaded");
      trackEvent("ad_script_loaded", {
        slot_id: config.slotId,
        ad_instance_id: instanceId,
        placement: config.placement,
        zone_id: config.adsterra.zoneId,
      });
      resolve();
    };
    script.onerror = () => {
      host.classList.remove("oracle-ad-loading");
      host.classList.add("oracle-ad-error");
      setSlotMessage(host, "Sponsor message unavailable.");
      trackEvent("ad_script_error", {
        slot_id: config.slotId,
        ad_instance_id: instanceId,
        placement: config.placement,
        zone_id: config.adsterra.zoneId,
      });
      markSlotCollapsed(host, config, instanceId, "script_error");
      resolve();
    };

    window.atOptions = {
      key: display.key,
      format: display.format,
      height: display.height,
      width: display.width,
      params: {},
    };
    mount.appendChild(script);
  });
}

function loadNativeAd(host, config, instanceId) {
  const mount = host.querySelector("[data-ad-mount]");
  if (!mount) return;

  mount.innerHTML = "";
  const container = document.createElement("div");
  container.id = config.adsterra.containerId;
  mount.appendChild(container);

  const script = document.createElement("script");
  script.async = true;
  script.dataset.cfasync = "false";
  script.src = config.adsterra.scriptUrl;
  script.onload = () => {
    host.classList.remove("oracle-ad-loading");
    host.classList.add("oracle-ad-loaded");
    trackEvent("ad_script_loaded", {
      slot_id: config.slotId,
      ad_instance_id: instanceId,
      placement: config.placement,
      zone_id: config.adsterra.zoneId,
    });
  };
  script.onerror = () => {
    host.classList.remove("oracle-ad-loading");
    host.classList.add("oracle-ad-error");
    setSlotMessage(host, "Sponsor message unavailable.");
    trackEvent("ad_script_error", {
      slot_id: config.slotId,
      ad_instance_id: instanceId,
      placement: config.placement,
      zone_id: config.adsterra.zoneId,
    });
    markSlotCollapsed(host, config, instanceId, "script_error");
  };
  mount.appendChild(script);
}

function requestSlot(host, config) {
  registerSlot(host);

  const instanceId = slotInstanceId(host, config);
  if (loadedInstances.has(instanceId)) return;

  if (!config.enabled) {
    markSlotCollapsed(host, config, instanceId, "disabled");
    return;
  }

  if (!deviceAllowed(config)) {
    markSlotCollapsed(host, config, instanceId, "device_rule");
    return;
  }

  if (!hasAdConsent()) {
    markConsentPending(host, config, instanceId);
    return;
  }

  pendingConsentSlots.delete(host);

  if (!hasConfiguredAdsterraZone(config)) {
    setSlotMessage(host, `${config.adsterra.placeholderZoneId} is not configured.`);
    markSlotCollapsed(host, config, instanceId, "placeholder_zone");
    return;
  }

  loadedInstances.add(instanceId);
  host.classList.remove("oracle-ad-awaiting-consent", "oracle-ad-collapsed");
  host.classList.add("oracle-ad-loading");

  trackEvent("ad_slot_requested", {
    slot_id: config.slotId,
    ad_instance_id: instanceId,
    placement: config.placement,
    format: config.format,
    zone_id: config.adsterra.zoneId,
    screen: activeScreen,
    realm: activeRealm,
  });

  if (config.format === "display") {
    displayLoadQueue = displayLoadQueue.then(() => loadDisplayAd(host, config, instanceId));
  } else if (config.format === "native") {
    loadNativeAd(host, config, instanceId);
  }
}

const lazyObserver =
  "IntersectionObserver" in window
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const host = entry.target;
              const config = slotConfigs.get(host.dataset.adSlot);
              if (config) requestSlot(host, config);
              lazyObserver.unobserve(host);
            }
          }
        },
        { rootMargin: "320px 0px" }
      )
    : null;

export function activateAdSlot(slotId, { realm = activeRealm, force = false } = {}) {
  const config = slotConfigs.get(slotId);
  if (!config) return;

  registerAdSlots();

  for (const host of document.querySelectorAll(`[data-ad-slot="${slotId}"]`)) {
    if (!force && !slotMatchesActiveContext(host, config, realm)) continue;
    if (config.lazy && lazyObserver) {
      lazyObserver.observe(host);
    } else {
      requestSlot(host, config);
    }
  }
}

export function activateSlotsForScreen(screen, realm) {
  activeScreen = screen;
  activeRealm = realm || screen;

  if (screen === "home") {
    activateAdSlot("oracle-home-slot", { realm: "home" });
    hideMobileAnchor();
    return;
  }

  if (screen === "archive") {
    activateAdSlot("oracle-archive-native", { realm: "archive" });
    activateAdSlot("oracle-archive-bottom-slot", { realm: "archive" });
    hideMobileAnchor();
    return;
  }

  if (screen === "realm") {
    activateAdSlot("oracle-realm-slot", { realm });
    activateAdSlot("oracle-desktop-rail-left", { realm, force: true });
    showMobileAnchor();
  }

  if (screen === "result") {
    activateAdSlot("oracle-result-slot", { realm });
    activateAdSlot("oracle-desktop-rail-left", { realm, force: true });
    activateAdSlot("oracle-desktop-rail-right", { realm, force: true });
    showMobileAnchor();
  }
}

export function createResultAdSlot(realm) {
  const host = document.createElement("aside");
  host.className = "oracle-ad oracle-ad-result";
  host.dataset.adSlot = "oracle-result-slot";
  host.dataset.adRealm = realm;
  host.dataset.adLazy = "false";
  registerSlot(host);
  return host;
}

export function createArchiveFeedAdSlot() {
  const host = document.createElement("aside");
  host.className = "oracle-ad oracle-ad-archive-feed";
  host.dataset.adSlot = "oracle-archive-native";
  host.dataset.adRealm = "archive";
  host.dataset.adLazy = "true";
  registerSlot(host);
  return host;
}

function syncMobileAnchorHeight() {
  const anchor = document.getElementById("oracle-mobile-anchor");
  const visible = anchor && !anchor.hidden && !document.body.classList.contains("mobile-anchor-suppressed");
  const height = visible ? Math.ceil(anchor.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty("--ad-sticky-height", `${height}px`);
  document.body.classList.toggle("has-mobile-anchor", height > 0);
}

export function showMobileAnchor() {
  const anchor = document.getElementById("oracle-mobile-anchor");
  if (!anchor) return;
  const closed = sessionStorage.getItem(MOBILE_ANCHOR_CLOSED_KEY) === "true";
  if (closed || currentDevice() !== "mobile" || !hasAdConsent()) {
    hideMobileAnchor();
    return;
  }
  anchor.hidden = false;
  activateAdSlot("oracle-mobile-anchor", { realm: activeRealm, force: true });
  syncMobileAnchorHeight();
}

export function hideMobileAnchor() {
  const anchor = document.getElementById("oracle-mobile-anchor");
  if (anchor) anchor.hidden = true;
  syncMobileAnchorHeight();
}

function initMobileAnchor() {
  const anchor = document.getElementById("oracle-mobile-anchor");
  const closeBtn = document.getElementById("oracle-mobile-anchor-close");
  closeBtn?.addEventListener("click", () => {
    sessionStorage.setItem(MOBILE_ANCHOR_CLOSED_KEY, "true");
    hideMobileAnchor();
    trackEvent("mobile_anchor_closed", {
      screen: activeScreen,
      realm: activeRealm,
    });
  });

  const suppressSelector = "input, textarea, select, button";
  document.addEventListener("focusin", (event) => {
    if (event.target?.matches?.(suppressSelector)) {
      document.body.classList.add("mobile-anchor-suppressed");
      syncMobileAnchorHeight();
    }
  });
  document.addEventListener("focusout", () => {
    window.setTimeout(() => {
      document.body.classList.remove("mobile-anchor-suppressed");
      syncMobileAnchorHeight();
    }, 120);
  });

  if (anchor && "ResizeObserver" in window) {
    new ResizeObserver(syncMobileAnchorHeight).observe(anchor);
  }
  window.addEventListener("resize", syncMobileAnchorHeight);
}

function consentBanner() {
  return document.getElementById("oracle-consent-banner");
}

function showConsentBanner() {
  const banner = consentBanner();
  if (banner) banner.hidden = false;
}

function hideConsentBanner() {
  const banner = consentBanner();
  if (banner) banner.hidden = true;
}

function applyConsent(consent) {
  setStoredConsent(consent);
  hideConsentBanner();
  trackEvent("consent_state", {
    state: consent.state,
    ads: consent.ads,
    analytics: consent.analytics,
  });

  if (consent.ads) {
    const pending = [...pendingConsentSlots];
    pendingConsentSlots.clear();
    for (const host of pending) {
      const config = slotConfigs.get(host.dataset.adSlot);
      if (config && slotMatchesActiveContext(host, config, host.dataset.adRealm || activeRealm)) {
        requestSlot(host, config);
      } else {
        pendingConsentSlots.add(host);
      }
    }
    if (["realm", "result"].includes(activeScreen)) showMobileAnchor();
    if (ambientValueDelivered) scheduleAmbientPopunder("consent_after_value");
  } else {
    for (const host of document.querySelectorAll("[data-ad-slot]")) {
      const config = slotConfigs.get(host.dataset.adSlot);
      if (config) markSlotCollapsed(host, config, slotInstanceId(host, config), "consent_rejected");
    }
    hideMobileAnchor();
  }
}

function initConsent() {
  const consent = getConsentState();
  trackEvent("consent_state", {
    state: consent.state,
    ads: consent.ads,
    analytics: consent.analytics,
  });

  if (consent.state === "pending") {
    showConsentBanner();
  }

  document.getElementById("consent-accept")?.addEventListener("click", () => {
    applyConsent({ state: "accepted", ads: true, analytics: true });
  });

  document.getElementById("consent-reject")?.addEventListener("click", () => {
    applyConsent({ state: "rejected", ads: false, analytics: true });
  });

  document.getElementById("consent-preferences")?.addEventListener("click", () => {
    showConsentBanner();
  });

  document.getElementById("footer-cookie-preferences")?.addEventListener("click", (event) => {
    event.preventDefault();
    showConsentBanner();
  });
}

export function openCookiePreferences() {
  showConsentBanner();
}

function runAdBlockCheck() {
  const bait = document.createElement("div");
  bait.className = "adsbox ad-banner ad-unit text-ad pub_300x250";
  bait.style.cssText = "position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;";
  document.body.appendChild(bait);
  window.setTimeout(() => {
    const blocked = bait.offsetHeight === 0 || bait.offsetParent === null || window.getComputedStyle(bait).display === "none";
    bait.remove();
    trackEvent("ad_block_check", { blocked });
  }, 80);
}

function ambientPopunderLoaded() {
  return sessionStorage.getItem(AMBIENT_POPUNDER_KEY) === "true";
}

function markAmbientPopunderLoaded() {
  sessionStorage.setItem(AMBIENT_POPUNDER_KEY, "true");
}

function loadAmbientPopunder(config, reason) {
  if (ambientPopunderLoaded()) return;
  if (!config.enabled) {
    trackEvent("ad_slot_collapsed", {
      slot_id: config.name,
      placement: config.placement,
      reason: "disabled",
      screen: activeScreen,
      realm: activeRealm,
    });
    return;
  }
  if (config.consentRequired && !hasAdConsent()) return;
  if (!hasConfiguredGlobalScript(config)) {
    trackEvent("ad_slot_collapsed", {
      slot_id: config.name,
      placement: config.placement,
      reason: "placeholder_zone",
      zone_id: config.placeholderZoneId,
      screen: activeScreen,
      realm: activeRealm,
    });
    return;
  }

  markAmbientPopunderLoaded();
  trackEvent("ad_slot_requested", {
    slot_id: config.name,
    placement: config.placement,
    format: "popunder",
    zone_id: config.zoneId,
    trigger: reason,
    screen: activeScreen,
    realm: activeRealm,
  });

  runWhenIdle(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = config.scriptUrl;
    script.onload = () => {
      trackEvent("ad_script_loaded", {
        slot_id: config.name,
        placement: config.placement,
        format: "popunder",
        zone_id: config.zoneId,
      });
    };
    script.onerror = () => {
      trackEvent("ad_script_error", {
        slot_id: config.name,
        placement: config.placement,
        format: "popunder",
        zone_id: config.zoneId,
      });
    };
    document.body.appendChild(script);
  });
}

export function scheduleAmbientPopunder(reason = "value_delivered") {
  const config = ORACLE_AD_CONFIG.globalScripts?.popunder;
  if (!config) return;
  ambientValueDelivered = true;
  if (ambientPopunderLoaded() || ambientPopunderTimer) return;
  if (config.consentRequired && !hasAdConsent()) return;

  const now = Date.now();
  const sessionDelay = Math.max(0, config.minSessionAgeMs - (now - sessionStartedAt));
  const interactionDelay = Math.max(0, config.minIdleAfterInteractionMs - (now - lastUserInteractionAt));
  const delay = Math.max(config.delayAfterValueMs, sessionDelay, interactionDelay);

  ambientPopunderTimer = window.setTimeout(() => {
    ambientPopunderTimer = null;
    const idleFor = Date.now() - lastUserInteractionAt;
    if (document.visibilityState !== "visible" || document.activeElement?.matches?.("input, textarea, select")) {
      scheduleAmbientPopunder("deferred_until_visible");
      return;
    }
    if (idleFor < config.minIdleAfterInteractionMs) {
      scheduleAmbientPopunder("deferred_after_interaction");
      return;
    }
    loadAmbientPopunder(config, reason);
  }, delay);
}

function canRefreshSlot(host, config, instanceId) {
  const policy = ORACLE_AD_CONFIG.refreshPolicy;
  if (!policy.enabled || !config.refreshEligible) return false;
  if (!host.__oracleAdViewable && policy.requireViewable) return false;
  if (document.visibilityState !== "visible") return false;
  if (!isElementVisible(host)) return false;
  if (document.activeElement?.matches?.("input, textarea, select")) return false;
  if (document.body.dataset.readingState === "animating") return false;

  const count = sessionRefreshCounts.get(instanceId) || 0;
  if (count >= policy.maxRefreshesPerSession) return false;

  const last = lastRefreshAt.get(instanceId) || 0;
  return Date.now() - last >= policy.minIntervalMs;
}

function attemptRefreshes() {
  for (const host of document.querySelectorAll("[data-ad-slot]")) {
    const config = slotConfigs.get(host.dataset.adSlot);
    if (!config) continue;
    const instanceId = slotInstanceId(host, config);
    const eligible = canRefreshSlot(host, config, instanceId);
    trackEvent("ad_slot_refresh_attempt", {
      slot_id: config.slotId,
      ad_instance_id: instanceId,
      placement: config.placement,
      eligible,
      refresh_enabled: ORACLE_AD_CONFIG.refreshPolicy.enabled,
    });
    if (!eligible) continue;

    loadedInstances.delete(instanceId);
    sessionRefreshCounts.set(instanceId, (sessionRefreshCounts.get(instanceId) || 0) + 1);
    lastRefreshAt.set(instanceId, Date.now());
    requestSlot(host, config);
  }
}

export function initAdSystem() {
  window.dataLayer = window.dataLayer || [];
  window.addEventListener("pointerup", recordUserInteraction, { passive: true });
  window.addEventListener("keydown", recordUserInteraction, { passive: true });
  registerAdSlots();
  initConsent();
  initMobileAnchor();
  runAdBlockCheck();

  if (ORACLE_AD_CONFIG.refreshPolicy.enabled) {
    window.setInterval(attemptRefreshes, 30000);
  }
}
