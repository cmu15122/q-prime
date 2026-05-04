#!/bin/bash
# Q-Prime Docker Setup
# Usage: ./docker/scripts/setup.sh
#
# Prerequisites: docker, docker compose, node
# Required in .env.docker: DOMAIN, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
# Optional in .env.docker: LETSENCRYPT_EMAIL, HTTP_API_PREFIX, LETSENCRYPT_STAGING

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"
ENV_FILE="$PROJECT_ROOT/.env.docker"

# ── Helpers ────────────────────────────────────────────────────────────────────

log()  { echo "  $*"; }
step() { echo ""; echo "▶ $*"; }
ok()   { echo "  ✓ $*"; }
die()  { echo ""; echo "ERROR: $*" >&2; exit 1; }

compose() {
    docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$ENV_FILE" "$@"
}

# ── Step 1: Prerequisites ──────────────────────────────────────────────────────

step "Checking prerequisites..."
command -v docker >/dev/null 2>&1 || die "docker not found — install from https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || die "docker compose V2 not found"
command -v node >/dev/null 2>&1 || die "node not found — install from https://nodejs.org/"
ok "docker, docker compose, node available"

# ── Step 2: Bootstrap .env.docker ─────────────────────────────────────────────

step "Loading configuration..."
if [ ! -f "$ENV_FILE" ]; then
    [ -f "$ENV_FILE.example" ] || die ".env.docker.example not found"
    cp "$ENV_FILE.example" "$ENV_FILE"
    echo ""
    echo "  Created .env.docker — fill in the required values and re-run:"
    echo "    DOMAIN, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET"
    echo "  (LETSENCRYPT_EMAIL is optional, prompted interactively if needed for SSL)"
    exit 0
fi

set -a; source "$ENV_FILE"; set +a

# ── Step 3: Prompt for any missing required vars ───────────────────────────────

prompt_var() {
    local var="$1" prompt="$2" value
    read -rp "  $prompt: " value
    [ -n "$value" ] || die "$var cannot be empty"
    eval "$var=\$value"
}

{ [ -z "${DOMAIN:-}" ] || [ "$DOMAIN" = "yourdomain.edu" ]; } && prompt_var DOMAIN "Deployment domain (e.g. cs122.andrew.cmu.edu)"
{ [ -z "${AUTH_GOOGLE_ID:-}" ] || [ "$AUTH_GOOGLE_ID" = "your-client-id.apps.googleusercontent.com" ]; } && prompt_var AUTH_GOOGLE_ID "Google OAuth client ID"
{ [ -z "${AUTH_GOOGLE_SECRET:-}" ] || [ "$AUTH_GOOGLE_SECRET" = "your-client-secret" ]; } && prompt_var AUTH_GOOGLE_SECRET "Google OAuth client secret"

if [ -z "${VITE_SINGLE_COURSE_MODE:-}" ]; then
    echo ""
    echo "  Deployment mode:"
    echo "    [1] Single-OHQ — root redirects to your one course; no landing page (default)"
    echo "    [2] Multi-OHQ — host the public landing page (for hosting many courses)"
    read -rp "  Choose 1 or 2 [1]: " mode_answer
    if [ "${mode_answer:-1}" = "2" ]; then
        VITE_SINGLE_COURSE_MODE=false
    else
        VITE_SINGLE_COURSE_MODE=true
    fi
fi

ok "Required configuration present"

# ── Step 4: Derive config values ───────────────────────────────────────────────

HTTP_API_PREFIX="${HTTP_API_PREFIX:-/api}"
LETSENCRYPT_STAGING="${LETSENCRYPT_STAGING:-0}"

PROTOCOL="https"
[ "$DOMAIN" = "localhost" ] && PROTOCOL="http"

