import { DREAM_SYMBOLS, DREAM_THEME_META, dreamThemes, relatedDreamSymbols, symbolsForDreamTheme } from "./dream-library.ts";
import type { DreamLibrarySymbol } from "./dream-library.ts";

const HOST = "https://oraclemirror.com";
const CORE_SLUGS: Record<string, string> = { teeth: "teeth-falling-out", chased: "being-chased", naked: "being-naked", exam: "exams", lost: "being-lost", "flying-animals": "birds" };
const slugFor = (symbol: DreamLibrarySymbol) => CORE_SLUGS[symbol.symbol] ?? symbol.symbol;
const esc = (value: string) => value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

export function dreamLibrarySymbolSlugs(): string[] { return DREAM_SYMBOLS.map(slugFor); }
export function dreamLibraryThemeSlugs(): string[] { return Object.keys(DREAM_THEME_META); }
export function dreamLibraryGuidePath(symbolId: string): string {
  const symbol = DREAM_SYMBOLS.find((item) => item.symbol === symbolId);
  return `/dreams/${symbol ? slugFor(symbol) : symbolId}`;
}

const bySlug = new Map(DREAM_SYMBOLS.map((symbol) => [slugFor(symbol), symbol]));
const DISCLAIMER = "Dream interpretation is reflective and symbolic, not a diagnosis, clinical assessment, supernatural proof, or prediction. Personal associations and emotional context matter more than any dictionary entry.";

function jsonLd(node: object): string { return `<script type="application/ld+json">${JSON.stringify(node)}</script>`; }
function crumbs(items: Array<[string,string]>): object { return { "@context":"https://schema.org", "@type":"BreadcrumbList", itemListElement: items.map(([name,item],i)=>({"@type":"ListItem",position:i+1,name,item})) }; }
function article(title: string, description: string, path: string): object { return { "@context":"https://schema.org", "@type":"Article", headline:title, description, mainEntityOfPage:`${HOST}${path}`, inLanguage:"en", author:{"@type":"Organization",name:"Oracle Mirror"}, publisher:{"@type":"Organization",name:"Oracle Mirror"} }; }
function shell(path:string,title:string,description:string,body:string,schema:object[]):string {
  const canonical=`${HOST}${path}`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="${canonical}"><link rel="icon" href="/favicon.svg"><meta name="theme-color" content="#05030d"><meta property="og:type" content="article"><meta property="og:site_name" content="Oracle Mirror"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${HOST}/og-image.png"><meta name="twitter:card" content="summary_large_image"><link rel="stylesheet" href="/styles.css">${schema.map(jsonLd).join("\n")}</head><body class="guide-body"><header><nav class="nav-container"><a href="/" class="nav-logo"><span class="logo-icon">☾</span><span class="logo-text">Oracle Mirror</span></a><div class="guide-nav"><a href="/dreams">Dream Library</a><a href="/dreams/themes">Themes</a><a href="/dream-interpreter">Dream Interpreter</a></div></nav></header><main class="guide-main">${body}<p class="realm-disclaimer">${esc(DISCLAIMER)}</p></main><footer><div class="footer-links"><a href="/privacy-policy">Privacy</a><a href="/contact">Contact</a><a href="/">All Realms</a></div><p class="footer-copy">© 2026 Oracle Mirror. Entertainment and reflection only.</p></footer></body></html>`;
}

function symbolCard(symbol: DreamLibrarySymbol): string { return `<a class="related-realm-card" href="/dreams/${slugFor(symbol)}"><strong>${esc(symbol.title)}</strong><span>${esc(symbol.meaning)}</span></a>`; }

