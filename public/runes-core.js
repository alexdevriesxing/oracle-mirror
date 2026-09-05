export const RUNES = [
  ["fehu","Fehu","ᚠ","wealth · resources · movement","Resources become useful when they are put into wise motion.","What resource can you put into motion today?"],
  ["uruz","Uruz","ᚢ","strength · vitality · endurance","Meet the situation with steady strength rather than a burst of force.","Where would steady strength serve you better than urgency?"],
  ["thurisaz","Thurisaz","ᚦ","boundary · friction · defense","A pause or boundary may be more useful than an immediate reaction.","What deserves a pause before you respond?"],
  ["ansuz","Ansuz","ᚨ","communication · insight · message","Clear words and careful listening can reveal the real issue.","What conversation needs clearer words or better listening?"],
  ["raidho","Raidho","ᚱ","journey · rhythm · direction","Progress improves when the route and destination are aligned.","Is your current route actually leading where you want to go?"],
  ["kenaz","Kenaz","ᚲ","torch · clarity · craft","Bring light to one part of the problem and work it with care.","What would become easier if you understood it one level more deeply?"],
  ["gebo","Gebo","ᚷ","gift · exchange · reciprocity","Look for the exchange in which both sides gain value and dignity.","Where could a fairer exchange strengthen a relationship?"],
  ["wunjo","Wunjo","ᚹ","joy · harmony · belonging","Let genuine alignment be enjoyed rather than instantly turned into the next task.","What is already going well enough to appreciate?"],
  ["hagalaz","Hagalaz","ᚺ","disruption · weather · reset","Protect what matters and adapt around what cannot be controlled.","What can you stabilize even if you cannot control the whole situation?"],
  ["nauthiz","Nauthiz","ᚾ","need · constraint · patience","Limits can clarify what is genuinely necessary.","What is truly necessary here, and what is merely preferred?"],
  ["isa","Isa","ᛁ","stillness · pause · focus","Stillness can reveal what constant motion was hiding.","What becomes visible when you stop pushing for a moment?"],
  ["jera","Jera","ᛃ","harvest · cycle · timing","Some results need a full cycle of repeated effort before they can be judged.","What process deserves another season of consistent attention?"],
  ["eihwaz","Eihwaz","ᛇ","endurance · axis · transition","Hold your center while the surrounding form changes.","What principle should remain steady while everything else changes?"],
  ["perthro","Perthro","ᛈ","mystery · chance · unknown","Leave room for hidden factors and more than one possible outcome.","What decision would improve if you allowed for the unknown?"],
  ["algiz","Algiz","ᛉ","protection · awareness · support","Strengthen the boundary that lets you stay open without becoming careless.","What boundary would help you feel safer without closing you off?"],
  ["sowilo","Sowilo","ᛋ","sun · clarity · success","Put energy behind the direction that remains coherent in full daylight.","What becomes obvious when you strip away unnecessary doubt?"],
  ["tiwaz","Tiwaz","ᛏ","justice · courage · principle","Let principle simplify the decision when convenience and integrity diverge.","What choice would you make if fairness mattered more than convenience?"],
  ["berkano","Berkano","ᛒ","growth · nurture · beginning","Give a new beginning enough care and structure to become resilient.","What new thing needs care rather than pressure?"],
  ["ehwaz","Ehwaz","ᛖ","partnership · movement · trust","Better coordination may create more progress than more individual effort.","Who or what needs better coordination with you?"],
  ["mannaz","Mannaz","ᛗ","humanity · self · community","Use both self-knowledge and outside perspective; neither is complete alone.","What are other people showing you about yourself right now?"],
  ["laguz","Laguz","ᛚ","water · intuition · flow","Adapt to conditions without abandoning your direction.","Where could you adapt without abandoning your purpose?"],
  ["ingwaz","Ingwaz","ᛜ","potential · gestation · completion","Complete the quiet preparation before forcing the next launch.","What is nearly ready, but still needs one final stage of preparation?"],
  ["dagaz","Dagaz","ᛞ","daybreak · breakthrough · change","A new perspective can suddenly make a workable next step visible.","What changes if you look at the problem from the opposite side?"],
  ["othala","Othala","ᛟ","heritage · home · inheritance","Choose consciously what from your inheritance deserves to be preserved or changed.","What have you inherited that you want to preserve—and what should change?"],
].map(([slug,name,glyph,keywords,message,reflection]) => ({ slug,name,glyph,keywords,message,reflection }));

export const RUNE_POSITIONS = [
  { id: "root", label: "Root", prompt: "The condition or influence underneath the situation." },
  { id: "present", label: "Present", prompt: "What deserves attention in the current moment." },
  { id: "path", label: "Path Ahead", prompt: "A symbolic direction to consider next, not a fixed prediction." },
];

function hashSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rng(seed) {
  let state = hashSeed(String(seed || "rune-cast")) || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export function drawRunes(seed) {
  const random = rng(seed);
  const pool = [...RUNES];
  const result = [];
  for (let index = 0; index < 3; index += 1) {
    const pick = Math.floor(random() * pool.length);
    result.push({ ...pool.splice(pick, 1)[0], position: RUNE_POSITIONS[index] });
  }
  return result;
}
