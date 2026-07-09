import { describe, it } from "node:test";
import assert from "node:assert";
import {
  renderDreamHubPage,
  renderDreamSymbolPage,
  dreamSymbolSlugs,
  findDreamSymbolBySlug,
  dreamGuidePath,
} from "../src/dream-pages.ts";
import { DREAM_SYMBOLS } from "../src/dream-data.ts";
import { REALM_SEO_CONTENT, realmFaqJsonLd, realmSeoHtml } from "../src/realm-content.ts";

function extractJsonLd(html: string): object[] {
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  return blocks.map(([, json]) => JSON.parse(json));
}

describe("Dream guide pages (/dreams)", () => {
  it("exposes one unique slug per corpus symbol, each resolvable", () => {
    const slugs = dreamSymbolSlugs();
    assert.strictEqual(slugs.length, DREAM_SYMBOLS.length, "one slug per symbol");
    assert.strictEqual(new Set(slugs).size, slugs.length, "slugs are unique");
    for (const slug of slugs) {
      assert.ok(findDreamSymbolBySlug(slug), `slug ${slug} resolves to a symbol`);
    }
    assert.strictEqual(dreamGuidePath("teeth"), "/dreams/teeth-falling-out");
  });

  it("renders a complete, valid symbol page", () => {
    const html = renderDreamSymbolPage("teeth-falling-out");
    assert.ok(html, "page renders");
    assert.match(html!, /<h1>What Does Dreaming About Teeth Falling Out Mean\?<\/h1>/);
    assert.match(html!, /rel="canonical" href="https:\/\/oraclemirror\.com\/dreams\/teeth-falling-out"/);
    assert.match(html!, /href="\/dream-interpreter"/, "links back to the interactive tool");
    assert.match(html!, /dreaming about teeth falling out/, "mid-sentence title is fully lowercased");
    assert.doesNotMatch(html!, /teeth Falling Out/, "no half-lowercased title");

    const jsonLd = extractJsonLd(html!);
    const types = jsonLd.map((node) => (node as { "@type": string })["@type"]);
    assert.ok(types.includes("Article"), "has Article schema");
    assert.ok(types.includes("BreadcrumbList"), "has BreadcrumbList schema");
    assert.ok(types.includes("FAQPage"), "has FAQPage schema");
  });

  it("returns undefined for unknown slugs", () => {
    assert.strictEqual(renderDreamSymbolPage("unicorns"), undefined);
  });

  it("renders a hub page listing every symbol", () => {
    const html = renderDreamHubPage();
    for (const slug of dreamSymbolSlugs()) {
      assert.ok(html.includes(`href="/dreams/${slug}"`), `hub links to ${slug}`);
    }
    const jsonLd = extractJsonLd(html);
    const itemList = jsonLd.find((node) => (node as { "@type": string })["@type"] === "ItemList") as
      | { itemListElement: unknown[] }
      | undefined;
    assert.ok(itemList, "hub has ItemList schema");
    assert.strictEqual(itemList!.itemListElement.length, DREAM_SYMBOLS.length);
  });
});

describe("Realm SEO content", () => {
  it("provides at least 3 FAQs and valid related links for every realm", () => {
    const knownRoutes = new Set([
      "/crystal-ball",
      "/western-zodiac",
      "/chinese-zodiac",
      "/tarot",
      "/love-match",
      "/love-oracle",
      "/magic-8-ball",
      "/numerology",
      "/daily-fortune",
      "/birth-chart",
      "/palm-reading",
      "/iching-oracle",
      "/mystics",
      "/archive",
      "/dream-interpreter",
    ]);
    for (const [route, content] of Object.entries(REALM_SEO_CONTENT)) {
      assert.ok(knownRoutes.has(route), `${route} is a real app route`);
      assert.ok(content.faq.length >= 3, `${route} has at least 3 FAQs`);
      assert.ok(content.related.length >= 3, `${route} has at least 3 related realms`);
      for (const related of content.related) {
        assert.ok(knownRoutes.has(related.href), `${route} related link ${related.href} is a real route`);
      }
    }
  });

  it("renders valid FAQPage JSON-LD that matches the visible FAQ", () => {
    for (const content of Object.values(REALM_SEO_CONTENT)) {
      const script = realmFaqJsonLd(content);
      const [node] = extractJsonLd(script) as Array<{ "@type": string; mainEntity: Array<{ name: string }> }>;
      assert.strictEqual(node["@type"], "FAQPage");
      assert.strictEqual(node.mainEntity.length, content.faq.length);

      const html = realmSeoHtml(content);
      for (const [question] of content.faq) {
        const escaped = question.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        assert.ok(html.includes(escaped), `visible FAQ contains: ${question}`);
      }
      assert.ok(html.includes("related-realm-card"), "related realm cards render");
      assert.ok(html.includes("realm-disclaimer"), "entertainment disclaimer renders");
    }
  });
});