export function renderDreamLibraryHub(): string {
  const themes=dreamThemes();
  const sections=themes.map((theme)=>{ const sample=symbolsForDreamTheme(theme.slug).slice(0,8); return `<section><div class="overview-kicker">${theme.count} symbols</div><h2><a href="/dreams/themes/${theme.slug}">${esc(theme.title)}</a></h2><p>${esc(theme.description)}</p><div class="related-realms guide-related">${sample.map(symbolCard).join("")}</div><p class="guide-hub-link"><a href="/dreams/themes/${theme.slug}">Explore all ${esc(theme.title)} dreams →</a></p></section>`; }).join("");
  const body=`<article class="guide-article"><h1>Dream Dictionary: ${DREAM_SYMBOLS.length} Symbols & Meanings</h1><section class="guide-short-answer"><p class="overview-kicker">Answer first</p><p class="guide-answer-text">Dream symbols do not have one universal meaning. Use this library to compare emotional, Jungian-style, psychodynamic, and cultural lenses, then test them against your own associations and waking context.</p></section><section><h2>Browse Dream Themes</h2><p>The library is organized semantically so related symbols sit together instead of being linked by arbitrary alphabet or database position.</p></section>${sections}<section class="guide-cta"><h2>Interpret a Whole Dream</h2><p>Morpheus can use this expanded symbol corpus as optional grounding while asking clarifying questions about your actual dream.</p><a class="btn-gold guide-cta-btn" href="/dream-interpreter">Open Dream Interpreter</a></section></article>`;
  return shell("/dreams",`Dream Dictionary — ${DREAM_SYMBOLS.length} Symbols & Meanings | Oracle Mirror`, `Explore ${DREAM_SYMBOLS.length} dream symbols organized into ten themes, with reflective meanings and links to Oracle Mirror's Dream Interpreter.`, body,[{"@context":"https://schema.org","@type":"CollectionPage",name:"Oracle Mirror Dream Dictionary",url:`${HOST}/dreams`,numberOfItems:DREAM_SYMBOLS.length},{"@context":"https://schema.org","@type":"ItemList",numberOfItems:themes.length,itemListElement:themes.map((t,i)=>({"@type":"ListItem",position:i+1,name:t.title,url:`${HOST}/dreams/themes/${t.slug}`}))}]);
}

export function renderDreamThemesHub(): string {
  const themes=dreamThemes();
  const body=`<article class="guide-article"><nav class="guide-breadcrumbs"><a href="/dreams">Dreams</a> › Themes</nav><h1>Dream Themes</h1><section class="guide-short-answer"><p class="guide-answer-text">Theme hubs group symbols by the kind of waking-life concern they often evoke: relationships, places, nature, body, travel, nightmares, work, mystical imagery, objects, and animals.</p></section><div class="overview-grid">${themes.map(t=>`<a class="overview-item" href="/dreams/themes/${t.slug}"><h2>${esc(t.title)}</h2><p>${esc(t.description)}</p><strong>${t.count} symbols</strong></a>`).join("")}</div></article>`;
  return shell("/dreams/themes","Dream Themes — Browse the Dream Dictionary | Oracle Mirror","Browse Oracle Mirror dream symbols by ten semantic themes.",body,[{"@context":"https://schema.org","@type":"CollectionPage",name:"Dream Themes",url:`${HOST}/dreams/themes`},crumbs([["Oracle Mirror",HOST],["Dreams",`${HOST}/dreams`],["Themes",`${HOST}/dreams/themes`]])]);
}

export function renderDreamThemePage(themeSlug: string): string | undefined {
  const meta=(DREAM_THEME_META as Record<string,{title:string;description:string}>)[themeSlug]; if(!meta) return undefined;
  const symbols=symbolsForDreamTheme(themeSlug);
  const path=`/dreams/themes/${themeSlug}`;
  const body=`<article class="guide-article"><nav class="guide-breadcrumbs"><a href="/dreams">Dreams</a> › <a href="/dreams/themes">Themes</a> › ${esc(meta.title)}</nav><h1>${esc(meta.title)} Dream Meanings</h1><section class="guide-short-answer"><p class="guide-answer-text">${esc(meta.description)}</p></section><p>These ${symbols.length} entries are interpretive prompts, not fixed codes. Compare the image with your own associations, the emotion of the dream, and what was happening before sleep.</p><div class="related-realms guide-related">${symbols.map(symbolCard).join("")}</div></article>`;
  return shell(path,`${meta.title} Dream Meanings | Oracle Mirror`,`${meta.description} Browse ${symbols.length} related dream-symbol guides.`,body,[{"@context":"https://schema.org","@type":"CollectionPage",name:`${meta.title} Dream Meanings`,url:`${HOST}${path}`,numberOfItems:symbols.length},{"@context":"https://schema.org","@type":"ItemList",numberOfItems:symbols.length,itemListElement:symbols.map((s,i)=>({"@type":"ListItem",position:i+1,name:s.title,url:`${HOST}/dreams/${slugFor(s)}`}))},crumbs([["Oracle Mirror",HOST],["Dreams",`${HOST}/dreams`],["Themes",`${HOST}/dreams/themes`],[meta.title,`${HOST}${path}`]])]);
}

