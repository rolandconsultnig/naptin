#!/usr/bin/env bash
# Run ON the production server from repo root (e.g. /opt/naptin).
# Helps debug: Owl on 4003, Node API on 4002, vite preview on 4001, manifest content-type.

set -euo pipefail
ROOT="${1:-.}"
cd "$ROOT"

echo "== Repo root = $(pwd)"
echo "== PM2 =="
command -v pm2 >/dev/null && pm2 list || echo "(pm2 not found)"

echo "== Listen (4001/4002/4003) =="
if command -v ss >/dev/null; then
  ss -tlnp | grep -E ':400[123]\b' || echo "(nothing listening on 4001-4003)"
else
  netstat -tlnp 2>/dev/null | grep -E ':400[123]' || echo "(install iproute2 or net-tools)"
fi

echo "== Local HTTP =="
for url in \
  'http://127.0.0.1:4002/api/v1/health' \
  'http://127.0.0.1:4003/health'
do
  code=$(curl -sS -o /tmp/naptin_chk_body -w '%{http_code}' "$url" || echo "ERR")
  echo "  $url -> HTTP $code"
  head -c 120 /tmp/naptin_chk_body 2>/dev/null | tr '\n' ' '
  echo
done

echo "== manifest.webmanifest (via 4001 if preview up) =="
code=$(curl -sS -o /tmp/naptin_mf -w '%{http_code}' 'http://127.0.0.1:4001/manifest.webmanifest' || echo "ERR")
echo "  HTTP $code"
head -c 1 /tmp/naptin_mf 2>/dev/null | od -An -tx1 | head -1
if head -c 1 /tmp/naptin_mf 2>/dev/null | grep -q '{'; then
  echo "  First byte looks like JSON — OK"
else
  echo "  First byte is NOT '{'. If it is 3c (<) you got HTML (SPA fallback or error page)."
fi

echo "== Done =="
