# Sambandha — Demo Runbook

Every command you need for the hackathon demo, in order.

**Primary path: Docker** (`docker compose up` — 4 containers, auto-seeded,
auto-trained). Requires Docker + Compose on the machine; the first build
needs internet (base images), afterwards everything runs offline.
**Fallback path:** local processes (section 12).

---

## 1. Prerequisites

```bash
docker --version              # Docker Engine 24+
docker compose version        # Compose v2
```

---

## 2. Build & start (one command)

```bash
cd sambandha-1
docker compose up -d --build
```

Starts:

| Service | Container | Host port |
|---|---|---|
| MongoDB 7 | `mongo` | 27017 |
| ML service (FastAPI/sklearn) | `ml` | 8000 |
| API server (Node/Express) | `api` | 5000 |
| Web client (nginx + built React) | `client` | 5173 |

On first boot the API container **auto-seeds** the demo data (users, 224
projects, ML records, engagement drafts, 27 priority votes) and the ML
service **auto-trains** from the DB.

Watch it come up:

```bash
docker compose logs -f api     # "seed check complete" then "MongoDB Connected"
docker compose ps              # all 4 "Up"
```

Open **http://localhost:5173**.

### Health checks (all should pass)

```bash
curl -s http://127.0.0.1:8000/health            # {"status":"ok","engine":"sklearn-python","trained":true}
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:5173/   # 200
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:5000/api/projects/stats  # 200 (public)
```

---

## 3. Reset to a clean demo state

```bash
docker compose down -v         # removes containers AND the database volume
docker compose up -d           # fresh DB, auto-seeded + auto-trained again
```

> Never reseed during the live demo — `down -v` wipes votes/comments.

---

## 4. Login accounts

| Role | Email | Password |
|---|---|---|
| Officer (simulator, dashboard) | `ram.sharma@moi.gov.np` | `password123` |
| Citizen (comments, votes) | `bishnu.ghimire@gmail.com` | `password123` |

Log in **before** judging starts — in two separate browser profiles
(officer view + citizen view).

---

## 5. Main demo flow (browser)

1. **Draft page** → open **Provincial Health Insurance Expansion Act**
   (health, Pokhara — 3 expert comments, 7 citizen feedbacks, 5 districts)
2. Scroll **"What your neighbors think"** — district approval bars
3. **Simulate** → watch: success probability (~0.99), claims forecast
   (~NPR 121k), jobs, confidence 89, 4 matched ledger projects,
   `engine: python` tags
4. **Budget slider 10 → 4 crore** → jobs/confidence drop visibly
5. **Province dropdown** → matches change (k-NN province penalty)
6. **Citizen profile**: add a Nepali comment → sentiment label appears;
   vote on the **priority board** (`/policies`) → ranking updates
7. **Tracking page** (`/tracking`) → 224 projects: status pie, province
   bars, delayed list

---

## 6. Live training demo (terminal, visible to judges)

Run from the host (works against the dockerized services — MongoDB is
reachable on `localhost:27017`, ML on `localhost:8000`).

```bash
cd sambandha-1/server
npm run train:python
```

Full pipeline in ~2s, prints:
- records exported live from MongoDB (198/224/400/224)
- gradient-descent loss curve `0.693 → 0.269`
- holdout accuracy 0.900 / AUC 0.889
- feature weights, per-program marginal table, claims R² 0.957 / MAE 15,153
- `POST /train` → service retrained, artifacts persisted, live prediction

Requires local Node deps (`cd server && npm install` once) — the venv for
the ML demo scripts is inside the `ml` container, so it needs no Python
install on the host.

**More dramatic version (blank-slate arc):**

```bash
docker compose exec ml rm -rf models       # wipe trained artifacts
docker compose restart ml
curl -s http://127.0.0.1:8000/health       # -> "trained": false

# Browser: run a simulation -> engine tags read "js-fallback" (app still works!)

cd sambandha-1/server && npm run train:python   # -> "trained": true

# Browser: simulate again -> "engine: python", identical numbers
```

