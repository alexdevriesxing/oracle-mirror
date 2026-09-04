import { ORACLE_AD_CONFIG } from "./ad-config.js";

const MOBILE_EXPERIMENT_KEY = "oracle-mobile-ad-surface-v1";

function isMobileViewport() {
  try {
    return window.matchMedia("(max-width: 767px)").matches;
  } catch {
    return window.innerWidth <= 767;
  }
}

function stableSessionVariant() {
  try {
    const stored = sessionStorage.getItem(MOBILE_EXPERIMENT_KEY);
    if (stored === "social_bar" || stored === "anchor") return stored;

    const sample = crypto.getRandomValues(new Uint32Array(1))[0];
    const variant = sample % 2 === 0 ? "social_bar" : "anchor";
    sessionStorage.setItem(MOBILE_EXPERIMENT_KEY, variant);
    return variant;
  } catch {
    return Math.random() < 0.5 ? "social_bar" : "anchor";
  }
}

// M2 refresh policy: fewer, higher-quality viewable refreshes. The existing ad
// loader already requires 50% viewability, visible document state, and an idle
// reading state; this layer makes the cadence less aggressive as well.
ORACLE_AD_CONFIG.refreshPolicy.minIntervalMs = 45000;
ORACLE_AD_CONFIG.refreshPolicy.maxRefreshesPerSession = 8;

for (const slot of ORACLE_AD_CONFIG.slots) {
  // Result MRECs and desktop rails are the inventory where refresh has the best
  // chance to add value. Short-lived banners and anchors stay single-load.
  if ([
    "oracle-home-leaderboard",
    "oracle-footer-banner",
    "oracle-mobile-anchor",
    "oracle-realm-slot",
  ].includes(slot.slotId)) {
    slot.refreshEligible = false;
  }

  // Do not interrupt Morpheus during the clarification conversation. The dream
  // result unit remains available after the interpretation has delivered value.
  if (slot.slotId === "oracle-dream-interstitial") {
    slot.enabled = false;
  }
}

let mobileAdSurfaceVariant = "not_mobile";
if (isMobileViewport()) {
  mobileAdSurfaceVariant = stableSessionVariant();
  const mobileAnchor = ORACLE_AD_CONFIG.slots.find((slot) => slot.slotId === "oracle-mobile-anchor");
  const socialBar = ORACLE_AD_CONFIG.globalScripts?.socialBar;

  if (mobileAdSurfaceVariant === "social_bar") {
    if (mobileAnchor) mobileAnchor.enabled = false;
  } else if (socialBar) {
    socialBar.enabled = false;
  }
}

window.oracleMonetization = {
  mobileAdSurfaceExperiment: "mobile_ad_surface_v1",
  mobileAdSurfaceVariant,
  refreshIntervalMs: ORACLE_AD_CONFIG.refreshPolicy.minIntervalMs,
  maxRefreshesPerSession: ORACLE_AD_CONFIG.refreshPolicy.maxRefreshesPerSession,
};

export { mobileAdSurfaceVariant };
