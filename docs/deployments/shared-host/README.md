# Deploying the new (Convex) q' onto the shared cs122 VM

This box (`cs122.andrew.cmu.edu`) runs a **system (bare-metal) nginx** that owns
ports 80/443 and reverse-proxies several services (the old queue, a lab/precept
check-in app, a C0 visualizer, dev queues). We keep that nginx as the single TLS
terminator and slot the new Convex stack in beside everything else: the new queue
goes to `/ohq`, the old queue moves to `/ohqold`, and nothing else changes.

> Files referenced below live in this folder (`docs/deployments/shared-host/`):
> `etc-nginx-sites-enabled-default`, `etc-nginx-conf.d-qprime-ws.conf`, and the
> trimmed compose file `docker/docker-compose.selfhost.yml`.

---

## Final routing

| Public path | Target | Notes |
|---|---|---|
| `/` | existing static landing page | unchanged |
| `/ohq/` | `127.0.0.1:4002` (new frontend container) | NEW queue |
| `/api/` | `127.0.0.1:3210` (Convex sync, WS) | NEW |
| `/api/auth/`, `/api/{download,upload}_*` | `127.0.0.1:3211` (Convex HTTP actions) | NEW |
| `/_theme/`, `/.well-known/{openid-configuration,jwks.json}` | `127.0.0.1:3211` | NEW |
| `/ohqold/` + `/apiold` | `:4000` / `:8000` | OLD prod (client rebuilt) |
| `/ohqdevold/` + `/devapiold` | `:4001` / `:8001` | OLD dev (client rebuilt, if present) |
| `/lab/`, `/precept/`, `/visualc0` | `:3000` / `:7998` | unchanged |

> **Why the new app needs source patches:** it is designed to own a domain root.
> Serving it under `/ohq/` breaks per-course theming and the admin theme refresh
> because both read the course slug from the *first* URL segment. The committed
> patches make those two spots strip the base (`%VITE_BASE_PATH%` in `index.html`,
> `import.meta.env.BASE_URL` in `ConfigSettings.tsx`), and the frontend Dockerfile
> takes a `BASE_PATH` build arg. `SITE_URL` stays the **bare origin** — it is used
> for CORS and OAuth redirect-origin validation, not the frontend path.

---

## Prerequisites

- **Docker Engine + Compose v2 plugin**, and **Node 20** (for the `npx convex`
  CLI, run on the host). Install per `docs/deployments/SELF_HOST.md` steps 5–7.
- The host **already has a Let's Encrypt cert** for `cs122.andrew.cmu.edu` managed
  by the system `certbot` (snap). The new stack does **not** manage certs.
- Ports 80/443 are already open in the firewall (existing setup). The new
  containers bind **localhost only** (`3210/3211/4002/6791`) — no new firewall rules.
- Keep `HTTP_API_PREFIX=/api`. The Convex client hardcodes the `/api` segment, and
  the host nginx routes `/api` at the root — changing it breaks the sync client.
- Use the **non-`www`** host (`https://cs122.andrew.cmu.edu`) for the new app; its
  canonical origin (`SITE_URL`) is non-www, so OAuth/CORS expect that exact origin.

## What this migrates — and what it does NOT

> ⚠️ **No data is carried over.** The new app uses Convex, a different datastore
> from the old Postgres DB. Users, courses, enrollments, and queue history start
> **empty**. After deploy you run a one-time initial setup (semester + owner
> email); students/TAs re-enroll on first visit. The old Postgres DB is left
> untouched and still backs `/ohqold`. Migrating historical data is a separate
> project not covered here.

---

## Part A — Relocate the OLD queue (rebuild the clients)

Public paths are **baked into the React build** (`PUBLIC_URL`, `REACT_APP_SERVER_PATH`,
`REACT_APP_SOCKET_PATH`), so moving a queue means rebuilding its client. The
**servers need no change** — nginx strips the path prefix before proxying, so the
Express/socket.io backends still see `/...` and `/socket.io`.

### Prod client (→ `/ohqold`, `/apiold`)

```bash
cd ~/q-live/q-prime/client

# Keep a copy of the current /ohq build so rollback is trivial (see Rollback).
cp -r build build.ohq-backup
```

In `client/.env`, change only these three lines:

```diff
- REACT_APP_SOCKET_PATH=/api/socket.io
- REACT_APP_SERVER_PATH=/api
- PUBLIC_URL=/ohq
+ REACT_APP_SOCKET_PATH=/apiold/socket.io
+ REACT_APP_SERVER_PATH=/apiold
+ PUBLIC_URL=/ohqold
```

Rebuild and re-serve on the **same** port 4000:

```bash
npm run build
# restart the existing tmux 'serve' session, or:
serve -s build -l 4000 -n
```

Prod server stays as-is on `:8000`.

### Dev client (→ `/ohqdevold`, `/devapiold`) — only if a dev queue exists

The dev queue (`/ohqdev` → `:4001`, `/devapi` → `:8001`) is typically a **separate
checkout / tmux session**. Locate it, then in its `client/.env`:

