import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { MOON_PHASES, PLANETS, RETROGRADE_PLANETS, ZODIAC_SIGNS } from "../src/astrology-data.ts";
import { astrologySitemapUrls, augmentLlmsWithAstrology, augmentSitemapWithAstrology, handleAstrologyRoute, injectAstrologyDiscovery, isAstrologyRoute } from "../src/astrology-pages.ts";
import { buildMoonWindow, moonAgeForDate, moonPhaseForDate, sunSignForDate } from "../public/astrology-core.js";

const ui=await readFile(new URL("../public/astrology.js",import.meta.url),"utf8");
const css=await readFile(new URL("../public/astrology.css",import.meta.url),"utf8");
const v2=await readFile(new URL("../src/v2-index.ts",import.meta.url),"utf8");

test("astrology corpora contain 12 signs, 10 bodies, 8 phases, and five focused retrograde guides",()=>{
  assert.equal(ZODIAC_SIGNS.length,12);assert.equal(new Set(ZODIAC_SIGNS.map(x=>x.slug)).size,12);
  assert.equal(PLANETS.length,10);assert.equal(new Set(PLANETS.map(x=>x.slug)).size,10);
  assert.equal(MOON_PHASES.length,8);assert.equal(RETROGRADE_PLANETS.length,5);
  for(const sign of ZODIAC_SIGNS){assert.ok(sign.summary.length>70);assert.ok(sign.strength.length>65);assert.ok(sign.challenge.length>65);}
  for(const body of PLANETS){assert.ok(body.astronomy.length>70);assert.ok(body.astrology.length>65);}
});

test("moon model is deterministic, bounded, and clearly approximate",()=>{
  const age=moonAgeForDate("2026-09-07");assert.ok(age!==null&&age>=0&&age<29.53058867);
  const a=moonPhaseForDate("2026-09-07"),b=moonPhaseForDate("2026-09-07");assert.deepEqual(a,b);assert.ok(a);assert.ok(a!.illuminatedPercent>=0&&a!.illuminatedPercent<=100);
  assert.equal(moonPhaseForDate("2026-02-31"),null);
  const window=buildMoonWindow("2026-09-07",15);assert.equal(window.length,15);assert.equal(window[7].date,"2026-09-07");
});

test("simple tropical sun-sign lookup handles conventional date ranges without claiming cusp precision",()=>{
  assert.equal(sunSignForDate("2026-04-01"),"aries");
  assert.equal(sunSignForDate("2026-08-01"),"leo");
  assert.equal(sunSignForDate("2026-12-31"),"capricorn");
  assert.equal(sunSignForDate("bad"),null);
});

test("Moon calculator page exposes methodology and local client",async()=>{
  const response=handleAstrologyRoute("/astrology/moon");assert.equal(response.status,200);const html=await response.text();
  assert.match(html,/Moon Phase Calculator/);assert.match(html,/29\.53058867-day synodic month/);assert.match(html,/not a precision ephemeris/);assert.match(html,/astrology\.js/);assert.match(html,/type="date"/);
});

test("zodiac, planet, retrograde, transit, and birth-chart guides separate astronomy from symbolism",async()=>{
  const aries=await handleAstrologyRoute("/astrology/zodiac/aries").text();assert.match(aries,/Aries Zodiac Sign/);assert.match(aries,/Exact Sun sign near a cusp/);
  const mercury=await handleAstrologyRoute("/astrology/planets/mercury").text();assert.match(mercury,/Astronomy/);assert.match(mercury,/astrological interpretation/);
  const retro=await handleAstrologyRoute("/astrology/retrogrades/mercury").text();assert.match(retro,/apparent reversal/);assert.match(retro,/does not claim that retrograde motion causes/);
  const transits=await handleAstrologyRoute("/astrology/transits").text();assert.match(transits,/does not fabricate “today's transits”/);
  const birth=await handleAstrologyRoute("/astrology/birth-chart").text();assert.match(birth,/Planets/);assert.match(birth,/Houses/);assert.match(birth,/Tropical vs sidereal zodiac/);
});

test("astrology expansion adds exactly 43 sitemap URLs and discovery is idempotent",()=>{
  assert.equal(astrologySitemapUrls().length,43);assert.ok(isAstrologyRoute("/astrology"));assert.ok(isAstrologyRoute("/astrology/moon/phases/full-moon"));assert.ok(isAstrologyRoute("/astrology/planets/saturn"));
  const base='<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';const expanded=augmentSitemapWithAstrology(base);assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/astrology(?:<|\/)/g)||[]).length,43);assert.equal(augmentSitemapWithAstrology(expanded),expanded);
  const sample='<a href="/western-zodiac" class="dropdown-item" data-nav="western-zodiac">Western Zodiac</a>';const injected=injectAstrologyDiscovery(sample);assert.match(injected,/href="\/astrology"/);assert.equal(injectAstrologyDiscovery(injected),injected);
  const llms=augmentLlmsWithAstrology("# Oracle Mirror\n");assert.match(llms,/## Astrology & Lunar Guides/);assert.match(llms,/approximate Moon phase calculator/);assert.equal(augmentLlmsWithAstrology(llms),llms);
  assert.match(v2,/isAstrologyRoute/);assert.match(v2,/handleAstrologyRoute/);
});

test("astrology Moon UI makes no feature API calls or private-input persistence",()=>{
  assert.doesNotMatch(ui,/fetch\(|\/api\//);assert.doesNotMatch(ui,/localStorage|sessionStorage/);assert.match(ui,/moonPhaseForDate/);assert.match(ui,/15-day lunar window/);assert.match(css,/prefers-reduced-motion/);
});

test("unknown astrology detail routes return 404",()=>{
  assert.equal(handleAstrologyRoute("/astrology/zodiac/not-real").status,404);
  assert.equal(handleAstrologyRoute("/astrology/planets/not-real").status,404);
  assert.equal(handleAstrologyRoute("/astrology/moon/phases/not-real").status,404);
});
