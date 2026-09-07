import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { HAND_SHAPES,PALM_DIGITS,PALM_GUIDES,PALM_LINES,PALM_MARKINGS,PALM_MOUNTS } from "../src/palmistry-data.ts";
import { augmentLlmsWithPalmistry,augmentSitemapWithPalmistry,handleAdvancedPalmistryRoute,injectPalmistryDiscovery,isAdvancedPalmistryRoute,palmistrySitemapUrls } from "../src/palmistry-pages.ts";

const css=await readFile(new URL("../public/palmistry.css",import.meta.url),"utf8");
const v2=await readFile(new URL("../src/v2-index.ts",import.meta.url),"utf8");

test("palmistry corpus covers lines, elemental hands, mounts, digits, markings, and core guides",()=>{
 assert.equal(PALM_LINES.length,9);assert.equal(HAND_SHAPES.length,4);assert.equal(PALM_MOUNTS.length,7);assert.equal(PALM_DIGITS.length,6);assert.equal(PALM_MARKINGS.length,8);assert.equal(PALM_GUIDES.length,5);
 for(const group of [PALM_LINES,HAND_SHAPES,PALM_MOUNTS,PALM_DIGITS,PALM_MARKINGS]){assert.equal(new Set(group.map(x=>x.slug)).size,group.length);for(const x of group){assert.ok(x.summary.length>70);assert.ok(x.tradition.length>70);assert.ok(x.reflection.length>50);}}
});

test("Advanced Palmistry hub is standalone, indexed, and explicit about scientific limits",async()=>{
 const response=handleAdvancedPalmistryRoute("/palmistry");assert.equal(response.status,200);const html=await response.text();
 assert.match(html,/Advanced Palmistry/);assert.match(html,/45-page palmistry library/);assert.match(html,/symbolic interpretive tradition/);assert.match(html,/dermatoglyphics/i);assert.match(html,/not as science/);assert.match(html,/canonical/);
});

test("Life Line page rejects lifespan prediction and medical determinism",async()=>{
 const html=await handleAdvancedPalmistryRoute("/palmistry/lines/life-line").text();assert.match(html,/Life Line/);assert.match(html,/not lifespan/i);assert.match(html,/rejects the frightening claim/i);assert.match(html,/does not scientifically establish personality, health, lifespan/);assert.match(html,/BreadcrumbList/);
});

test("Mercury and finger pages reject health and biometric overclaiming",async()=>{
 const mercury=await handleAdvancedPalmistryRoute("/palmistry/mounts/mercury").text();assert.match(mercury,/does not use palm features to diagnose health/);
 const ring=await handleAdvancedPalmistryRoute("/palmistry/fingers/ring-finger").text();assert.match(ring,/does not infer hormones, sexuality, intelligence, or medical traits/);
});

test("science, history, left-right, method, and ethics guides contain the promised distinctions",async()=>{
 const science=await handleAdvancedPalmistryRoute("/palmistry/science").text();assert.match(science,/has not demonstrated reliable predictive/);assert.match(science,/Dermatoglyphics is not palmistry/);
 const history=await handleAdvancedPalmistryRoute("/palmistry/history").text();assert.match(history,/medieval sources/);assert.match(history,/pseudo-Aristotelian/);
 const hands=await handleAdvancedPalmistryRoute("/palmistry/left-right-hands").text();assert.match(hands,/does not impose gender-based hand rules/);
 const method=await handleAdvancedPalmistryRoute("/palmistry/how-to-read-palm").text();assert.match(method,/Observe both hands/);assert.match(method,/Turn recurring symbolic themes into questions, not predictions/);
 const ethics=await handleAdvancedPalmistryRoute("/palmistry/ethics").text();assert.match(ethics,/Do not predict death/);assert.match(ethics,/preserve the seeker's agency/);
});

test("every palmistry detail route renders and the sitemap adds exactly 45 canonical URLs",async()=>{
 const urls=palmistrySitemapUrls();assert.equal(urls.length,45);assert.equal(new Set(urls).size,45);
 for(const path of urls){const response=handleAdvancedPalmistryRoute(path);assert.equal(response.status,200,path);const html=await response.text();assert.match(html,/Oracle Mirror/);}
 const base='<?xml version="1.0"?><urlset><url><loc>https://oraclemirror.com/</loc></url></urlset>';const expanded=augmentSitemapWithPalmistry(base);assert.equal((expanded.match(/<loc>https:\/\/oraclemirror\.com\/palmistry(?:<|\/)/g)||[]).length,45);assert.equal(augmentSitemapWithPalmistry(expanded),expanded);
});

test("homepage and llms discovery are idempotent and route through V2",()=>{
 const sample='<a href="/palm-reading" class="dropdown-item" data-nav="palmistry">&#9995; Palmistry</a><a href="/palm-reading" class="card card-palmistry" data-realm="palmistry">';const injected=injectPalmistryDiscovery(sample);assert.match(injected,/href="\/palmistry"/);assert.equal(injectPalmistryDiscovery(injected),injected);
 const llms=augmentLlmsWithPalmistry("# Oracle Mirror\n");assert.match(llms,/## Advanced Palmistry/);assert.match(llms,/palmistry\/science/);assert.equal(augmentLlmsWithPalmistry(llms),llms);
 assert.ok(isAdvancedPalmistryRoute("/palmistry"));assert.ok(isAdvancedPalmistryRoute("/palmistry/markings/stars"));assert.match(v2,/handleAdvancedPalmistryRoute/);assert.match(v2,/augmentSitemapWithPalmistry/);
});

test("reference experience requires no feature JavaScript or API calls",async()=>{
 const html=await handleAdvancedPalmistryRoute("/palmistry/how-to-read-palm").text();assert.doesNotMatch(html,/fetch\(|\/api\//);assert.doesNotMatch(html,/localStorage|sessionStorage|camera|getUserMedia/);assert.match(css,/prefers-reduced-motion/);
});

test("unknown advanced palmistry routes return 404",()=>{
 assert.equal(handleAdvancedPalmistryRoute("/palmistry/lines/not-real").status,404);assert.equal(handleAdvancedPalmistryRoute("/palmistry/mounts/not-real").status,404);assert.equal(handleAdvancedPalmistryRoute("/palmistry/not-real").status,404);
});
