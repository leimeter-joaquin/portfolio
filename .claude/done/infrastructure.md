# Feature: Infrastructure — Cloudflare + Terraform

## Goal

Deploy the full portfolio (Astro frontend + Hono API server) to Cloudflare's free tier, with all infrastructure defined as code in Terraform.

## Scope

**Included:**

- Cloudflare Pages project for the Astro frontend
- Cloudflare Worker for the Hono API server (migrated from `@hono/node-server`)
- Cloudflare KV namespace for IP-based rate limiting (replaces in-memory Map)
- Terraform config managing all of the above
- Environment variable wiring (`OPEN_ROUTER_API_KEY`, `APP_ORIGIN`, KV binding)
- GitHub Actions CI/CD pipeline that runs `terraform apply` + triggers Pages deploy on push to `main`

**Out of scope:**

- Custom domain (can be added later as a separate spec)
- DNS management (only relevant once a domain exists)
- Staging/preview environments

## Architecture

```
GitHub (main branch)
  │
  ├── GitHub Actions
  │     ├── npm run build (content → app → server)
  │     ├── terraform apply (infra changes)
  │     └── wrangler deploy (Worker)
  │
  ├── Cloudflare Pages  ──── Astro static site
  │     └── PUBLIC_API_URL = https://<worker>.workers.dev
  │
  └── Cloudflare Worker ──── Hono API (/api/ask)
        └── KV binding: RATE_LIMIT
```

## Server migration: Node.js → Workers

Hono supports Cloudflare Workers natively. Changes needed in `server/`:

1. Remove `@hono/node-server` dependency
2. Export `app` as the default Workers handler instead of calling `serve()`
3. Replace `Map<string, number>` rate limit store with Cloudflare KV reads/writes
4. Update `server/tsconfig.json` to target Workers runtime types (`@cloudflare/workers-types`)

The `getConnInfo` IP detection is replaced by reading `request.headers.get("cf-connecting-ip")`, which Cloudflare injects automatically.

## Terraform layout

```
infra/
├── main.tf           # provider config, backend
├── variables.tf      # cloudflare_account_id, api_token, etc.
├── pages.tf          # cloudflare_pages_project
├── worker.tf         # cloudflare_worker_script, cloudflare_worker_route
├── kv.tf             # cloudflare_kv_namespace
└── outputs.tf        # worker URL, pages URL
```

State is stored in Terraform Cloud (free tier) or locally (`.tfstate` gitignored).

## Environment variables needed

| Where                      | Variable                | Value                                 |
| -------------------------- | ----------------------- | ------------------------------------- |
| Local dev                  | `CLOUDFLARE_API_TOKEN`  | Scoped API token (see below)          |
| Local dev                  | `CLOUDFLARE_ACCOUNT_ID` | Found in Cloudflare dashboard sidebar |
| GitHub Actions secret      | `CLOUDFLARE_API_TOKEN`  | Same token                            |
| GitHub Actions secret      | `CLOUDFLARE_ACCOUNT_ID` | Same account ID                       |
| Worker env (via Terraform) | `OPEN_ROUTER_API_KEY`   | OpenRouter key                        |
| Pages env (via Terraform)  | `PUBLIC_API_URL`        | `https://<worker>.workers.dev`        |

## Cloudflare setup (one-time, manual)

1. Create a free account at cloudflare.com
2. Go to **My Profile → API Tokens → Create Token**
3. Use the **"Edit Cloudflare Workers"** template, then add:
   - `Cloudflare Pages:Edit`
   - `Workers KV Storage:Edit`
   - `Account Settings:Read` (needed by Terraform provider)
4. Copy the token — it's shown only once
5. Find your **Account ID** in the dashboard URL or right sidebar on the Workers & Pages overview page

## Constraints

- Keep the Hono app logic identical — only the adapter and KV integration change
- KV writes are eventually consistent; this is fine for rate limiting (slight over-counting is acceptable)
- Workers free tier: 100k requests/day, 10ms CPU/request — sufficient for a portfolio
- KV free tier: 100k reads/day, 1k writes/day — at 5 requests/IP max, this handles ~200 unique visitors/day before hitting limits

## Acceptance criteria

- [ ] `terraform apply` from a clean state provisions all Cloudflare resources
- [ ] `wrangler deploy` (or CI) deploys the Worker and it responds to `POST /api/ask`
- [ ] Astro site is live on Cloudflare Pages and calls the Worker correctly
- [ ] Rate limiting works end-to-end (KV-backed, survives Worker restarts)
- [ ] `OPEN_ROUTER_API_KEY` is set as an encrypted Worker secret, not in plain Terraform state
- [ ] All infra changes on `main` are applied automatically via GitHub Actions
