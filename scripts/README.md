# scripts

## Live location

The `Location` line in the hero follows wherever Joaquin's Mac last checked in
from, falling back to the static value in `content/src/markdown/site.md`.

This half of the feature lives here; the machine half lives in the dotfiles repo
at `macos/portfolio-location/`, so a new machine gets it from
`./macos/setup/link-configs.sh` without needing this repo cloned at all.

How it fits together:

- The dotfiles agent POSTs hourly to `/api/location`. The request carries no
  location data — Cloudflare resolves the city from its IP, so nothing is read
  off the machine and no coordinates are ever sent.
- The worker (`server/src/index.ts`) stores only `"city, country"` plus a
  timestamp in KV, behind a bearer token, and serves it from
  `GET /api/location`. Anything older than 14 days is reported as missing so the
  site reverts to the static location.
- The hero renders the static location server-side and swaps in the live one on
  the client. If the request fails, the static value stays.

The token is shared between the machine and the worker, lives outside both repos
in `~/.config/portfolio/location.env`, and is set on the worker with:

```bash
cd server && . ~/.config/portfolio/location.env && \
  printf '%s' "$LOCATION_TOKEN" | npx wrangler secret put LOCATION_TOKEN
```

Setup and troubleshooting for the agent itself are in the dotfiles repo:
`macos/portfolio-location/README.md`.

### Caveat

The city comes from the IP, so a VPN or an ISP that routes traffic through
another country reports where the traffic exits, not where the machine is.
