# M7.1 Rune Realm — Acceptance Gate

Verified on the final feature branch before PR:

- Elder Futhark server corpus: 24 unique runes.
- Client casting corpus: 24 matching unique runes.
- Three-rune cast: exactly three distinct runes in Root / Present / Path Ahead order.
- Public SEO surface: `/runes` plus 24 `/runes/:slug` meaning pages.
- Unknown rune slugs: 404.
- Structured data: WebApplication + ItemList on hub; Article + BreadcrumbList on meanings.
- Sitemap: 25 idempotently injected rune URLs.
- AI discovery: Rune Casting entry appended to `llms.txt`.
- Homepage discovery: Realms menu + realm card inserted in SSR HTML.
- Legacy-router safeguard: homepage rune card deliberately has no `data-realm` attribute.
- Privacy: no question or personal data requested; casting has no feature API/AI call.
- Sharing: only generated rune names and position labels survive sanitizer.
- Accessibility/performance: native controls, live result region, responsive CSS, reduced-motion support.
- CI gate: dependency security, typecheck, full tests, production build all pass.
