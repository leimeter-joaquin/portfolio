# scripts

## Live location

The `Location` line in the hero follows wherever Joaquin's Mac last checked in
from, falling back to the static value in `content/src/markdown/site.md`.

How it fits together:

- `report-location.sh` POSTs to `/api/location` on the worker. The request
  carries no location data — Cloudflare resolves the city from the request's
  IP, so nothing is read off the machine and no coordinates are ever sent.
- The worker stores only `"city, country"` plus a timestamp in KV, and serves
  it from `GET /api/location`. Anything older than 14 days is treated as
  missing so the site reverts to the static location.
- The hero renders the static location server-side and swaps in the live one
  on the client. If the request fails, the static value stays.

### Setup

1. Create the token file (never committed):

   ```bash
   mkdir -p ~/.config/portfolio
   printf 'LOCATION_TOKEN=%s\n' "$(openssl rand -hex 32)" > ~/.config/portfolio/location.env
   chmod 600 ~/.config/portfolio/location.env
   ```

2. Give the worker the same token:

   ```bash
   cd server && . ~/.config/portfolio/location.env && \
     printf '%s' "$LOCATION_TOKEN" | npx wrangler secret put LOCATION_TOKEN
   ```

3. Schedule the hourly check-in:

   ```bash
   cp scripts/com.joaquinleimeter.portfolio-location.plist ~/Library/LaunchAgents/
   launchctl load ~/Library/LaunchAgents/com.joaquinleimeter.portfolio-location.plist
   ```

Run `./scripts/report-location.sh` to check in immediately. Errors land in
`~/.config/portfolio/location.log`; being offline is not an error, the worker
just keeps the previous value.

### Caveat

The city comes from the IP, so a VPN or an ISP that routes oddly will report
where the traffic exits rather than where the machine is.
