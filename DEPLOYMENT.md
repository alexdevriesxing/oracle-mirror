# Oracle Mirror deployment contract

**A push to `master` is the deployment trigger. Cloudflare is the deployment
engine. GitHub Actions is not required to deploy.**

Note the production branch is **`master`**, not `main`.

## Contract

| Field | Value |
|---|---|
| Repository | `alexdevriesxing/oracle-mirror` |
| Cloudflare Worker | `oracle-mirror` |
| Production domains | `oraclemirror.com`, `www.oraclemirror.com` |
| Production branch | `master` |
| Root directory | repository root |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Worker entry | `dist/index.js` |
| Static assets | `./public` (binding `ASSETS`, `run_worker_first`) |
| Node version | 22 |
| Deployment type | **Worker with static assets** — not Pages |
| Wrangler fallback | `npm run build && npx wrangler deploy` |

## Connect Git (Workers Builds)

This is a **Worker**, not a Pages project, so it connects through **Workers
Builds** rather than the Pages Git integration.

**Cloudflare Dashboard → Workers & Pages → `oracle-mirror` → Settings → Build
→ Connect to Git**

| Setting | Value |
|---|---|
| Repository | `alexdevriesxing/oracle-mirror` |
| Production branch | `master` |
| Root directory | *(empty — repository root)* |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Once connected, every push to `master` builds and deploys automatically.

## Bindings

From `wrangler.toml`, applied by `wrangler deploy`:

- **Workers AI** `AI`
- **KV** `ORACLE_KV`
- **Analytics Engine** `ANALYTICS` → dataset `oracle_mirror_events`
- **Version metadata** `CF_VERSION_METADATA`
- **Assets** `ASSETS` → `./public`

No scheduled trigger remains: the temporary World Cup / Oracle of Olympus
feature and its cron sync were removed in V2 Pass 2.

A Git-integration build applies the same `wrangler.toml`, so bindings match the
CLI path.

## Verifying a deployment

The Worker exposes its build commit:

```sh
curl -s https://oraclemirror.com/api/version
```

It should contain the deployed commit SHA. Compare against `master`.

Production convergence can take a few seconds after a deploy reports success.

Other checks worth running after a significant change:

```sh
curl -sI https://oraclemirror.com/ | grep -Ei 'x-content-type-options|referrer-policy'
curl -s -o /dev/null -w '%{http_code}\n' https://oraclemirror.com/runes                # expect 200
curl -s -o /dev/null -w '%{http_code}\n' https://oraclemirror.com/oracle-of-olympus    # expect 410
```

The removed Oracle of Olympus route must keep returning **410 Gone**, and the
homepage must not reintroduce World Cup content.

## Emergency fallback (Wrangler)

```sh
export CLOUDFLARE_API_TOKEN=...    # never commit
export CLOUDFLARE_ACCOUNT_ID=...
npm ci
npm run build
npx wrangler deploy
```

## Rollback

Cloudflare Dashboard → Workers & Pages → `oracle-mirror` → Deployments → a known
good version → Rollback. Otherwise `git revert <bad commit>` and push to
`master`, then re-check `/api/version`.

## GitHub Actions

`.github/workflows/deploy-cloudflare.yml` is a manual (`workflow_dispatch`)
fallback and is not the production path. It previously ran on `workflow_run`
after CI and was the only way this repository deployed.

Actions is currently budget-blocked on this account: runs end in about four
seconds with `steps: []` and "The job was not started because an Actions budget
is preventing further use". That is a billing setting at
https://github.com/settings/billing. Until Workers Builds is connected as above,
this repository has no automatic deployment path.

`v2-ci.yml` continues to report test health and does not gate deployment.
