export type Trigram = {
  slug: string;
  name: string;
  chinese: string;
  pinyin: string;
  glyph: string;
  bits: string;
  quality: string;
  image: string;
};

export type Hexagram = {
  number: number;
  slug: string;
  name: string;
  chinese: string;
  pinyin: string;
  symbol: string;
  lower: string;
  upper: string;
  keywords: string[];
  summary: string;
  guidance: string;
};

export const TRIGRAMS: Trigram[] = [
  { slug: "qian", name: "Heaven", chinese: "乾", pinyin: "Qian", glyph: "☰", bits: "111", quality: "creative force", image: "sky" },
  { slug: "dui", name: "Lake", chinese: "兌", pinyin: "Dui", glyph: "☱", bits: "110", quality: "joyful exchange", image: "lake" },
  { slug: "li", name: "Fire", chinese: "離", pinyin: "Li", glyph: "☲", bits: "101", quality: "clarity and radiance", image: "fire" },
  { slug: "zhen", name: "Thunder", chinese: "震", pinyin: "Zhen", glyph: "☳", bits: "100", quality: "arousing movement", image: "thunder" },
  { slug: "xun", name: "Wind", chinese: "巽", pinyin: "Xun", glyph: "☴", bits: "011", quality: "gentle penetration", image: "wind" },
  { slug: "kan", name: "Water", chinese: "坎", pinyin: "Kan", glyph: "☵", bits: "010", quality: "depth and risk", image: "water" },
  { slug: "gen", name: "Mountain", chinese: "艮", pinyin: "Gen", glyph: "☶", bits: "001", quality: "stillness and boundary", image: "mountain" },
  { slug: "kun", name: "Earth", chinese: "坤", pinyin: "Kun", glyph: "☷", bits: "000", quality: "receptive support", image: "earth" },
];

export const KING_WEN_MATRIX: Record<string, Record<string, number>> = {
  qian: { qian: 1, dui: 43, li: 14, zhen: 34, xun: 9, kan: 5, gen: 26, kun: 11 },
  dui: { qian: 10, dui: 58, li: 38, zhen: 54, xun: 61, kan: 60, gen: 41, kun: 19 },
  li: { qian: 13, dui: 49, li: 30, zhen: 55, xun: 37, kan: 63, gen: 22, kun: 36 },
  zhen: { qian: 25, dui: 17, li: 21, zhen: 51, xun: 42, kan: 3, gen: 27, kun: 24 },
  xun: { qian: 44, dui: 28, li: 50, zhen: 32, xun: 57, kan: 48, gen: 18, kun: 46 },
  kan: { qian: 6, dui: 47, li: 64, zhen: 40, xun: 59, kan: 29, gen: 4, kun: 7 },
  gen: { qian: 33, dui: 31, li: 56, zhen: 62, xun: 53, kan: 39, gen: 52, kun: 15 },
  kun: { qian: 12, dui: 45, li: 35, zhen: 16, xun: 20, kan: 8, gen: 23, kun: 2 },
};

const COMPOSITION = new Map<number, { lower: string; upper: string }>();
for (const [lower, row] of Object.entries(KING_WEN_MATRIX)) {
  for (const [upper, number] of Object.entries(row)) COMPOSITION.set(number, { lower, upper });
}

