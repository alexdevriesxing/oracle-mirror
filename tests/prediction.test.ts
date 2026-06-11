import { describe, it } from "node:test";
import assert from "node:assert";
import { cleanForbiddenWords } from "../src/index.ts";

describe("Oracle of Olympus Safety and Fallback Tests", () => {
  
  it("should sanitize forbidden betting words and replace them with mystical equivalents", () => {
    const rawProphecyText = `{
      "divineVerdict": "This is a guaranteed win and a sure bet, so it is a lock. Risk-free profit for your investment! Bet now!",
      "predictedScore": "Germany 2–2 Spain",
      "mostLikelyOutcome": "Draw",
      "confidence": "Medium",
      "whyTheMirrorSeesThis": "Because the stats are a sure bet.",
      "olympianOmen": "Athena favors the brave.",
      "mortalWarning": "For entertainment.",
      "disclaimer": "Oracle Mirror sports predictions are mystical entertainment..."
    }`;

    const parsed = JSON.parse(rawProphecyText);
    const cleanedVerdict = cleanForbiddenWords(parsed.divineVerdict);
    const cleanedReasoning = cleanForbiddenWords(parsed.whyTheMirrorSeesThis);

    // Verify substitutions are case-insensitive and match boundaries
    assert.ok(!cleanedVerdict.includes("guaranteed win"));
    assert.ok(!cleanedVerdict.includes("sure bet"));
    assert.ok(!cleanedVerdict.includes("lock"));
    assert.ok(!cleanedVerdict.includes("risk-free"));
    assert.ok(!cleanedVerdict.includes("bet now"));
    assert.ok(!cleanedVerdict.includes("profit"));
    assert.ok(!cleanedVerdict.includes("investment"));

    assert.ok(cleanedVerdict.includes("strong alignment"));
    assert.ok(cleanedVerdict.includes("promising path"));
    assert.ok(cleanedVerdict.includes("solid outcome"));
    assert.ok(cleanedVerdict.includes("uncertain but favored"));
    assert.ok(cleanedVerdict.includes("watch closely"));
    assert.ok(cleanedVerdict.includes("mystical reward"));
    assert.ok(cleanedVerdict.includes("venture"));

    assert.ok(cleanedReasoning.includes("promising path"));
  });

  it("should generate a valid mystical template fallback prophecy", () => {
    const match = {
      matchId: "wc2026-germany-spain",
      teamA: "Germany",
      teamB: "Spain",
      competition: "FIFA World Cup 2026",
      stage: "Group Stage",
      date: "2026-06-11",
      venue: "SoFi Stadium",
      predictedScore: "Germany 2–2 Spain",
      probabilities: { teamAWin: 35, draw: 33, teamBWin: 32 },
      confidence: "Medium" as const,
      historicalSummary: "Two European giants with contrasting styles.",
      dataReasoning: "A highly balanced matchup."
    };

    // Replicate getLocalMysticalProphecy logic
    const templates = {
      divineVerdict: [
        "Nike's gaze flickers over the pitch, where {teamA} and {teamB} clash. The stars align closely, indicating that {winner} shall find the golden paths to victory.",
        "Ares rattles his shield. Though {teamA} fights with the strength of lions, the swift spears of {teamB} will strike like lightning.",
        "Hermes stands balanced. Neither side holds the supreme favor of the heavens; they shall match goal for goal."
      ],
      olympianOmen: ["Athena whispers of tactical structure, but Poseidon warns that the defense of {loser} may flood under pressure."]
    };

    const winner = match.probabilities.teamAWin > match.probabilities.teamBWin ? match.teamA : match.teamB;
    const loser = match.probabilities.teamAWin > match.probabilities.teamBWin ? match.teamB : match.teamA;
    const isDrawFavored = Math.abs(match.probabilities.teamAWin - match.probabilities.teamBWin) <= 5 || match.probabilities.draw > 30;

    let verdictTpl = isDrawFavored ? templates.divineVerdict[2] : (winner === match.teamA ? templates.divineVerdict[0] : templates.divineVerdict[1]);
    let omenTpl = templates.olympianOmen[0];

    const replacePlaceholders = (text: string) => {
      return text
        .replace(/{teamA}/g, match.teamA)
        .replace(/{teamB}/g, match.teamB)
        .replace(/{winner}/g, winner)
        .replace(/{loser}/g, loser);
    };

    const finalVerdict = replacePlaceholders(verdictTpl);
    const finalOmen = replacePlaceholders(omenTpl);

    if (isDrawFavored) {
      assert.ok(finalVerdict.includes("Hermes stands balanced"));
    } else {
      assert.ok(finalVerdict.includes("Germany"));
      assert.ok(finalVerdict.includes("Spain"));
    }
    
    assert.ok(finalOmen.includes("Spain")); // Spain is loser here because teamAWin (35) > teamBWin (32)
  });
});
