import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { EXPANDED_DREAM_SEEDS, DREAM_THEME_META } from "../src/dream-expanded-data.ts";
import { DREAM_SYMBOLS, dreamThemes, relatedDreamSymbols, retrieveDreamKnowledge, symbolsForDreamTheme } from "../src/dream-library.ts";
import { augmentLlmsWithDreamLibrary, augmentSitemapWithDreamLibrary, dreamLibrarySitemapUrls, handleDreamLibraryRoute, renderDreamLibrarySymbolPage, renderDreamThemePage } from "../src/dream-pages-v2.ts";
import { dreamPhaseForTurns, handleExpandedDream } from "../src/dream-api.ts";

const v2 = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const wrapper = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");

test("expanded corpus adds 250 unique seeds and produces a 265-symbol combined library", () => {
  assert.equal(EXPANDED_DREAM_SEEDS.length, 250);
  assert.equal(new Set(EXPANDED_DREAM_SEEDS.map((seed) => seed.slug)).size, 250);
  assert.equal(DREAM_SYMBOLS.length, 265);
  assert.equal(new Set(DREAM_SYMBOLS.map((symbol) => symbol.symbol)).size, DREAM_SYMBOLS.length);
  for (const symbol of DREAM_SYMBOLS) {
    assert.ok(symbol.meaning.length > 60, symbol.symbol);
    assert.ok(symbol.frameworks.emotional.length > 60, symbol.symbol);
    assert.ok(symbol.questionHints.length >= 2, symbol.symbol);
  }
});

test("ten semantic themes are complete and every dream symbol belongs to one", () => {
  assert.equal(Object.keys(DREAM_THEME_META).length, 10);
  const themes = dreamThemes();
  assert.equal(themes.length, 10);
  assert.equal(themes.reduce((sum, theme) => sum + theme.count, 0), DREAM_SYMBOLS.length);
  for (const theme of themes) assert.ok(theme.count >= 20, theme.slug);
});

test("expanded retrieval finds specific new symbols rather than only the legacy fifteen", () => {
  const matched = retrieveDreamKnowledge("I missed my flight, lost my luggage, then a wolf followed me into a hotel", 6);
  const ids = matched.map((symbol) => symbol.symbol);
  assert.ok(ids.includes("missed-flight"));
  assert.ok(ids.includes("lost-luggage"));
  assert.ok(ids.includes("wolf"));
  assert.ok(ids.includes("hotel"));
});

test("related-symbol discovery stays semantic instead of using array neighbours", () => {
  const wolf = DREAM_SYMBOLS.find((symbol) => symbol.symbol === "wolf");
  assert.ok(wolf);
  const related = relatedDreamSymbols(wolf!, 6);
  assert.equal(related.length, 6);
  assert.ok(related.every((symbol) => symbol.category === "animals"));
  assert.ok(related.every((symbol) => symbol.symbol !== "wolf"));
});

test("dream SSR surface includes 265 symbols, ten theme pages, and safe interpretive framing", async () => {
  assert.equal(dreamLibrarySitemapUrls().length, 277);
  const wolf = renderDreamLibrarySymbolPage("wolf");
  assert.ok(wolf);
  assert.match(wolf!, /Wolf Dream Meaning/);
  assert.match(wolf!, /reflection prompt rather than a prediction/);
  assert.match(wolf!, /Psychodynamic \/ Freudian lens/);
  assert.match(wolf!, /Dream interpretation is reflective and symbolic/);
  const nightmares = renderDreamThemePage("nightmares");
  assert.ok(nightmares);
  assert.match(nightmares!, /Nightmares &amp; Threats Dream Meanings/);
  assert.match(nightmares!, /literal prediction/);
  assert.equal(renderDreamThemePage("not-real"), undefined);
  assert.equal(handleDreamLibraryRoute("/dreams/not-real"), undefined);
});

test("sitemap and llms augmentation are complete and idempotent", () => {
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/dreams</loc></url></urlset>';
  const expanded = augmentSitemapWithDreamLibrary(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/dreams(?:<|\/)/g) || []).length, 277);
  assert.equal(augmentSitemapWithDreamLibrary(expanded), expanded);
  const llms = augmentLlmsWithDreamLibrary("# Oracle Mirror\n");
  assert.match(llms, /## Expanded Dream Library/);
  assert.match(llms, /265-symbol dream dictionary/);
  assert.equal(augmentLlmsWithDreamLibrary(llms), llms);
  assert.match(v2, /augmentSitemapWithDreamLibrary/);
  assert.match(v2, /Dream Library/);
});

test("Morpheus phase logic remains compatible while grounding uses expanded symbols", () => {
  assert.equal(dreamPhaseForTurns(1), "clarify");
  assert.equal(dreamPhaseForTurns(2), "clarify");
  assert.equal(dreamPhaseForTurns(3), "interpret");
  assert.match(wrapper, /index-legacy\.ts/);
  assert.match(wrapper, /handleExpandedDream/);
});

test("expanded Dream API uses one successful model call and exposes only a coarse match count", async () => {
  let calls = 0;
  let captured: any = null;
  const env = { AI: { run: async (_model: string, input: any) => { calls += 1; captured = input; return { response: "What feeling stayed with you after the wolf appeared?" }; } } };
  const request = new Request("https://oraclemirror.com/api/dream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ role: "user", content: "I dreamed a wolf chased me through a hotel after I missed my flight" }] }) });
  const response = await handleExpandedDream(request, env);
  assert.equal(response.status, 200);
  const json = await response.json() as any;
  assert.equal(json.phase, "clarify");
  assert.ok(json.matchedSymbolCount >= 3);
  assert.equal(calls, 1);
  assert.ok(captured.messages.some((message: any) => /fixed meaning/.test(message.content)));
  assert.equal(Object.prototype.hasOwnProperty.call(json, "matchedSymbols"), false);
});

test("health and nightmare symbols avoid diagnosis, supernatural certainty, and fatalistic prediction", () => {
  const illness = DREAM_SYMBOLS.find((symbol) => symbol.symbol === "illness");
  const demon = DREAM_SYMBOLS.find((symbol) => symbol.symbol === "demon");
  const murder = DREAM_SYMBOLS.find((symbol) => symbol.symbol === "murder");
  assert.ok(illness && demon && murder);
  assert.match(illness!.meaning, /diagnosis|care/i);
  assert.match(demon!.meaning, /reflection prompt/i);
  assert.match(murder!.meaning, /reflection prompt/i);
  assert.ok(symbolsForDreamTheme("nightmares").length >= 20);
});