export function renderDreamLibrarySymbolPage(slug: string): string | undefined {
  const symbol=bySlug.get(slug); if(!symbol) return undefined;
  const path=`/dreams/${slug}`; const related=relatedDreamSymbols(symbol,6); const theme=(DREAM_THEME_META as Record<string,{title:string}>)[symbol.category];
  const body=`<article class="guide-article"><nav class="guide-breadcrumbs"><a href="/dreams">Dreams</a> › <a href="/dreams/themes/${symbol.category}">${esc(theme.title)}</a> › ${esc(symbol.title)}</nav><h1>${esc(symbol.title)} Dream Meaning</h1><section class="guide-short-answer"><p class="overview-kicker">Short answer</p><p class="guide-answer-text">${esc(symbol.meaning)}</p></section><section><h2>Four Ways to Read This Symbol</h2><div class="overview-grid"><article class="overview-item"><h3>Emotional context</h3><p>${esc(symbol.frameworks.emotional)}</p></article><article class="overview-item"><h3>Jungian-style lens</h3><p>${esc(symbol.frameworks.jungian)}</p></article><article class="overview-item"><h3>Psychodynamic / Freudian lens</h3><p>${esc(symbol.frameworks.freudian)}</p></article><article class="overview-item"><h3>Culture & folklore</h3><p>${esc(symbol.frameworks.cultural)}</p></article></div></section><section><h2>Questions to Ask Yourself</h2><ul class="guide-question-list">${symbol.questionHints.map(q=>`<li>${esc(q)}</li>`).join("")}<li>What was happening in waking life before this dream?</li></ul></section><section><h2>Related ${esc(theme.title)} Symbols</h2><div class="related-realms guide-related">${related.map(symbolCard).join("")}</div></section><section class="guide-cta"><h2>Interpret the Whole Dream</h2><p>A single symbol is only one thread. Morpheus uses the broader dream context and asks clarifying questions before offering a reading.</p><a class="btn-gold guide-cta-btn" href="/dream-interpreter">Interpret My Dream</a></section></article>`;
  return shell(path,`${symbol.title} Dream Meaning & Interpretation | Oracle Mirror`,`${symbol.meaning} Compare emotional, Jungian-style, psychodynamic, and cultural lenses.`,body,[article(`${symbol.title} Dream Meaning`,symbol.meaning,path),crumbs([["Oracle Mirror",HOST],["Dreams",`${HOST}/dreams`],[theme.title,`${HOST}/dreams/themes/${symbol.category}`],[symbol.title,`${HOST}${path}`]])]);
}

export function handleDreamLibraryRoute(pathname: string): Response | undefined {
  const path=pathname.length>1&&pathname.endsWith("/")?pathname.slice(0,-1):pathname;
  let html:string|undefined;
  if(path==="/dreams") html=renderDreamLibraryHub();
  else if(path==="/dreams/themes") html=renderDreamThemesHub();
  else if(path.startsWith("/dreams/themes/")) html=renderDreamThemePage(path.slice("/dreams/themes/".length));
  else if(path.startsWith("/dreams/")) html=renderDreamLibrarySymbolPage(path.slice("/dreams/".length));
  if(!html) return undefined;
  return new Response(html,{status:200,headers:{"Content-Type":"text/html; charset=UTF-8","Cache-Control":"public, max-age=3600"}});
}

export function dreamLibrarySitemapUrls(): string[] { return ["/dreams","/dreams/themes",...dreamLibraryThemeSlugs().map(s=>`/dreams/themes/${s}`),...dreamLibrarySymbolSlugs().map(s=>`/dreams/${s}`)]; }
export function augmentSitemapWithDreamLibrary(xml:string):string { const urls=dreamLibrarySitemapUrls().filter(path=>!xml.includes(`<loc>${HOST}${path}</loc>`)).map(path=>`  <url><loc>${HOST}${path}</loc><changefreq>monthly</changefreq><priority>${path==="/dreams"?"0.8":"0.6"}</priority></url>`).join("\n"); return urls?xml.replace("</urlset>",`${urls}\n</urlset>`):xml; }
export function augmentLlmsWithDreamLibrary(text:string):string { if(text.includes("## Expanded Dream Library")) return text; return `${text.trimEnd()}\n\n## Expanded Dream Library\n- ${HOST}/dreams — ${DREAM_SYMBOLS.length}-symbol dream dictionary organized into ten semantic themes.\n- ${HOST}/dreams/themes — theme index for animals, relationships, places, nature, objects, body, travel, nightmares, work/success, and mystical imagery.\n- ${HOST}/dreams/{symbol} — individual symbolic guides that distinguish reflective interpretation from diagnosis or prediction.\n`; }