```diff
- REACT_APP_SOCKET_PATH=/api/socket.io   (or whatever it currently is)
- REACT_APP_SERVER_PATH=/devapi
- PUBLIC_URL=/ohqdev
+ REACT_APP_SOCKET_PATH=/devapiold/socket.io
+ REACT_APP_SERVER_PATH=/devapiold
+ PUBLIC_URL=/ohqdevold
```

Rebuild, serve on `:4001`. Dev server stays on `:8001`. If there is no dev queue,
delete the `ohqdevold`/`devapiold` upstreams and locations from the nginx config.

> Verify each rebuilt bundle references the new prefix:
> `grep -ro "/ohqold" build | head` (prod) — should return hits.

---

## Part B — Deploy the NEW Convex stack (Docker, no nginx/certbot)

Clone this `convex` branch somewhere separate, e.g. `~/q-prime-new`.

> **Set a fixed Compose project name and use it for EVERY docker command below,**
> including `setup.sh`. The stock `setup.sh` and the shared-host compose file must
> share a project or you'll hit `container name already in use`.

```bash
export COMPOSE_PROJECT_NAME=qprime     # put this in your shell rc, or re-export each session
cd ~/q-prime-new
npm ci
```

**1. Bootstrap `.env.docker`.** The first run creates it and exits:

```bash
./docker/scripts/setup.sh
```

**2. Edit `.env.docker`:**

```bash
DOMAIN=cs122.andrew.cmu.edu
AUTH_GOOGLE_ID=389576270577-...apps.googleusercontent.com   # reuse 122 client (Part D)
AUTH_GOOGLE_SECRET="GOCSPX-..."                              # same secret as old server/.env
VITE_SINGLE_COURSE_MODE=true
HTTP_API_PREFIX=/api                                         # keep /api
# under "# Customization", add:
BASE_PATH=/ohq/
```

(`LETSENCRYPT_EMAIL` can be left blank — we skip the container SSL flow.)

**3. Run `setup.sh` again.** It installs deps, generates JWT keys, starts the Convex
backend on `127.0.0.1:3210/3211`, sets the Convex env vars, and **deploys the
functions**. It then tries to start the *stock* stack and **fails to bind ports
80/443** (held by host nginx) **and 4000** (held by the old queue):

```bash
./docker/scripts/setup.sh
```

> ⚠️ **That final failure is EXPECTED and harmless on a shared host** — the deploy
> already completed before it. (If you prefer, press **Ctrl-C** as soon as you see
> `✓ Convex functions deployed` / `Building and starting services…`.) You do **not**
> want the stock `nginx-proxy`/`certbot`, and the stock `frontend` is built at
> `base=/` on port 4000 — both wrong for this host.

**4. Remove the half-started stock containers** (this keeps the named data
volume — **never** pass `-v`):

```bash
docker compose -f docker/docker-compose.yml --env-file .env.docker down
```

**5. Start the shared-host stack** (backend + dashboard + frontend only, frontend
built for `/ohq/` on port 4002):

```bash
docker compose -f docker/docker-compose.selfhost.yml --env-file .env.docker up -d --build
docker compose -f docker/docker-compose.selfhost.yml --env-file .env.docker ps
```

You should see `qprime-convex-backend` (healthy), `qprime-convex-dashboard`,
`qprime-frontend` bound to `127.0.0.1` on `3210/3211/6791/4002`. The Convex
functions survive the `down`/`up` because they live in the `qprime_convex_data`
volume.

---

## Part C — Swap the host nginx config

```bash
# Back up the current config
sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak.$(date +%F)

# Install the new site config + the websocket-upgrade map
sudo cp docs/deployments/shared-host/etc-nginx-sites-enabled-default /etc/nginx/sites-enabled/default
sudo cp docs/deployments/shared-host/etc-nginx-conf.d-qprime-ws.conf  /etc/nginx/conf.d/qprime-ws.conf

# Validate and reload (reload, not restart — no dropped connections)
sudo nginx -t
sudo systemctl reload nginx
```

The cert paths in the new config are the **same** ones the host certbot already
manages, so TLS keeps working and auto-renews as before.

---

## Part D — Google OAuth

**You can reuse the existing 122 OAuth client (same client ID + secret) — you do
NOT need to create a new one.** A single Google OAuth client supports multiple
redirect URIs, multiple JS origins, and multiple apps at once.

The two versions use *different* OAuth flows, which is why one console change is
still required:

- **Old app** (`@react-oauth/google`, `flow: 'auth-code'`) uses Google's **popup**
  flow — the code returns via `postmessage`, so it relies on the *Authorized
  JavaScript origin* (`https://cs122.andrew.cmu.edu`), which is already configured.
- **New app** (`@convex-dev/auth`) uses a server-side **redirect** flow with a
  fixed callback at `/api/auth/callback/google`, which must be registered as an
  *Authorized redirect URI*.

