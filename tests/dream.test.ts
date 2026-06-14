import { describe, it } from "node:test";
import assert from "node:assert";
import { deriveDreamPhase } from "../src/index.ts";
import {
  retrieveDreamKnowledge,
  buildDreamGrounding,
  dreamQuestionHints,
  DREAM_SYMBOLS,
} from "../src/dream-data.ts";

describe("Dream Interpreter (Morpheus) Tests", () => {
  it("should ask clarifying questions before interpreting, then interpret", () => {
    // Turn 1 = the dream description, turns 2 and 3 answer the two questions.
    assert.strictEqual(deriveDreamPhase(1), "clarify", "first turn (description) -> clarify");
    assert.strictEqual(deriveDreamPhase(2), "clarify", "second turn (answer 1) -> clarify");
    assert.strictEqual(deriveDreamPhase(3), "interpret", "third turn (answer 2) -> interpret");
    assert.strictEqual(deriveDreamPhase(4), "interpret", "later turns stay in interpret");
  });

  it("should retrieve relevant dream symbols from free-text dream descriptions", () => {
    const falling = retrieveDreamKnowledge("I was falling off a cliff and could not stop");
    assert.ok(
      falling.some((s) => s.symbol === "falling"),
      "should match the falling symbol"
    );

    const teeth = retrieveDreamKnowledge("all my teeth were crumbling and falling out");
    assert.ok(
      teeth.some((s) => s.symbol === "teeth"),
      "should match the teeth symbol"
    );

    const multi = retrieveDreamKnowledge("a snake slithered through dark water toward me");
    const matchedSymbols = multi.map((s) => s.symbol);
    assert.ok(matchedSymbols.includes("snake"), "should match snake");
    assert.ok(matchedSymbols.includes("water"), "should match water");
  });

  it("should cap retrieval results and return nothing for symbol-free text", () => {
    const none = retrieveDreamKnowledge("the quarterly budget meeting ran long");
    assert.strictEqual(none.length, 0, "no dream symbols -> empty grounding");

    const many = retrieveDreamKnowledge(
      "falling flying teeth chased water death naked snake baby house fire"
    );
    assert.ok(many.length <= 4, "retrieval is capped at 4 symbols");
  });

  it("should build grounding text only when symbols match", () => {
    assert.strictEqual(buildDreamGrounding([]), "", "no symbols -> empty grounding");

    const symbols = retrieveDreamKnowledge("I kept falling and falling");
    const grounding = buildDreamGrounding(symbols);
    assert.ok(grounding.includes("Falling"), "grounding names the matched symbol");
    assert.ok(
      grounding.toLowerCase().includes("weave it naturally"),
      "grounding instructs the model to weave lore naturally"
    );
  });

  it("should surface clarifying-question hints from matched symbols", () => {
    const hints = dreamQuestionHints(retrieveDreamKnowledge("I was being chased"));
    assert.ok(hints.length > 0, "chased symbol should provide question hints");
  });

  it("should have a well-formed knowledge corpus", () => {
    assert.ok(DREAM_SYMBOLS.length >= 10, "corpus should be reasonably comprehensive");
    const slugs = new Set<string>();
    for (const symbol of DREAM_SYMBOLS) {
      assert.ok(symbol.title.length > 0, `${symbol.symbol} needs a title`);
      assert.ok(symbol.meaning.length > 20, `${symbol.symbol} needs a meaning`);
      assert.ok(symbol.aliases.length > 0, `${symbol.symbol} needs aliases`);
      assert.ok(symbol.questionHints.length > 0, `${symbol.symbol} needs question hints`);
      assert.ok(!slugs.has(symbol.symbol), `${symbol.symbol} must be unique`);
      slugs.add(symbol.symbol);
    }
  });
});