---

## 7. Jupyter notebook pipeline (data-science deep-dive)

```bash
cd sambandha-1/server && npm run export:records  # -> ml-service/data/records.json
cd sambandha-1/ml-service && uv run jupyter notebook ml-pipeline.ipynb
# kernel: "Sambandha (ml-service)"  (one-time: uv run python -m ipykernel install --user --name sambandha)
```

Cells: loss curve chart, holdout metrics, per-program table, claims
scatter, k-NN projection demo; the final cell pushes models to the live
service (`POST /train`). Charts are already embedded in the saved
notebook, so it looks complete even without re-running.

---

## 8. Resilience demo (the "it never breaks" beat)

```bash
docker compose stop ml         # ML service down

# Browser: simulate -> app works, engine tags = "js-fallback"

docker compose start ml        # back up

# Browser: simulate again -> "engine: python" (recovers automatically)
```

---

## 9. API smoke test (if you want a curl fallback demo)

```bash
cd /tmp
curl -s -c cookies.txt -X POST http://127.0.0.1:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ram.sharma@moi.gov.np","password":"password123"}'

curl -s -b cookies.txt -X POST http://127.0.0.1:5000/api/simulate \
  -H "Content-Type: application/json" \
  -d '{"province":"Bagmati","sectorName":"Health & Nutrition","budget":10}' \
  | python3 -m json.tool | head -60
```

---

## 10. Troubleshooting

| Symptom | Fix |
|---|---|
| `/health` says `trained: false` | `docker compose exec ml rm -rf models && docker compose restart ml` then run `npm run train:python` (or restart `api` — it auto-warms on boot) |
| `docker compose up` fails on port | A local dev server holds 5000/8000/5173 — stop it or `docker compose stop` that stack and reuse |
| Code changed, containers still old | `docker compose up -d --build` (rebuilds changed images) |
| Seeded data looks stale | `docker compose down -v && docker compose up -d` (fresh DB) |
| API log: `projects.find() buffering timed out` | Mongo not ready at boot — entrypoint waits for it; check `docker compose ps` shows `mongo` healthy |
| Simulate numbers "wrong" vs walkthrough | Health budget clamps to **max 10 crore** in the API — use 4–10 crore on the slider |
| `npm run train:python` can't reach Mongo | Host needs the container's port — confirm `ss -tlnp \| rg 27017` or run `docker compose up -d` after the mongo `ports:` edit |
| Want logs | `docker compose logs -f api` / `-f ml` / `-f client` |

---

## 11. Time budget (3-minute demo)

| :00–:15 | Logged-in draft page, 5 districts consensus |
| :15–:45 | Simulate: probability, claims, jobs, confidence, matches |
| :45–:60 | Slider + province changes (numbers react) |
| 1:00–1:30 | Live training (`npm run train:python`) OR notebook chart |
| 1:30–2:15 | Priority board vote + tracking dashboard |
| 2:15–2:45 | Resilience: `docker compose stop ml`, fallback tag, `start ml` |
| 2:45–3:00 | Honesty beat: calibrated simulation framing, sources |

---

## 12. Fallback: run without Docker (local processes)

Only if Docker is unavailable on the demo machine.

```bash
# MongoDB (background daemon, or system service)
mongod --dbpath /var/lib/mongodb

# Terminal 1 — ML service
cd ml-service && uv sync && uv run uvicorn app.main:app --port 8000

# Terminal 2 — API server (needs server/.env with MONGO_URI, JWT_SECRET)
cd server && npm install && npm start
# boot log should include:
#   [ml-python] trained sklearn models: 198 policy / 224 budget / 400 claims records

# Terminal 3 — Web client
cd client && npm install && npm run dev   # open http://localhost:5173

# First boot only — seed the data:
cd server && npm run seed:sim && npm run seed:engagement && npm run seed:priorities
```

Health checks, demo flows and resilience beat (kill the uvicorn PID /
`pkill -f "uvicorn app.main"`) are identical to the Docker instructions.
