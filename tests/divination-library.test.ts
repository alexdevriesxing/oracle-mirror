import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CRYSTALS, DIVINATION_GUIDES, PENDULUM_GUIDES, SCRYING_METHODS, TEA_SYMBOLS, WAX_SYMBOLS } from "../src/divination-data.ts";
import { augmentLlmsWithDivination, augmentSitemapWithDivination, divinationSitemapUrls, handleDivinationRoute, injectDivinationDiscovery, isDivinationRoute } from "../src/divination-pages.ts";

const v2 = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const bridge = await readFile(new URL("../public/divination-bridge.js", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/divination.css", import.meta.url), "utf8");
const pages = await readFile(new URL("../src/divination-pages.ts", import.meta.url), "utf8");

test("divination corpus has the intended complete category counts", () => {
  assert.equal(CRYSTALS.length, 36);
  assert.equal(TEA_SYMBOLS.length, 40);
  assert.equal(WAX_SYMBOLS.length, 24);
  assert.equal(SCRYING_METHODS.length, 6);
  assert.equal(PENDULUM_GUIDES.length, 4);
  assert.equal(DIVINATION_GUIDES.length, 5);
  for (const corpus of [CRYSTALS, TEA_SYMBOLS, WAX_SYMBOLS, SCRYING_METHODS, PENDULUM_GUIDES, DIVINATION_GUIDES]) {
    assert.equal(new Set(corpus.map((item) => item.slug)).size, corpus.length);
    for (const item of corpus) {
      assert.ok(item.name.length >= 3);
      assert.ok(item.theme.length >= 20, item.slug);
    }
  }
});

test("divination library exposes exactly 122 canonical routes", () => {
  const urls = divinationSitemapUrls();
  assert.equal(urls.length, 122);
  assert.equal(new Set(urls).size, 122);
  assert.ok(urls.includes("/divination/crystals/amethyst"));
  assert.ok(urls.includes("/divination/tea-leaves/anchor"));
  assert.ok(urls.includes("/divination/candle-wax/spiral"));
  assert.ok(urls.includes("/divination/scrying/crystal-ball-scrying"));
  assert.ok(urls.includes("/divination/pendulum/ideomotor-effect"));
  assert.ok(urls.includes("/divination/guides/tradition-vs-evidence"));
});

test("all public routes render indexable standalone HTML and unknown routes 404", async () => {
  for (const path of divinationSitemapUrls()) {
    assert.equal(isDivinationRoute(path), true, path);
    const response = handleDivinationRoute(path);
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.match(html, /<link rel="canonical" href="https:\/\/oraclemirror\.com\/divination/);
    assert.match(html, /<meta name="robots" content="index,follow,max-image-preview:large">/);
    assert.match(html, /divination\.css/);
  }
  assert.equal(handleDivinationRoute("/divination/not-real").status, 404);
});

test("crystal, tea, wax, scrying and pendulum pages keep claims grounded", async () => {
  const crystal = await handleDivinationRoute("/divination/crystals/rose-quartz").text();
  assert.match(crystal, /not presented here as treatments, diagnostic tools/i);
  assert.match(crystal, /without proving healing energy or supernatural effects/i);
  const tea = await handleDivinationRoute("/divination/tea-leaves/heart").text();
  assert.match(tea, /pattern recognition/i);
  assert.match(tea, /does not treat tea leaves as evidence/i);
  const wax = await handleDivinationRoute("/divination/candle-wax/star").text();
  assert.match(wax, /Fire safety before symbolism/i);
  assert.match(wax, /not medical tests, danger detectors, or reliable forecasts/i);
  const scry = await handleDivinationRoute("/divination/scrying/cloud-scrying").text();
  assert.match(scry, /normal human pattern recognition/i);
  const pendulum = await handleDivinationRoute("/divination/pendulum/ideomotor-effect").text();
  assert.match(pendulum, /tiny involuntary muscle movements/i);
  assert.match(pendulum, /not as an independent source of factual knowledge/i);
});

test("collection hubs preserve explanatory notes and correct symbolic branch identity", async () => {
  const tea = await handleDivinationRoute("/divination/tea-leaves").text();
  assert.match(tea, /Use the entries as prompts, not a decoding key/);
  assert.match(tea, /☕/);
  const wax = await handleDivinationRoute("/divination/candle-wax").text();
  assert.match(wax, /Never sacrifice fire safety for ritual atmosphere/);
  assert.match(wax, /🕯/);
  const pendulum = await handleDivinationRoute("/divination/pendulum").text();
  assert.match(pendulum, /Define possible outcomes before asking/);
});

test("sitemap, llms and homepage discovery are complete and idempotent", () => {
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const expanded = augmentSitemapWithDivination(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/divination/g) || []).length, 122);
  assert.equal(augmentSitemapWithDivination(expanded), expanded);
  const llms = augmentLlmsWithDivination("# Oracle Mirror\n");
  assert.match(llms, /## Divination Reference Library/);
  assert.match(llms, /36 crystal symbolism guides/);
  assert.equal(augmentLlmsWithDivination(llms), llms);
  const sample = '<a href="/dreams" class="dropdown-item dream-library-link">📖 Dream Library</a><a href="/crystal-ball" class="card card-crystal" data-realm="crystal-ball">';
  const injected = injectDivinationDiscovery(sample);
  assert.match(injected, /href="\/divination" class="dropdown-item divination-library-link"/);
  assert.match(injected, /card-divination-library/);
  assert.equal(injectDivinationDiscovery(injected), injected);
});

test("V2 routes the library before the legacy app and includes it in discovery transforms", () => {
  assert.match(v2, /isDivinationRoute/);
  assert.match(v2, /handleDivinationRoute/);
  assert.match(v2, /augmentSitemapWithDivination/);
  assert.match(v2, /augmentLlmsWithDivination/);
  assert.match(v2, /injectDivinationDiscovery/);
});

test("Mirror Lab links Pendulum users to education without sending their question", () => {
  assert.match(hardening, /divination-bridge\.js/);
  assert.match(bridge, /href="\/divination\/pendulum"/);
  assert.doesNotMatch(bridge, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|dataLayer/);
  assert.doesNotMatch(bridge, /pendulum-question|\.value/);
});

test("reference library adds no feature API, AI, storage, or perpetual animation runtime", () => {
  assert.doesNotMatch(pages, /env\.AI|fetch\(|localStorage|sessionStorage|requestAnimationFrame/);
  assert.doesNotMatch(css, /animation\s*:/);
  assert.match(css, /prefers-reduced-motion/);
});