# VITE_CONVEX_URL must NOT include the API prefix — ConvexReactClient appends /api/ itself
VITE_CONVEX_URL="${PROTOCOL}://${DOMAIN}"
VITE_APP_CONVEX_SITE_URL="${PROTOCOL}://${DOMAIN}${HTTP_API_PREFIX}"
CONVEX_CLOUD_ORIGIN="${PROTOCOL}://${DOMAIN}${HTTP_API_PREFIX}"
CONVEX_SITE_ORIGIN="${PROTOCOL}://${DOMAIN}"
CONVEX_SITE_URL="${PROTOCOL}://${DOMAIN}"
SITE_URL="${PROTOCOL}://${DOMAIN}"
CONVEX_SELF_HOSTED_URL="http://127.0.0.1:3210"

# ── Step 5: Install dependencies ──────────────────────────────────────────────

step "Installing dependencies..."
cd "$PROJECT_ROOT"
[ -d node_modules ] || npm ci
ok "Dependencies ready"

# ── Step 6: Generate JWT keys if missing ───────────────────────────────────────

step "Checking JWT keys..."
if [ -z "${JWKS:-}" ] || [ -z "${JWT_PRIVATE_KEY:-}" ]; then
    log "Generating RSA key pair..."
    [ -f "$PROJECT_ROOT/generateKeys.mjs" ] || die "generateKeys.mjs not found"
    KEY_OUTPUT=$(node generateKeys.mjs)
    JWT_PRIVATE_KEY=$(echo "$KEY_OUTPUT" | grep "^JWT_PRIVATE_KEY=" | cut -d'=' -f2- | tr -d '"')
    JWKS=$(echo "$KEY_OUTPUT" | grep "^JWKS=" | cut -d'=' -f2-)
    [ -n "$JWT_PRIVATE_KEY" ] || die "JWT key generation failed"
    ok "JWT keys generated"
else
    ok "JWT keys already present, skipping"
fi

# ── Step 7: Write .env.docker so Convex backend starts with correct env vars ──

step "Writing .env.docker..."

# Keys that write_env_file emits. Anything else found in the existing file is
# preserved verbatim under "# Customization" so users can set vars like
# RUST_LOG or DOCUMENT_RETENTION_DELAY without losing them on re-run.
MANAGED_KEYS_RE='^(DOMAIN|LETSENCRYPT_EMAIL|AUTH_GOOGLE_ID|AUTH_GOOGLE_SECRET|HTTP_API_PREFIX|LETSENCRYPT_STAGING|VITE_SINGLE_COURSE_MODE|JWT_PRIVATE_KEY|JWKS|CONVEX_SELF_HOSTED_ADMIN_KEY|VITE_CONVEX_URL|VITE_APP_CONVEX_SITE_URL|VITE_APP_GOOGLE_CLIENT_ID|CONVEX_CLOUD_ORIGIN|CONVEX_SITE_ORIGIN|CONVEX_SITE_URL|SITE_URL|CONVEX_SELF_HOSTED_URL)='