In [GCP console](https://console.cloud.google.com/apis/credentials) → Credentials
→ the existing OAuth client, make this **single additive change**:

| Setting | Action |
|---|---|
| JS origin `https://cs122.andrew.cmu.edu` | already present — no change |
| Redirect URI `https://cs122.andrew.cmu.edu/api/auth/callback/google` | **➕ add this** |
| Scopes (`email`, `profile`, `openid`) | identical for both — no change |
| Consent screen / publish status | shared — no change |

Because the change is purely additive (nothing is removed), the old app's popup
login keeps working — old (`/ohqold`) and new (`/ohq`) run side by side on the
same credentials throughout cutover.

The same client goes into `.env.docker` as `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`
(Part B step 2).

Notes:

- **Cookies coexist, no collision** — both apps live on `cs122.andrew.cmu.edu` but
  use different cookie names (old: `user`; Convex Auth: its own `__convexAuth*`
  cookies), so the two logins don't interfere.
- **Hygiene:** consider rotating this long-lived client secret at some point and
  updating both apps. Not required for migration — just good practice.

---

## Part E — Initial app setup (first run)

The new database is empty, so do this once after Parts A–D:

1. Visit `https://cs122.andrew.cmu.edu/ohq/` and **Log In** with an owner Google
   account.
2. You'll land on the initial-setup page. Enter the **semester name** (e.g.
   "Fall 2026") and the **owner email(s)**.
3. Save to initialize. In single-course mode, `/ohq/` then redirects to the course;
   TAs/students enroll automatically on first visit.

---

## Verification

```bash
# New frontend through the host nginx (expect 200 + text/html)
curl -skI https://cs122.andrew.cmu.edu/ohq/ | head

# OIDC discovery proves /.well-known routing reaches Convex (expect JSON)
curl -sk https://cs122.andrew.cmu.edu/.well-known/openid-configuration | head -c 200; echo

# Convex backend health (local)
curl -s http://127.0.0.1:3210/version

# Old queue still served at its new path
curl -skI https://cs122.andrew.cmu.edu/ohqold/ | head
# Untouched neighbours still work
curl -skI https://cs122.andrew.cmu.edu/lab/ | head

# Confirm the sub-path was baked into the build (theming):
#  - the literal placeholder must be GONE (expect 0)
docker compose -f docker/docker-compose.selfhost.yml exec frontend \
  sh -c "grep -c '%VITE_BASE_PATH%' /usr/share/nginx/html/index.html || true"
#  - and the base must be present (expect a hit)
docker compose -f docker/docker-compose.selfhost.yml exec frontend \
  sh -c "grep -o \"'/ohq/'\" /usr/share/nginx/html/index.html | head"
```

Then in a browser: log in via Google, open a course page under `/ohq/<slug>`,
confirm the **theme colors load** (proves the patched slug detection + `/_theme/`
routing), and re-check `/ohqold/`, `/lab/`, `/precept/`.

---

## Cutover order & rollback

**Order:** Part A → Part B → Part D (OAuth) → Part C (nginx swap is the flip) →
Part E (initial setup). The old queue keeps serving on `:4000/:8000` throughout;
the only user-visible change happens at the nginx reload.

**Rollback** (restore the old `/ohq`):

```bash
# 1. nginx back to the pre-migration config
sudo cp /etc/nginx/sites-enabled/default.bak.<date> /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/conf.d/qprime-ws.conf
sudo nginx -t && sudo systemctl reload nginx

# 2. restore the original /ohq-based client build (the relocated build won't work
#    at /ohq because its assets point at /ohqold)
cd ~/q-live/q-prime/client
rm -rf build && mv build.ohq-backup build
# restart the serve session on :4000

# 3. (optional) stop the new stack
cd ~/q-prime-new
docker compose -f docker/docker-compose.selfhost.yml --env-file .env.docker down
```

---

## Ongoing operations

- **Update the deployment:**
  ```bash
  export COMPOSE_PROJECT_NAME=qprime
  cd ~/q-prime-new && git pull && npm ci
  ./docker/scripts/deploy-convex.sh    # redeploy functions + env
  docker compose -f docker/docker-compose.selfhost.yml --env-file .env.docker up -d --build frontend
  ```
  (Use the selfhost compose, **not** `deploy-frontend.sh`, which targets the stock
  compose and the wrong ports/base.)
- **Backups:** `./docker/scripts/backup.sh` snapshots the Convex data into
  `backups/`. Schedule it via cron. (The old Postgres DB has its own backups.)
- **Convex dashboard** (admin UI, localhost-only): tunnel from your laptop —
  `ssh -L 6791:localhost:6791 <user>@cs122.andrew.cmu.edu`, then open
  `http://localhost:6791`.
- **Cert renewal:** unchanged — the host's snap `certbot` renews and reloads nginx
  for all sites (including `/ohq`). The new stack never touches certs.
- **Logs:** `docker compose -f docker/docker-compose.selfhost.yml logs -f convex-backend`.
- **Do NOT run** `init-letsencrypt.sh` or the stock `docker-compose.yml` on this
  host — both would fight for 80/443.
