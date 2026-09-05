import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { CORE_NUMBER_GUIDES, NUMEROLOGY_NUMBERS } from "../src/numerology-data.ts";
import {
  advancedNumerologySitemapUrls,
  augmentLlmsWithAdvancedNumerology,
  augmentSitemapWithAdvancedNumerology,
  handleAdvancedNumerologyRoute,
  injectAdvancedNumerologyDiscovery,
} from "../src/numerology-pages.ts";
import {
  birthdayNumber,
  calculateNumerologyProfile,
  letterValue,
  lifePathFromBirthDate,
  nameTotal,
  normalizeLetters,
  personalYearNumber,
  reduceNumber,
} from "../public/advanced-numerology-core.js";
import { sanitizeSharePayload } from "../public/share-card-core.js";

const v2Index = await readFile(new URL("../src/v2-index.ts", import.meta.url), "utf8");
const ui = await readFile(new URL("../public/advanced-numerology.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/advanced-numerology.css", import.meta.url), "utf8");

test("numerology meaning corpus covers 1-9 plus master numbers 11, 22, and 33", () => {
  assert.deepEqual(NUMEROLOGY_NUMBERS.map((item) => item.value), [1,2,3,4,5,6,7,8,9,11,22,33]);
  assert.equal(new Set(NUMEROLOGY_NUMBERS.map((item) => item.value)).size, 12);
  for (const item of NUMEROLOGY_NUMBERS) {
    assert.ok(item.core.length > 60);
    assert.ok(item.strength.length > 60);
    assert.ok(item.challenge.length > 60);
    assert.ok(item.love.length > 60);
    assert.ok(item.work.length > 60);
    assert.ok(item.reflection.endsWith("?"));
  }
  assert.deepEqual(NUMEROLOGY_NUMBERS.filter((item) => item.master).map((item) => item.value), [11,22,33]);
});

test("core-number guide corpus contains all six documented calculations", () => {
  assert.deepEqual(CORE_NUMBER_GUIDES.map((item) => item.slug), ["life-path", "expression", "soul-urge", "personality", "birthday", "personal-year"]);
  for (const guide of CORE_NUMBER_GUIDES) {
    assert.ok(guide.meaning.length > 70);
    assert.ok(guide.method.length > 70);
  }
});

test("Pythagorean letter chart, normalization, and master reduction are deterministic", () => {
  assert.equal(normalizeLetters("Álex de Vriës"), "ALEXDEVRIES");
  assert.equal(letterValue("A"), 1);
  assert.equal(letterValue("I"), 9);
  assert.equal(letterValue("J"), 1);
  assert.equal(letterValue("Z"), 8);
  assert.equal(reduceNumber(29), 11);
  assert.equal(reduceNumber(38), 11);
  assert.equal(reduceNumber(44), 8);
  assert.equal(reduceNumber(33), 33);
  assert.equal(reduceNumber(33, false), 6);
});

test("name calculations use vowels AEIOU and consistently treat Y as a consonant", () => {
  assert.deepEqual(nameTotal("Alex de Vries", "all"), { total: 52, count: 11, reduced: 7 });
  assert.deepEqual(nameTotal("Alex de Vries", "vowels"), { total: 25, count: 5, reduced: 7 });
  assert.deepEqual(nameTotal("Alex de Vries", "consonants"), { total: 27, count: 6, reduced: 9 });
  assert.equal(nameTotal("Maya", "vowels").count, 2);
  assert.equal(nameTotal("Maya", "consonants").count, 2);
});

test("birth-date calculations preserve final master numbers and reject impossible dates", () => {
  assert.deepEqual(lifePathFromBirthDate("1990-07-21"), { total: 29, reduced: 11 });
  assert.equal(birthdayNumber("1990-07-21"), 3);
  assert.deepEqual(personalYearNumber("1990-07-21", 2026), { total: 20, reduced: 2, year: 2026 });
  assert.equal(lifePathFromBirthDate("2026-02-31"), null);
  assert.equal(personalYearNumber("not-a-date", 2026), null);
});