write_env_file() {
    local tmp="${ENV_FILE}.tmp"
    local custom_vars=""
    if [ -f "$ENV_FILE" ]; then
        custom_vars=$(grep -E '^[A-Z_][A-Z0-9_]*=' "$ENV_FILE" | grep -vE "$MANAGED_KEYS_RE" || true)
    fi
    {
        cat << 'HEADER'
# Q-Prime Docker Configuration
# Managed by setup.sh — sections below (Required, Optional, Auto-generated, Derived)
# are overwritten on every run. Add custom vars under "# Customization" to preserve them.
HEADER
        echo ""
        echo "# Required"
        printf 'DOMAIN=%s\n'              "$DOMAIN"
        printf 'LETSENCRYPT_EMAIL=%s\n'   "${LETSENCRYPT_EMAIL:-}"
        printf 'AUTH_GOOGLE_ID=%s\n'      "$AUTH_GOOGLE_ID"
        printf 'AUTH_GOOGLE_SECRET="%s"\n' "$AUTH_GOOGLE_SECRET"
        echo ""
        echo "# Optional"
        printf 'HTTP_API_PREFIX=%s\n'     "$HTTP_API_PREFIX"
        printf 'LETSENCRYPT_STAGING=%s\n' "$LETSENCRYPT_STAGING"
        printf 'VITE_SINGLE_COURSE_MODE=%s\n' "${VITE_SINGLE_COURSE_MODE:-true}"
        echo ""
        echo "# Auto-generated"
        printf 'JWT_PRIVATE_KEY="%s"\n'   "$JWT_PRIVATE_KEY"
        printf "JWKS='%s'\n"              "$JWKS"
        printf 'CONVEX_SELF_HOSTED_ADMIN_KEY="%s"\n' "${CONVEX_SELF_HOSTED_ADMIN_KEY:-}"
        echo ""
        echo "# Derived from DOMAIN (do not edit — re-run setup.sh to update)"
        printf 'VITE_CONVEX_URL=%s\n'          "$VITE_CONVEX_URL"
        printf 'VITE_APP_CONVEX_SITE_URL=%s\n' "$VITE_APP_CONVEX_SITE_URL"
        printf 'VITE_APP_GOOGLE_CLIENT_ID=%s\n' "$AUTH_GOOGLE_ID"
        printf 'CONVEX_CLOUD_ORIGIN=%s\n'      "$CONVEX_CLOUD_ORIGIN"
        printf 'CONVEX_SITE_ORIGIN=%s\n'       "$CONVEX_SITE_ORIGIN"
        printf 'CONVEX_SITE_URL=%s\n'          "$CONVEX_SITE_URL"
        printf 'SITE_URL=%s\n'                 "$SITE_URL"
        printf 'CONVEX_SELF_HOSTED_URL=%s\n'   "$CONVEX_SELF_HOSTED_URL"
        echo ""
        echo "# Customization (preserved across runs — e.g. RUST_LOG=debug, DOCUMENT_RETENTION_DELAY=86400)"
        [ -n "$custom_vars" ] && printf '%s\n' "$custom_vars"
    } > "$tmp"
    mv "$tmp" "$ENV_FILE"
}

write_env_file
set -a; source "$ENV_FILE"; set +a
ok ".env.docker written"

# ── Step 8: Start Convex backend ───────────────────────────────────────────────

step "Starting Convex backend..."
compose pull convex-backend --quiet
compose up -d convex-backend

log "Waiting for healthy..."
for i in $(seq 1 60); do
    if compose exec -T convex-backend curl -sf http://localhost:3210/version >/dev/null 2>&1; then
        ok "Convex backend healthy"
        break
    fi
    [ "$i" -eq 60 ] && { compose logs convex-backend; die "Convex backend failed to start after 120s"; }
    sleep 2
done

# ── Step 9: Generate admin key if missing ──────────────────────────────────────

step "Checking admin key..."
if [ -z "${CONVEX_SELF_HOSTED_ADMIN_KEY:-}" ]; then
    log "Generating admin key..."
    CONVEX_SELF_HOSTED_ADMIN_KEY=$(compose exec -T convex-backend ./generate_admin_key.sh 2>/dev/null | tail -1)
    [ -n "$CONVEX_SELF_HOSTED_ADMIN_KEY" ] || die "Admin key generation failed — check: docker logs qprime-convex-backend"
    ok "Admin key generated"
else
    ok "Admin key already present, skipping"
fi

# ── Step 10: Persist admin key to .env.docker ─────────────────────────────────

write_env_file
set -a; source "$ENV_FILE"; set +a
ok ".env.docker updated with admin key"

# ── Step 11: Deploy Convex functions ───────────────────────────────────────────

step "Deploying Convex functions..."
cd "$PROJECT_ROOT"

cat > "$PROJECT_ROOT/.env.local" << EOF
CONVEX_SELF_HOSTED_URL=$CONVEX_SELF_HOSTED_URL
CONVEX_SELF_HOSTED_ADMIN_KEY=$CONVEX_SELF_HOSTED_ADMIN_KEY
EOF

npx convex env set AUTH_GOOGLE_ID     -- "$AUTH_GOOGLE_ID"
npx convex env set AUTH_GOOGLE_SECRET -- "$AUTH_GOOGLE_SECRET"
npx convex env set SITE_URL           -- "$SITE_URL"
npx convex env set HTTP_API_PREFIX    -- "$HTTP_API_PREFIX"
npx convex env set JWKS               -- "$JWKS"
npx convex env set JWT_PRIVATE_KEY    -- "$JWT_PRIVATE_KEY"

npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'npm run build:quick'
ok "Convex functions deployed"

# ── Step 12: Build and start all services ──────────────────────────────────────

step "Building and starting services..."
compose build frontend nginx-proxy
compose up -d
ok "All services running"

# ── Step 13: SSL setup (interactive) ──────────────────────────────────────────

setup_ssl() {
    local data_path="$PROJECT_ROOT/docker/certbot"
    local staging_arg=""
    [ "${LETSENCRYPT_STAGING:-0}" != "0" ] && staging_arg="--staging"

    if [ -z "${LETSENCRYPT_EMAIL:-}" ]; then
        read -rp "  Email for Let's Encrypt: " LETSENCRYPT_EMAIL
        [ -n "$LETSENCRYPT_EMAIL" ] || die "Email required for Let's Encrypt"
        write_env_file
    fi

    mkdir -p "$data_path/conf" "$data_path/www" "$data_path/conf/live/$DOMAIN"

    if [ ! -f "$data_path/conf/options-ssl-nginx.conf" ]; then
        log "Downloading recommended TLS parameters..."
        curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf \
            -o "$data_path/conf/options-ssl-nginx.conf"
        curl -fsSL https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem \
            -o "$data_path/conf/ssl-dhparams.pem"
    fi

    log "Creating temporary certificate so nginx can start in SSL mode..."
    compose run --rm --entrypoint "openssl req -x509 -nodes -newkey rsa:4096 -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj '/CN=localhost'" certbot

    compose up --force-recreate -d nginx-proxy
    log "Waiting for nginx..."
    for i in $(seq 1 30); do
        if curl -sf http://localhost/health >/dev/null 2>&1; then break; fi
        [ "$i" -eq 30 ] && die "nginx failed to start after 30s"
        sleep 1
    done

    log "Removing temporary certificate..."
    compose run --rm --entrypoint \
        "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf" \
        certbot

    log "Requesting certificate from Let's Encrypt..."
    compose run --rm --entrypoint "certbot certonly --webroot -w /var/www/certbot \
        $staging_arg \
        --email $LETSENCRYPT_EMAIL \
        --rsa-key-size 4096 \
        --agree-tos \
        --no-eff-email \
        --force-renewal \
        -d $DOMAIN" certbot

    compose exec nginx-proxy nginx -s reload
    ok "SSL certificate obtained and nginx reloaded"
}

step "SSL setup"
# certbot writes a renewal config only on a successful Let's Encrypt issuance,
# which distinguishes it from the short-lived self-signed cert used during bootstrap.
RENEWAL_CONF="$PROJECT_ROOT/docker/certbot/conf/renewal/$DOMAIN.conf"
if [ -f "$RENEWAL_CONF" ]; then
    ok "SSL certificate already present for $DOMAIN (delete $RENEWAL_CONF to re-run)"
else
    read -rp "  Set up Let's Encrypt SSL certificate? (y/N) " ssl_answer
    if [ "${ssl_answer:-}" = "y" ] || [ "${ssl_answer:-}" = "Y" ]; then
        setup_ssl
    else
        log "Skipping SSL — nginx running in HTTP-only mode"
        log "To enable SSL later: re-run setup.sh and answer Y"
    fi
fi

# ── Done ───────────────────────────────────────────────────────────────────────

echo ""
echo "══════════════════════════════════════════"
echo "  Setup complete!"
echo "══════════════════════════════════════════"
echo ""
echo "  Site: ${PROTOCOL}://${DOMAIN}/"
echo ""
echo "  Re-deployment commands:"
echo "    Convex functions:  ./docker/scripts/deploy-convex.sh"
echo "    Frontend:          ./docker/scripts/deploy-frontend.sh"
echo "    All services:      docker compose -f docker/docker-compose.yml --env-file .env.docker up -d"
