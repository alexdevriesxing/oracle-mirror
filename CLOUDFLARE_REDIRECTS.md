# Cloudflare Redirects

Oracle Mirror preserves the apex canonical host:

- Canonical host: `https://oraclemirror.com`
- Redirect source: `https://www.oraclemirror.com`
- Redirect target: same path and query on `https://oraclemirror.com`
- Status: `301`

The redirect is currently enforced in `src/index.ts` before API and asset handling. `wrangler.toml` includes both apex and `www` custom domains so the Worker can receive both hostnames and perform the redirect.

If this redirect is later moved to a Cloudflare Redirect Rule, keep the Worker behavior equivalent and preserve apex URLs in canonical tags, sitemap entries, and OpenGraph metadata.
