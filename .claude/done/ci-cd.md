# Feature: CI/CD Pipeline — Auto-deploy on push to main

## Goal

Every push to `main` automatically builds and deploys the full portfolio (content → app → worker) to Cloudflare, with no manual steps.

## Current state

`.github/workflows/deploy.yml` exists and is structurally correct, but the pipeline cannot run end-to-end yet because:

1. **API token is missing `Workers Scripts:Edit`** — `wrangler deploy` fails with auth error 10000
2. **GitHub Actions secrets not set** — `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are referenced but not stored in the repo
3. **`PUBLIC_API_URL` not passed at build time** — the app is built without the env var, so the chat widget falls back to `localhost:3001` in production
4. **Terraform is not in CI** — infra changes require a manual `terraform apply` locally

## Scope

**Included:**

- Fix the Cloudflare API token permissions
- Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to GitHub Actions secrets
- Pass `PUBLIC_API_URL` as an env var during the app build step
- Add a `terraform apply` step to the pipeline so infra stays in sync with code

**Out of scope:**

- PR preview deployments
- Separate staging environment
- Slack/email notifications

## Pipeline design

```
push to main
  │
  ├── 1. Install deps (npm ci)
  ├── 2. Build content (npm run build -w content)
  ├── 3. Build app (PUBLIC_API_URL=<worker-url> npm run build -w app)
  ├── 4. Terraform apply (infra changes only — idempotent)
  ├── 5. Deploy Worker (npx wrangler deploy)
  └── 6. Deploy Pages (npx wrangler pages deploy dist --project-name=portfolio-app)
```

Steps 4–6 need `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Terraform also needs them passed as `-var` flags.

## What needs to change

### 1. Fix the API token (Cloudflare dashboard)

Edit the existing token at `dash.cloudflare.com` → My Profile → API Tokens:

Required permissions (all at Account level):

- `Workers Scripts: Edit`
- `Workers KV Storage: Edit`
- `Cloudflare Pages: Edit`
- `Account Settings: Read`

### 2. Add GitHub Actions secrets

In the GitHub repo → Settings → Secrets and variables → Actions:

| Secret name                   | Value                              |
| ----------------------------- | ---------------------------------- |
| `CLOUDFLARE_API_TOKEN`        | The fixed API token                |
| `CLOUDFLARE_ACCOUNT_ID`       | `da26dbdf33968c1557b318037912e6bc` |
| `TF_VAR_cloudflare_api_token` | Same token (for Terraform)         |

### 3. Update `.github/workflows/deploy.yml`

- Add `PUBLIC_API_URL` env var to the app build step
- Add a Terraform apply step before wrangler deploys
- Set `working-directory: infra` for the Terraform step

### 4. Terraform backend (optional but recommended)

Currently state is local (`infra/terraform.tfstate`, gitignored). For CI to apply Terraform, state must be accessible to the runner. Options:

- **Terraform Cloud** free tier — remote state, no setup beyond adding a `cloud {}` block and a `TF_TOKEN_app_terraform_io` secret
- **Cloudflare R2** — S3-compatible backend, free tier, stays in Cloudflare ecosystem

This is required for the Terraform step to work in CI. Without it, skip the Terraform step and only run it locally on infra changes.

## Acceptance criteria

- [ ] Push to `main` triggers the workflow
- [ ] All 6 steps complete without errors
- [ ] `https://portfolio-app-26n.pages.dev` reflects the latest code within ~2 minutes of push
- [ ] `https://portfolio-server.leimeter-joaquin.workers.dev/api/ask` returns answers after deploy
- [ ] Chat widget on the deployed Pages site calls the Worker correctly (not localhost)
- [ ] No manual `wrangler deploy` or `wrangler pages deploy` needed after setup
