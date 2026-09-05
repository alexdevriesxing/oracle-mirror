import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HEXAGRAMS, KING_WEN_MATRIX, TRIGRAMS, hexagramPath } from "../src/iching-data.ts";
import {
  advancedIChingSitemapUrls,
  augmentLlmsWithAdvancedIChing,
  augmentSitemapWithAdvancedIChing,
  handleAdvancedIChingRoute,
  injectAdvancedIChingDiscovery,
  isAdvancedIChingRoute,
} from "../src/iching-pages.ts";
import { castFromValues, castIChing } from "../public/advanced-iching-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const v2Index = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../public/advanced-iching.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/advanced-iching.css", import.meta.url), "utf8");

test("I Ching corpus contains all 64 unique King Wen hexagrams and eight trigrams", () => {
  assert.equal(HEXAGRAMS.length, 64);
  assert.equal(new Set(HEXAGRAMS.map((item) => item.number)).size, 64);
  assert.deepEqual(HEXAGRAMS.map((item) => item.number), Array.from({ length: 64 }, (_, index) => index + 1));
  assert.equal(HEXAGRAMS[0].symbol, "䷀");
  assert.equal(HEXAGRAMS[63].symbol, "䷿");
  assert.equal(TRIGRAMS.length, 8);
  assert.equal(new Set(TRIGRAMS.map((item) => item.bits)).size, 8);
  for (const item of HEXAGRAMS) {
    assert.ok(item.summary.length > 60);
    assert.ok(item.guidance.length > 55);
    assert.equal(item.keywords.length, 3);
    assert.match(hexagramPath(item), /^\/iching\/hexagrams\/\d+-[a-z0-9-]+$/);
  }
});

test("server corpus composition matches the complete King Wen trigram matrix", () => {
  const seen = new Set<number>();
  for (const [lower, row] of Object.entries(KING_WEN_MATRIX)) {
    for (const [upper, number] of Object.entries(row)) {
      const item = HEXAGRAMS.find((hex) => hex.number === number);
      assert.ok(item, `missing hexagram ${number}`);
      assert.equal(item.lower, lower);
      assert.equal(item.upper, upper);
      seen.add(number);
    }
  }
  assert.equal(seen.size, 64);
  assert.equal(KING_WEN_MATRIX.qian.qian, 1);
  assert.equal(KING_WEN_MATRIX.kun.kun, 2);
  assert.equal(KING_WEN_MATRIX.li.kan, 63);
  assert.equal(KING_WEN_MATRIX.kan.li, 64);
});

test("three-coin line values distinguish stable and changing yin/yang", () => {
  const creative = castFromValues([7, 7, 7, 7, 7, 7]);
  assert.equal(creative.currentNumber, 1);
  assert.equal(creative.transformedNumber, 1);
  assert.equal(creative.hasChanges, false);
  const receptive = castFromValues([8, 8, 8, 8, 8, 8]);
  assert.equal(receptive.currentNumber, 2);
  assert.equal(receptive.hasChanges, false);
  const allYangChanging = castFromValues([9, 9, 9, 9, 9, 9]);
  assert.equal(allYangChanging.currentNumber, 1);
  assert.equal(allYangChanging.transformedNumber, 2);
  assert.deepEqual(allYangChanging.changingLines, [1, 2, 3, 4, 5, 6]);
  const allYinChanging = castFromValues([6, 6, 6, 6, 6, 6]);
  assert.equal(allYinChanging.currentNumber, 2);
  assert.equal(allYinChanging.transformedNumber, 1);
});

test("seeded three-coin casting is deterministic and always resolves valid hexagrams", () => {
  const first = castIChing("oracle-mirror-test-seed");
  const second = castIChing("oracle-mirror-test-seed");
  assert.deepEqual(first.values, second.values);
  assert.equal(first.currentNumber, second.currentNumber);
  assert.equal(first.transformedNumber, second.transformedNumber);
  assert.equal(first.lines.length, 6);
  assert.ok(first.values.every((value) => [6, 7, 8, 9].includes(value)));
  assert.ok(first.currentNumber >= 1 && first.currentNumber <= 64);
  assert.ok(first.transformedNumber >= 1 && first.transformedNumber <= 64);
  assert.throws(() => castFromValues([7, 7, 7]), /six line values/);
  assert.throws(() => castFromValues([7, 7, 7, 7, 7, 5]), /6, 7, 8, or 9/);
});

test("Advanced I Ching hub is standalone, local-first, and historically qualified", async () => {
  const response = handleAdvancedIChingRoute("/iching");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Advanced I Ching Reading/);
  assert.match(html, /Cast the Six Lines/);
  assert.match(html, /6 and 9 are changing lines/);
  assert.match(html, /complete three-coin cast happens in your browser/);
  assert.match(html, /coin casting is a later divination technique/);
  assert.match(html, /advanced-iching-data/);
  assert.match(html, /advanced-iching\.js/);
});