test("six-number profile is reproducible and contains derived values only", () => {
  const profile = calculateNumerologyProfile("Alex de Vries", "1990-07-21", 2026);
  assert.deepEqual(profile, {
    lifePath: 11,
    expression: 7,
    soulUrge: 7,
    personality: 9,
    birthday: 3,
    personalYear: 2,
    personalYearCalendar: 2026,
    raw: { lifePath: 29, expression: 52, soulUrge: 25, personality: 27, personalYear: 20 },
  });
  assert.equal(calculateNumerologyProfile("BCDF", "1990-07-21", 2026), null);
});

test("advanced numerology calculator page is standalone, local-first, and historically qualified", async () => {
  const response = handleAdvancedNumerologyRoute("/numerology/advanced");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Advanced Numerology Profile/);
  assert.match(html, /Six Core Numbers/);
  assert.match(html, /entirely in this browser/);
  assert.match(html, /not documented as a method authored by Pythagoras himself/);
  assert.match(html, /Y is treated as a consonant/);
  assert.match(html, /advanced-numerology-number-data/);
  assert.match(html, /advanced-numerology\.js/);
  assert.match(html, /type="date"/);
});

test("number and core-number detail pages have answer-first copy and schema", async () => {
  const eleven = await handleAdvancedNumerologyRoute("/numerology/numbers/11").text();
  assert.match(eleven, /Numerology Number 11/);
  assert.match(eleven, /Master number/);
  assert.match(eleven, /Strength of 11/);
  assert.match(eleven, /Number 11 in love/);
  assert.match(eleven, /"@type":"Article"/);
  assert.match(eleven, /BreadcrumbList/);
  const soul = await handleAdvancedNumerologyRoute("/numerology/core-numbers/soul-urge").text();
  assert.match(soul, /Soul Urge Number/);
  assert.match(soul, /A, E, I, O, and U/);
  assert.match(soul, /transparent calculation/);
  assert.equal(handleAdvancedNumerologyRoute("/numerology/numbers/10").status, 404);
  assert.equal(handleAdvancedNumerologyRoute("/numerology/core-numbers/not-real").status, 404);
});

test("advanced numerology sitemap adds exactly 21 URLs and discovery is idempotent", () => {
  assert.equal(advancedNumerologySitemapUrls().length, 21);
  const base = '<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';
  const expanded = augmentSitemapWithAdvancedNumerology(base);
  assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/numerology\//g) || []).length, 21);
  assert.equal(augmentSitemapWithAdvancedNumerology(expanded), expanded);
  const sample = '<a href="/numerology" class="dropdown-item" data-nav="numerology">Numerology</a>';
  const injected = injectAdvancedNumerologyDiscovery(sample);
  assert.match(injected, /href="\/numerology\/advanced"/);
  assert.equal(injectAdvancedNumerologyDiscovery(injected), injected);
  const llms = augmentLlmsWithAdvancedNumerology("# Oracle Mirror\n");
  assert.match(llms, /## Advanced Numerology/);
  assert.match(llms, /six-number numerology profile calculator/);
  assert.equal(augmentLlmsWithAdvancedNumerology(llms), llms);
  assert.match(v2Index, /isAdvancedNumerologyRoute/);
  assert.match(v2Index, /handleAdvancedNumerologyRoute/);
});

test("advanced numerology share card contains derived values but strips name and birth date", () => {
  const payload = sanitizeSharePayload({
    kind: "advanced-numerology",
    numbers: [11, 7, 7, 9, 3, 2],
    labels: ["Life Path", "Expression", "Soul Urge", "Personality", "Birthday", "Personal Year"],
    year: 2026,
    name: "Private Person",
    birthDate: "1990-07-21",
    email: "private@example.com",
    notes: "never share this",
  });
  assert.equal(payload?.kind, "advanced-numerology");
  assert.match(payload?.title || "", /Life Path 11/);
  assert.match(payload?.footer || "", /Personal Year 2026: 2/);
  assert.doesNotMatch(JSON.stringify(payload), /Private Person|1990-07-21|private@example\.com|never share this/);
  assert.equal(sanitizeSharePayload({ kind: "advanced-numerology", numbers: [1,2,3,4,5,10] }), null);
});

test("advanced numerology UI makes no feature API calls and does not persist private inputs", () => {
  assert.doesNotMatch(ui, /fetch\(|\/api\//);
  assert.doesNotMatch(ui, /localStorage|sessionStorage/);
  assert.match(ui, /calculateNumerologyProfile/);
  assert.match(ui, /openShareCard/);
  assert.match(css, /prefers-reduced-motion/);
});
