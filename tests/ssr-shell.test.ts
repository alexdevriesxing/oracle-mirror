import test from "node:test";
import assert from "node:assert/strict";
import {
  pageSectionIdForPath,
  pruneAppShellToPage,
  replaceMainClientWithHydrator,
} from "../src/ssr-shell.ts";

const fixture = `<!DOCTYPE html>
<html>
  <head><title>Oracle Mirror</title></head>
  <body>
    <header>Shared Header</header>
    <main id="page-home" class="page active"><h1>Home realm grid</h1></main>
    <section id="page-crystal-ball" class="page realm-page"><h2>Crystal Ball Only</h2></section>
    <section id="page-tarot" class="page realm-page"><h2>Tarot Only</h2></section>
    <section id="page-love-match" class="page realm-page"><h2>Love Match Only</h2></section>
    <aside class="oracle-ad oracle-ad-footer">Footer ad</aside>
    <footer>Shared Footer</footer>
    <script src="/script.js" type="module"></script>
  </body>
</html>`;

test("maps public and result routes to their top-level page section", () => {
  assert.equal(pageSectionIdForPath("/"), "page-home");
  assert.equal(pageSectionIdForPath("/tarot"), "page-tarot");
  assert.equal(pageSectionIdForPath("/love-oracle"), "page-love-match");
  assert.equal(pageSectionIdForPath("/result/love-oracle"), "page-love-match");
  assert.equal(pageSectionIdForPath("/result/tarot"), "page-tarot");
  assert.equal(pageSectionIdForPath("/dreams/falling"), null);
});

test("prunes unrelated app pages but preserves shared chrome", () => {
  const html = pruneAppShellToPage(fixture, "page-tarot");

  assert.match(html, /Tarot Only/);
  assert.doesNotMatch(html, /Home realm grid/);
  assert.doesNotMatch(html, /Crystal Ball Only/);
  assert.doesNotMatch(html, /Love Match Only/);
  assert.match(html, /Shared Header/);
  assert.match(html, /Shared Footer/);
  assert.match(html, /Footer ad/);
  assert.match(html, /data-ssr-page="page-tarot"/);
});

test("homepage SSR contains only the homepage application page", () => {
  const html = pruneAppShellToPage(fixture, "page-home");
  assert.match(html, /Home realm grid/);
  assert.doesNotMatch(html, /Tarot Only/);
  assert.doesNotMatch(html, /Crystal Ball Only/);
  assert.match(html, /Shared Footer/);
});

test("keeps the original shell unchanged when requested page is unavailable", () => {
  assert.equal(pruneAppShellToPage(fixture, "page-missing"), fixture);
});

test("replaces the monolithic client entry with the shell hydrator", () => {
  const html = replaceMainClientWithHydrator(fixture);
  assert.match(html, /src="\/hydrate-shell\.js"/);
  assert.doesNotMatch(html, /src="\/script\.js" type="module"/);
});
