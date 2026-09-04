import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const hydrate = await readFile(new URL("../public/hydrate-shell.js", import.meta.url), "utf8");
const hardening = await readFile(new URL("../public/hardening.js", import.meta.url), "utf8");
const css = await readFile(new URL("../public/hardening.css", import.meta.url), "utf8");

test("hardening loads before the legacy application script", () => {
  const hardeningIndex = hydrate.indexOf('import("/hardening.js")');
  const appIndex = hydrate.indexOf('import("/script.js")');
  assert.ok(hardeningIndex >= 0);
  assert.ok(appIndex > hardeningIndex);
});

test("retired World Cup route is gone from early-navigation bootstrap", () => {
  assert.doesNotMatch(hydrate, /oracle-of-olympus/);
});

test("decorative particles are disabled for reduced-effect devices before app boot", () => {
  assert.match(hardening, /prefers-reduced-motion: reduce/);
  assert.match(hardening, /saveData/);
  assert.match(hardening, /pointer: coarse/);
  assert.match(hardening, /deviceMemory/);
  assert.match(hardening, /getElementById\("particles"\)\?\.remove\(\)/);
});

test("custom visual controls gain keyboard semantics and live regions", () => {
  assert.match(hardening, /\.fan-card/);
  assert.match(hardening, /\.love-pair-card/);
  assert.match(hardening, /\.planet-node/);
  assert.match(hardening, /\.palm-line/);
  assert.match(hardening, /setAttribute\("role", "button"\)/);
  assert.match(hardening, /event\.key !== "Enter"/);
  assert.match(hardening, /aria-live/);
});

test("keyboard focus and dropdown focus-within styles are present", () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /\.nav-dropdown:focus-within \.nav-dropdown-menu/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
