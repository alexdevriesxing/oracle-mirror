import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  CONTRIBUTOR_ASSETS,
  DAILY_EDIT_EDITIONS,
  POST_READING_RECOMMENDATIONS,
  ROUTINE_PUBLICATIONS,
  buildPublicEditorialManifest,
  getDailyEditForDate,
  isValidRoutineUrl,
} from "../src/routine-manifest.ts";
import {
  EDITORIAL_ARTICLES,
  augmentLlmsWithEditorial,
  augmentSitemapWithEditorial,
  handleEditorialRoute,
} from "../src/editorial-pages.ts";

const ROOT = process.cwd();

test("canonical Dewi and Eileen portrait files match exact SHA-256 checksums", () => {
  for (const contributor of CONTRIBUTOR_ASSETS) {
    const avatarFile = path.join(ROOT, "public", contributor.avatarPath.replace(/^\//, ""));
    const portraitFile = path.join(ROOT, "public", contributor.portraitPath.replace(/^\//, ""));
    assert.ok(fs.existsSync(avatarFile), `Missing avatar: ${avatarFile}`);
    assert.ok(fs.existsSync(portraitFile), `Missing portrait: ${portraitFile}`);

    const avatarHash = crypto.createHash("sha256").update(fs.readFileSync(avatarFile)).digest("hex");
    const portraitHash = crypto.createHash("sha256").update(fs.readFileSync(portraitFile)).digest("hex");
    assert.equal(avatarHash, contributor.avatarSha256, `${contributor.id} avatar SHA-256 mismatch`);
    assert.equal(portraitHash, contributor.portraitSha256, `${contributor.id} portrait SHA-256 mismatch`);
  }
});

test("Daily Edit contains at least 30 valid scheduled editions with verified Routine URLs", () => {
  assert.ok(DAILY_EDIT_EDITIONS.length >= 30, `Expected >= 30 editions, got ${DAILY_EDIT_EDITIONS.length}`);
  const ids = new Set<string>();
  for (const edition of DAILY_EDIT_EDITIONS) {
    assert.ok(!ids.has(edition.themeId), `Duplicate themeId: ${edition.themeId}`);
    ids.add(edition.themeId);
    assert.equal(edition.recommendations.length, 3);
    for (const rec of edition.recommendations) {
      assert.ok(isValidRoutineUrl(rec.url), `Invalid Routine URL: ${rec.url}`);
    }
  }
  const day = getDailyEditForDate(new Date("2026-11-28T12:00:00Z"));
  assert.ok(day.title.length > 0);
});

test("Routine publications and post-reading mappings use valid URLs and non-exploitative headings", () => {
  assert.equal(ROUTINE_PUBLICATIONS.length, 3);
  for (const pub of ROUTINE_PUBLICATIONS) {
    assert.ok(isValidRoutineUrl(pub.url));
    const localImg = path.join(ROOT, "public", pub.image.replace(/^\//, ""));
    assert.ok(fs.existsSync(localImg), `Missing editorial image: ${localImg}`);
  }

  const requiredRealms = [
    "daily-fortune",
    "western-zodiac",
    "tarot",
    "dream-interpreter",
    "love-match",
    "numerology",
    "palm-reading",
    "birth-chart",
    "chinese-zodiac",
    "iching-oracle",
    "runes",
    "crystal-ball",
  ];
  const forbidden = /(universe wants you to buy|improve your fortune|protect yourself|unlock love|change your destiny)/i;

  for (const realm of requiredRealms) {
    const mapping = POST_READING_RECOMMENDATIONS[realm];
    assert.ok(mapping, `Missing post-reading mapping for ${realm}`);
    assert.ok(!forbidden.test(mapping.heading), `Forbidden heading for ${realm}: ${mapping.heading}`);
    assert.ok(mapping.recommendations.length >= 2);
    for (const rec of mapping.recommendations) {
      assert.ok(isValidRoutineUrl(rec.url), `Invalid post-reading URL: ${rec.url}`);
    }
  }
});

test("public editorial manifest contains zero private reading fields", () => {
  const manifest = buildPublicEditorialManifest(new Date("2026-11-28T12:00:00Z"));
  const serialized = JSON.stringify(manifest);
  for (const sensitive of ["birthDate", "birthTime", "birthLocation", "dreamText", "userQuestion", "readingResult"]) {
    assert.ok(!serialized.includes(sensitive), `Manifest should not contain ${sensitive}`);
  }
});

test("editorial journal, about, and editorial-policy routes return 200 with schema and disclosures", async () => {
  for (const route of ["/editorial", "/about", "/editorial-policy", `/editorial/${EDITORIAL_ARTICLES[0].slug}`]) {
    const res = handleEditorialRoute(route);
    assert.equal(res.status, 200, `Expected 200 for ${route}`);
    const html = await res.text();
    assert.ok(html.includes("application/ld+json"), `Missing JSON-LD on ${route}`);
    assert.ok(html.includes("As an Amazon Associate I earn from qualifying purchases."), `Missing Amazon disclosure on ${route}`);
  }

  const baseSitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://oraclemirror.com/</loc></url></urlset>`;
  const augmented = augmentSitemapWithEditorial(baseSitemap);
  assert.ok(augmented.includes("https://oraclemirror.com/editorial-policy"));
  assert.equal(augmentSitemapWithEditorial(augmented), augmented, "Sitemap augmentation should be idempotent");

  const llms = augmentLlmsWithEditorial("# Oracle Mirror\n");
  assert.ok(llms.includes("https://oraclemirror.com/api/editorial-manifest.json"));
});

test("homepage shell includes Routine Lifestyle Collection, Daily Edit, Guest Contributors, and Footer acknowledgment", () => {
  const html = fs.readFileSync(path.join(ROOT, "public/index.html"), "utf8");
  assert.ok(html.includes('id="routine-lifestyle-collection"'));
  assert.ok(html.includes('id="daily-edit-section"'));
  assert.ok(html.includes('id="guest-contributors-section"'));
  assert.ok(html.includes('class="footer-sister-publications"'));
  assert.ok(html.includes("Dewi's Everyday Inspiration"));
  assert.ok(html.includes("Eileen's Beautiful Living Edit"));
});