test("hexagram pages expose composition, original summaries, and schema", async () => {
  const page = handleAdvancedIChingRoute("/iching/hexagrams/63-after-completion");
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Hexagram 63: After Completion/);
  assert.match(html, /Upper: Water/);
  assert.match(html, /Lower: Fire/);
  assert.match(html, /Reflection meaning/);
  assert.match(html, /rather than reproducing a modern translation/);
  assert.match(html, /"@type":"Article"/);
  assert.match(html, /BreadcrumbList/);
  const redirect = handleAdvancedIChingRoute("/iching/hexagrams/63");
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get("location"), "/iching/hexagrams/63-after-completion");
  assert.equal(handleAdvancedIChingRoute("/iching/hexagrams/65").status, 404);
});

test("trigram and coin-method pages explain structural and historical distinctions", async () => {
  const water = await handleAdvancedIChingRoute("/iching/trigrams/kan").text();
  assert.match(water, /Water Trigram/);
  assert.match(water, /bottom-to-top binary line pattern is 010/);
  assert.match(water, /lower or upper trigram/);
  const coins = await handleAdvancedIChingRoute("/iching/coin-method").text();
  assert.match(coins, /Old Yin/);
  assert.match(coins, /Young Yang/);
  assert.match(coins, /Old Yang/);
  assert.match(coins, /not the earliest attested method/);
  assert.match(coins, /does not have the same outcome probabilities/);
  assert.equal(handleAdvancedIChingRoute("/iching/trigrams/not-real").status, 404);
});

test("Advanced I Ching adds exactly 76 sitemap URLs and idempotent discovery", () => {
  assert.equal(advancedIChingSitemapUrls().length, 76);
  assert.ok(isAdvancedIChingRoute("/iching"));
  assert.ok(isAdvancedIChingRoute("/iching/hexagrams/1-creative"));
  assert.ok(isAdvancedIChingRoute("/iching/trigrams/qian"));
  assert.ok(isAdvancedIChingRoute("/iching/coin-method"));
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const expanded = augmentSitemapWithAdvancedIChing(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/iching(?:<|\/)/g) || []).length, 76);
  assert.equal(augmentSitemapWithAdvancedIChing(expanded), expanded);
  const sample = '<a href="/iching-oracle" class="dropdown-item" data-nav="iching">&#128142; I Ching</a><a href="/dream-interpreter" class="card card-dream" data-realm="dream-interpreter">';
  const injected = injectAdvancedIChingDiscovery(sample);
  assert.match(injected, /href="\/iching" class="dropdown-item"/);
  assert.match(injected, /class="card card-advanced-iching"/);
  assert.equal(injectAdvancedIChingDiscovery(injected), injected);
  const llms = augmentLlmsWithAdvancedIChing("# Oracle Mirror\n");
  assert.match(llms, /## Advanced I Ching/);
  assert.match(llms, /all 64 hexagrams/);
  assert.equal(augmentLlmsWithAdvancedIChing(llms), llms);
  assert.match(v2Index, /isAdvancedIChingRoute/);
  assert.match(v2Index, /handleAdvancedIChingRoute/);
});

test("I Ching share payload exposes generated cast only and strips arbitrary private fields", () => {
  const payload = sanitizeSharePayload({
    kind: "iching",
    current: "Hexagram 1: The Creative",
    currentSymbol: "䷀",
    transformed: "Hexagram 2: The Receptive",
    changingLines: [1, 6, 6, 99, "3"],
    question: "private decision",
    name: "Private Person",
    birthDate: "1990-07-21",
    notes: "never share this",
  });
  assert.equal(payload?.kind, "iching");
  assert.equal(payload?.title, "Hexagram 1: The Creative");
  assert.match(payload?.lines.join(" ") || "", /Hexagram 2/);
  assert.match(payload?.lines.join(" ") || "", /1, 6, 3/);
  assert.doesNotMatch(JSON.stringify(payload), /private decision|Private Person|1990-07-21|never share this/);
  assert.equal(sanitizeSharePayload({ kind: "iching", current: "" }), null);
});

test("Advanced I Ching UI has zero feature API calls or private-input persistence", () => {
  assert.doesNotMatch(ui, /fetch\(|\/api\//);
  assert.doesNotMatch(ui, /localStorage|sessionStorage/);
  assert.doesNotMatch(ui, /textarea|question/i);
  assert.match(ui, /castIChing/);
  assert.match(ui, /openShareCard/);
  assert.match(css, /prefers-reduced-motion/);
});