const HEXAGRAM_ROWS = `
1|creative|The Creative|乾|Qian|initiative,strength,creative force|Creative energy is available, but it works best when directed with discipline rather than force.|Lead clearly, act with integrity, and keep refining what you begin.
2|receptive|The Receptive|坤|Kun|receptivity,support,devotion|Progress comes through responsiveness, patience, and making room for what is trying to emerge.|Support what is sound, stay adaptable, and let timing carry some of the weight.
3|difficulty-at-the-beginning|Difficulty at the Beginning|屯|Zhun|beginnings,uncertainty,growth|A new beginning is real, but the first stage is tangled and asks for structure before speed.|Start small, find dependable support, and do not mistake early confusion for failure.
4|youthful-folly|Youthful Folly|蒙|Meng|learning,inexperience,guidance|The situation rewards humility, teachability, and the willingness to ask better questions.|Seek instruction, test assumptions, and avoid pretending to know what still needs learning.
5|waiting|Waiting|需|Xu|timing,patience,readiness|Conditions are still forming, so preparation matters more than forcing an early result.|Use the pause to strengthen resources and act when the opening is genuinely there.
6|conflict|Conflict|訟|Song|dispute,tension,clarity|Competing positions need clear boundaries before the disagreement grows larger than the issue.|Clarify what is essential, de-escalate what is not, and seek a fair point of resolution.
7|army|The Army|師|Shi|discipline,organization,leadership|Collective effort succeeds through order, responsibility, and a clear chain of purpose.|Define roles, keep standards steady, and lead without turning discipline into domination.
8|holding-together|Holding Together|比|Bi|union,belonging,alliance|Connection becomes useful when people know what they are joining and why.|Choose alliances deliberately, show reliability, and make reciprocity visible.
9|small-taming|The Taming Power of the Small|小畜|Xiao Xu|restraint,detail,gradual progress|Small corrections and patient influence can accomplish more now than a dramatic push.|Tend the details, reduce friction, and let incremental gains accumulate.
10|treading|Treading|履|Lu|conduct,care,respect|The path is workable, but it requires awareness of position, consequence, and social boundaries.|Proceed carefully, stay courteous, and do not confuse confidence with entitlement.
11|peace|Peace|泰|Tai|harmony,flow,exchange|Different forces are cooperating, creating a window for growth and constructive exchange.|Use favorable conditions well, strengthen relationships, and prepare before the balance shifts.
12|standstill|Standstill|否|Pi|stagnation,separation,integrity|Movement is blocked because the surrounding conditions are not supporting genuine exchange.|Protect your standards, conserve energy, and avoid investing heavily in a closed system.
13|fellowship|Fellowship with People|同人|Tong Ren|community,shared purpose,openness|Progress comes through common purpose that is broad enough to outgrow private factions.|Name the shared goal, communicate openly, and build cooperation around principles rather than cliques.
14|great-possession|Great Possession|大有|Da You|abundance,responsibility,influence|Resources or influence are available, and the real test is how responsibly they are used.|Share credit, steward what you have well, and invest strength where it creates lasting value.
15|modesty|Modesty|謙|Qian|humility,balance,proportion|Quiet competence and proportion are more effective than self-display in the present situation.|Understate rather than exaggerate, keep learning, and let consistent work carry your reputation.
16|enthusiasm|Enthusiasm|豫|Yu|motivation,momentum,readiness|Energy is rising and can mobilize people, but enthusiasm needs direction to avoid becoming noise.|Channel excitement into a plan, create rhythm, and make sure momentum serves a real aim.
17|following|Following|隨|Sui|adaptation,alignment,responsiveness|The useful move is to align with what is genuinely working without surrendering judgment.|Follow proven momentum, stay observant, and leave room to change course when conditions change.
18|work-on-the-spoiled|Work on What Has Been Spoiled|蠱|Gu|repair,legacy,correction|Something inherited or neglected needs repair before fresh growth can be trusted.|Trace the root cause, correct the pattern rather than the symptom, and document what must change.
19|approach|Approach|臨|Lin|advance,opportunity,attention|An opening is drawing nearer and deserves active preparation rather than passive optimism.|Move toward the opportunity, stay accessible, and prepare for the responsibilities that come with access.
20|contemplation|Contemplation|觀|Guan|observation,perspective,example|Distance and observation reveal more than immediate reaction can right now.|Step back, study the pattern, and remember that your own conduct is also being observed.
21|biting-through|Biting Through|噬嗑|Shi He|decision,obstacle,enforcement|A concrete obstruction must be dealt with directly before normal flow can resume.|Identify the blockage precisely, apply proportionate consequences, and finish what has been left unresolved.
22|grace|Grace|賁|Bi|form,beauty,presentation|Presentation matters, but appearance is valuable only when it supports substance.|Improve the form, simplify the message, and make sure style clarifies rather than disguises the core.
23|splitting-apart|Splitting Apart|剝|Bo|erosion,release,decline|A structure is weakening, so preserving everything is less useful than identifying what can still endure.|Stop propping up what is failing, protect essentials, and allow an exhausted layer to fall away.
24|return|Return|復|Fu|renewal,cycle,turning point|A cycle has reached the point where a small but real return becomes possible.|Resume from first principles, keep the restart modest, and let consistency rebuild momentum.
25|innocence|Innocence|無妄|Wu Wang|sincerity,naturalness,integrity|The situation favors straightforward action without manipulation or needless calculation.|Act cleanly, avoid manufacturing outcomes, and respond to what is actually present.
26|great-taming|The Taming Power of the Great|大畜|Da Xu|accumulation,discipline,stored power|Strength grows by being trained, stored, and prepared for the right use.|Build capacity, study deeply, and delay release until the force can be applied intelligently.
27|nourishment|Nourishment|頤|Yi|sustenance,speech,intake|What you take in—and what you feed others—shapes the next stage more than it may appear.|Audit inputs, choose words carefully, and invest in nourishment that can actually sustain growth.
28|great-preponderance|Great Preponderance|大過|Da Guo|pressure,excess,decisive action|The load is unusually heavy, so ordinary maintenance may no longer be enough.|Acknowledge the strain, reinforce the critical point, and make the necessary adjustment before collapse chooses for you.
29|abysmal|The Abysmal|坎|Kan|risk,depth,repetition|A difficult pattern repeats, requiring steadiness and skill rather than panic.|Learn the terrain, keep commitments simple, and move through danger one verified step at a time.
30|clinging-fire|The Clinging|離|Li|clarity,dependence,illumination|Clarity grows when attention is attached to something worthy and kept there.|Choose what deserves your focus, make dependencies explicit, and use insight to illuminate rather than scorch.
31|influence|Influence|咸|Xian|attraction,sensitivity,mutual effect|Subtle influence works through responsiveness and mutual recognition rather than pressure.|Notice what moves both sides, invite response, and avoid turning attraction into control.
32|duration|Duration|恆|Heng|continuity,commitment,endurance|Lasting results come from sustainable rhythm rather than bursts of intensity.|Choose a pattern you can repeat, keep direction stable, and adjust methods without abandoning purpose.
33|retreat|Retreat|遯|Dun|withdrawal,strategy,distance|Strategic withdrawal can protect strength when direct engagement would waste it.|Create distance without drama, preserve options, and do not spend energy proving you could have stayed.
34|great-power|The Power of the Great|大壯|Da Zhuang|strength,restraint,responsibility|Power is available, which makes restraint and right use more important than display.|Act where strength is legitimate, avoid overreach, and let discipline prove the power is mature.
35|progress|Progress|晉|Jin|advance,recognition,visibility|Conditions support visible advancement when effort is brought into the light.|Show the work, accept constructive recognition, and use progress to widen contribution rather than ego.
36|darkening-of-the-light|Darkening of the Light|明夷|Ming Yi|protection,adversity,inner clarity|External conditions may not reward openness, so inner clarity needs protection.|Keep essential insight intact, reveal only what is safe, and prioritize survival over applause.
37|family|The Family|家人|Jia Ren|roles,household,order|Healthy systems depend on clear roles, consistent expectations, and behavior that starts close to home.|Clarify responsibilities, model the standard you want repeated, and repair disorder at the smallest level first.
38|opposition|Opposition|睽|Kui|difference,contrast,independence|Difference does not have to become hostility; contrast can clarify what each side actually stands for.|Separate incompatible aims from negotiable details, preserve respect, and use difference to sharpen perspective.
39|obstruction|Obstruction|蹇|Jian|difficulty,detour,support|The direct route is blocked, so wisdom lies in changing angle rather than pushing harder.|Pause, seek competent help, and approach the obstacle from a direction the current resistance does not cover.
40|deliverance|Deliverance|解|Jie|release,resolution,relief|Tension can be released if the cause is addressed rather than merely escaped.|Resolve the overdue issue, simplify what follows, and avoid recreating the same knot once relief arrives.
41|decrease|Decrease|損|Sun|reduction,sacrifice,focus|Deliberate reduction can restore balance when resources or attention are too dispersed.|Cut what is nonessential, make the sacrifice explicit, and protect the part that gives the whole meaning.
42|increase|Increase|益|Yi|growth,benefit,investment|Growth is possible when gains are circulated rather than hoarded.|Invest where benefit can multiply, support useful people or systems, and act while the window is open.
43|breakthrough|Breakthrough|夬|Guai|decision,declaration,resolution|A long-building issue reaches the point where clarity must become action.|State the decision, remove ambiguity, and stay alert to the risks that appear after the breakthrough.
44|coming-to-meet|Coming to Meet|姤|Gou|encounter,temptation,influence|A powerful influence arrives suddenly and should be evaluated before it gains position.|Notice the first contact, set boundaries early, and do not give lasting authority to a passing force.
45|gathering-together|Gathering Together|萃|Cui|assembly,community,focus|People or resources can gather effectively when there is a visible center and shared reason.|Create a clear focal point, prepare the structure for participation, and honor what unites the group.
46|pushing-upward|Pushing Upward|升|Sheng|growth,effort,advancement|Steady upward movement comes through accumulated effort and receptive support.|Keep climbing by practical steps, ask for guidance where useful, and value durable progress over dramatic leaps.
47|oppression|Oppression|困|Kun|constraint,exhaustion,inner resolve|External room is limited, making inner steadiness more important than immediate expansion.|Conserve energy, stop arguing with fixed constraints, and keep one meaningful commitment alive.
48|well|The Well|井|Jing|resource,source,community|A dependable source exists, but access, maintenance, or distribution may need attention.|Repair the system around the resource, make access reliable, and judge value by what can be repeatedly drawn from it.
49|revolution|Revolution|革|Ge|change,renewal,timing|A genuine change of form is possible when the old arrangement has lost legitimacy.|Prepare the case, choose timing carefully, and make the new order credible through what follows the change.
50|cauldron|The Cauldron|鼎|Ding|transformation,culture,nourishment|Raw material can be transformed into something that feeds a larger purpose.|Improve the vessel, refine what goes into it, and build conditions where transformation can be repeated.
51|arousing|The Arousing|震|Zhen|shock,awakening,response|A sudden jolt interrupts routine and reveals how well your center holds under surprise.|Respond before reacting, restore orientation, and use the shock to notice what complacency had hidden.
52|keeping-still|Keeping Still|艮|Gen|stillness,boundary,restraint|Stopping at the right moment can be more skillful than continued movement.|Hold the boundary, quiet unnecessary motion, and resume only when action has a clear object.
53|development|Development|漸|Jian|gradual growth,sequence,maturity|Progress is real but should unfold in stages that can support what comes next.|Respect sequence, strengthen each stage before advancing, and let trust grow at the same pace as ambition.
54|marrying-maiden|The Marrying Maiden|歸妹|Gui Mei|position,constraint,expectation|The situation may offer involvement without full control, making realistic expectations essential.|Understand your position, avoid pretending to greater authority, and protect dignity through clear limits.
55|abundance|Abundance|豐|Feng|fullness,visibility,peak|The moment is full and bright, but peaks are temporary and therefore ask for decisive use.|Act while resources and visibility are present, communicate clearly, and prepare for the natural decline after fullness.
56|wanderer|The Wanderer|旅|Lu|travel,impermanence,adaptation|You are operating in territory that is not fully yours, so flexibility and good conduct matter.|Travel light, respect local conditions, and avoid commitments that assume more stability than you have.
57|gentle|The Gentle|巽|Xun|penetration,influence,consistency|Repeated small influence can enter where force would be resisted.|Be consistent, clarify direction, and let persistence work gradually into the structure.
58|joyous|The Joyous|兌|Dui|joy,exchange,communication|Open exchange can renew energy when pleasure and honesty are kept together.|Speak plainly, make room for mutual enjoyment, and avoid using charm to dodge necessary truth.
59|dispersion|Dispersion|渙|Huan|dissolution,release,reconnection|Rigid separation can soften, allowing blocked energy or relationships to move again.|Dissolve the unnecessary barrier, reconnect around what matters, and give scattered effort a center.
60|limitation|Limitation|節|Jie|boundaries,measure,structure|Useful limits create form, while excessive restriction eventually defeats its own purpose.|Set clear boundaries, keep them proportionate, and distinguish structure from needless control.
61|inner-truth|Inner Truth|中孚|Zhong Fu|sincerity,trust,alignment|Credibility grows when inner conviction and outward conduct match.|Say only what you can stand behind, listen for genuine response, and let consistency build trust.
62|small-preponderance|Small Preponderance|小過|Xiao Guo|detail,caution,small action|The moment favors careful attention to small matters rather than ambitious expansion.|Handle details, lower the altitude of the plan, and prefer a modest correct move to a grand uncertain one.
63|after-completion|After Completion|既濟|Ji Ji|completion,maintenance,transition|A goal has been reached, which shifts the challenge from achievement to maintenance.|Secure the result, watch small points of failure, and do not let completion turn into carelessness.
64|before-completion|Before Completion|未濟|Wei Ji|threshold,unfinished work,transition|The transition is close but not complete, so the final stage requires more care than celebration.|Keep attention on the last crossing, avoid premature claims, and finish the sequence before relaxing.
`;

export const HEXAGRAMS: Hexagram[] = HEXAGRAM_ROWS.trim().split("\n").map((row) => {
  const [numberRaw, slug, name, chinese, pinyin, keywordsRaw, summary, guidance] = row.split("|");
  const number = Number(numberRaw);
  const composition = COMPOSITION.get(number);
  if (!composition) throw new Error(`Missing King Wen composition for hexagram ${number}`);
  return {
    number,
    slug,
    name,
    chinese,
    pinyin,
    symbol: String.fromCodePoint(0x4dc0 + number - 1),
    lower: composition.lower,
    upper: composition.upper,
    keywords: keywordsRaw.split(","),
    summary,
    guidance,
  };
});

export function trigram(slug: string): Trigram | undefined {
  return TRIGRAMS.find((item) => item.slug === slug);
}

export function hexagram(number: number): Hexagram | undefined {
  return HEXAGRAMS.find((item) => item.number === number);
}

export function hexagramBySlug(slug: string): Hexagram | undefined {
  return HEXAGRAMS.find((item) => item.slug === slug || `${item.number}-${item.slug}` === slug);
}

export function hexagramPath(item: Hexagram): string {
  return `/iching/hexagrams/${item.number}-${item.slug}`;
}
