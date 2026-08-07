#!/bin/sh
set -e

echo "[entrypoint] waiting for the ML service..."
node -e '
const url = process.env.ML_SERVICE_URL || "http://ml:8000";
let tries = 0;
(async () => {
  while (tries < 30) {
    tries += 1;
    try {
      const r = await fetch(url + "/health");
      if (r.ok) { console.log("[entrypoint] ML service ready"); process.exit(0); }
    } catch {}
    await new Promise((res) => setTimeout(res, 1000));
  }
  console.log("[entrypoint] ML service not ready after 30s — starting anyway (js-fallback)");
  process.exit(0);
})();
'

echo "[entrypoint] ensuring demo data..."
node scripts/seedIfEmpty.js

echo "[entrypoint] starting API server..."
exec node server.js
