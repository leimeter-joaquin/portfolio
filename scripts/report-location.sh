#!/bin/bash
# Check in this machine's city to the portfolio worker.
#
# Cloudflare resolves the city from this request's IP, so nothing is read from
# the machine itself and no coordinates are sent. The worker stores only
# "city, country".
#
# Config lives outside the repo so the token is never committed:
#   ~/.config/portfolio/location.env  ->  LOCATION_TOKEN=...
#
# Run manually with:  ./scripts/report-location.sh

set -euo pipefail

CONFIG="${HOME}/.config/portfolio/location.env"
API="${PORTFOLIO_API_URL:-https://portfolio-server.leimeter-joaquin.workers.dev}"

if [ ! -f "$CONFIG" ]; then
  echo "missing $CONFIG (needs LOCATION_TOKEN=...)" >&2
  exit 1
fi

# shellcheck source=/dev/null
. "$CONFIG"

if [ -z "${LOCATION_TOKEN:-}" ]; then
  echo "LOCATION_TOKEN not set in $CONFIG" >&2
  exit 1
fi

# Offline or captive portal: skip quietly, the worker keeps the last value.
curl -fsS --max-time 15 \
  -X POST "${API}/api/location" \
  -H "Authorization: Bearer ${LOCATION_TOKEN}" \
  -H "Content-Length: 0" \
  || exit 0
