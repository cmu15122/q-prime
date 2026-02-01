#!/bin/bash
# Q-Prime Docker Setup Script
#
# This script handles all the chicken-and-egg setup:
# 1. Creates .env.docker from example if missing
# 2. Auto-generates JWT keys if not set
# 3. Starts Convex backend and waits for healthy
# 4. Auto-generates admin key if not set
# 5. Updates .env.docker with generated values
#
# Usage: ./docker/scripts/setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "=========================================="
echo "Q-Prime Docker Setup"
echo "=========================================="
echo ""

# ----------------------------------------------
# Step 1: Check prerequisites
# ----------------------------------------------
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed"
    echo "Install: https://docs.docker.com/engine/install/"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    echo "Error: Docker Compose V2 is required"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Install: https://nodejs.org/"
    exit 1
fi

echo "Prerequisites OK"
echo ""

# ----------------------------------------------
# Step 2: Create .env.docker if missing
# ----------------------------------------------
if [ ! -f "$PROJECT_ROOT/.env.docker" ]; then
    if [ -f "$PROJECT_ROOT/.env.docker.example" ]; then
        echo "Creating .env.docker from example..."
        cp "$PROJECT_ROOT/.env.docker.example" "$PROJECT_ROOT/.env.docker"
        echo ""
        echo "=========================================="
        echo "ACTION REQUIRED: Edit .env.docker"
        echo "=========================================="
        echo ""
        echo "Fill in these values:"
        echo "  - DOMAIN (your domain, e.g., cs122.andrew.cmu.edu)"
        echo "  - AUTH_GOOGLE_ID (from Google Cloud Console)"
        echo "  - AUTH_GOOGLE_SECRET (from Google Cloud Console)"
        echo "  - LETSENCRYPT_EMAIL (for SSL certificate notifications)"
        echo ""
        echo "Then run this script again."
        exit 0
    else
        echo "Error: .env.docker.example not found"
        exit 1
    fi
fi

# ----------------------------------------------
# Step 3: Load and validate environment
# ----------------------------------------------
echo "Loading environment..."
set -a
source "$PROJECT_ROOT/.env.docker"
set +a

# Check required user-provided values
MISSING=()
[ -z "$DOMAIN" ] || [ "$DOMAIN" = "yourdomain.edu" ] && MISSING+=("DOMAIN")
[ -z "$AUTH_GOOGLE_ID" ] || [ "$AUTH_GOOGLE_ID" = "your-google-client-id.apps.googleusercontent.com" ] && MISSING+=("AUTH_GOOGLE_ID")
[ -z "$AUTH_GOOGLE_SECRET" ] || [ "$AUTH_GOOGLE_SECRET" = "your-google-client-secret" ] && MISSING+=("AUTH_GOOGLE_SECRET")

if [ ${#MISSING[@]} -gt 0 ]; then
    echo ""
    echo "=========================================="
    echo "ACTION REQUIRED: Edit .env.docker"
    echo "=========================================="
    echo ""
    echo "Missing or placeholder values:"
    for var in "${MISSING[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Edit .env.docker and run this script again."
    exit 1
fi

echo "Required configuration OK"
echo ""

# ----------------------------------------------
# Step 4: Auto-generate JWT keys if missing
# ----------------------------------------------
if [ -z "$JWKS" ] || [ -z "$JWT_PRIVATE_KEY" ]; then
    echo "Generating JWT keys..."

    if [ ! -f "$PROJECT_ROOT/generateKeys.mjs" ]; then
        echo "Error: generateKeys.mjs not found"
        exit 1
    fi

    # Generate keys and capture output
    cd "$PROJECT_ROOT"
    KEY_OUTPUT=$(node generateKeys.mjs)

    # Extract values
    JWT_PRIVATE_KEY=$(echo "$KEY_OUTPUT" | grep "^JWT_PRIVATE_KEY=" | cut -d'=' -f2-)
    JWKS=$(echo "$KEY_OUTPUT" | grep "^JWKS=" | cut -d'=' -f2-)

    # Update .env.docker (use awk to handle special characters in keys)
    if grep -q "^JWT_PRIVATE_KEY=$" "$PROJECT_ROOT/.env.docker"; then
        awk -v val="$JWT_PRIVATE_KEY" '/^JWT_PRIVATE_KEY=$/ {print "JWT_PRIVATE_KEY=" val; next} {print}' \
            "$PROJECT_ROOT/.env.docker" > "$PROJECT_ROOT/.env.docker.tmp" && \
            mv "$PROJECT_ROOT/.env.docker.tmp" "$PROJECT_ROOT/.env.docker"
    fi
    if grep -q "^JWKS=$" "$PROJECT_ROOT/.env.docker"; then
        # Wrap JWKS in single quotes to preserve JSON during bash source
        awk -v val="$JWKS" '/^JWKS=$/ {print "JWKS='"'"'" val "'"'"'"; next} {print}' \
            "$PROJECT_ROOT/.env.docker" > "$PROJECT_ROOT/.env.docker.tmp" && \
            mv "$PROJECT_ROOT/.env.docker.tmp" "$PROJECT_ROOT/.env.docker"
    fi

    echo "JWT keys generated and saved to .env.docker"
    echo ""

    # Reload environment
    set -a
    source "$PROJECT_ROOT/.env.docker"
    set +a
fi

# ----------------------------------------------
# Step 5: Update derived values in .env.docker
# ----------------------------------------------
echo "Updating derived configuration values..."

# Determine protocol based on domain
if [ "$DOMAIN" = "localhost" ]; then
    PROTOCOL="http"
else
    PROTOCOL="https"
fi

# Get prefixes (use defaults if not set)
HTTP_API_PREFIX="${HTTP_API_PREFIX:-/api}"
HTTP_CLIENT_PREFIX="${HTTP_CLIENT_PREFIX:-/ohq}"

# Update values that depend on DOMAIN and prefixes
sed -i "s|^VITE_CONVEX_URL=.*|VITE_CONVEX_URL=${PROTOCOL}://${DOMAIN}${HTTP_API_PREFIX}|" "$PROJECT_ROOT/.env.docker"
sed -i "s|^VITE_APP_CONVEX_SITE_URL=.*|VITE_APP_CONVEX_SITE_URL=${PROTOCOL}://${DOMAIN}${HTTP_API_PREFIX}|" "$PROJECT_ROOT/.env.docker"
sed -i "s|^CONVEX_CLOUD_ORIGIN=.*|CONVEX_CLOUD_ORIGIN=${PROTOCOL}://${DOMAIN}${HTTP_API_PREFIX}|" "$PROJECT_ROOT/.env.docker"
sed -i "s|^CONVEX_SITE_ORIGIN=.*|CONVEX_SITE_ORIGIN=${PROTOCOL}://${DOMAIN}|" "$PROJECT_ROOT/.env.docker"
sed -i "s|^CONVEX_SITE_URL=.*|CONVEX_SITE_URL=${PROTOCOL}://${DOMAIN}|" "$PROJECT_ROOT/.env.docker"
sed -i "s|^CLIENT_ORIGIN=.*|CLIENT_ORIGIN=${PROTOCOL}://${DOMAIN}|" "$PROJECT_ROOT/.env.docker"
sed -i "s|^SITE_URL=.*|SITE_URL=${PROTOCOL}://${DOMAIN}|" "$PROJECT_ROOT/.env.docker"

# Sync Google Client ID to frontend
sed -i "s|^VITE_APP_GOOGLE_CLIENT_ID=.*|VITE_APP_GOOGLE_CLIENT_ID=${AUTH_GOOGLE_ID}|" "$PROJECT_ROOT/.env.docker"

echo "Configuration updated"
echo ""

# Reload environment with updated values
set -a
source "$PROJECT_ROOT/.env.docker"
set +a

# ----------------------------------------------
# Step 6: Pull images and start Convex backend
# ----------------------------------------------
echo "Pulling Docker images..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" pull convex-backend convex-dashboard certbot
echo ""

echo "Starting Convex backend..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" up -d convex-backend
echo ""

echo "Waiting for Convex backend to be healthy..."
for i in {1..60}; do
    if docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" exec -T convex-backend curl -sf http://localhost:3210/version > /dev/null 2>&1; then
        echo "Convex backend is healthy!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "Error: Convex backend failed to start"
        docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" logs convex-backend
        exit 1
    fi
    echo "  Waiting... ($i/60)"
    sleep 2
done
echo ""

# ----------------------------------------------
# Step 7: Generate admin key if missing
# ----------------------------------------------
if [ -z "$CONVEX_SELF_HOSTED_ADMIN_KEY" ]; then
    echo "Generating Convex admin key..."
    ADMIN_KEY=$(docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" exec -T convex-backend ./generate_admin_key.sh 2>/dev/null | tail -1)

    if [ -n "$ADMIN_KEY" ]; then
        # Update .env.docker (quote the value to handle | character)
        awk -v key="$ADMIN_KEY" '/^CONVEX_SELF_HOSTED_ADMIN_KEY=/ {print "CONVEX_SELF_HOSTED_ADMIN_KEY=\"" key "\""; next} {print}' \
            "$PROJECT_ROOT/.env.docker" > "$PROJECT_ROOT/.env.docker.tmp" && \
            mv "$PROJECT_ROOT/.env.docker.tmp" "$PROJECT_ROOT/.env.docker"
        echo "Admin key generated and saved to .env.docker"
    else
        echo "Warning: Failed to generate admin key"
    fi
    echo ""
fi

# ----------------------------------------------
# Step 8: Done!
# ----------------------------------------------
echo "=========================================="
echo "Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
if [ "$DOMAIN" != "localhost" ]; then
    echo "1. Initialize SSL certificates:"
    echo "   ./docker/scripts/init-letsencrypt.sh"
    echo ""
    echo "2. Deploy Convex functions:"
    echo "   ./docker/scripts/deploy-convex.sh"
    echo ""
    echo "3. Start all services:"
    echo "   docker compose -f docker/docker-compose.yml --env-file .env.docker up -d"
else
    echo "1. Deploy Convex functions:"
    echo "   ./docker/scripts/deploy-convex.sh"
    echo ""
    echo "2. Start all services:"
    echo "   docker compose -f docker/docker-compose.yml --env-file .env.docker up -d"
fi
echo ""
echo "Access the app at: ${PROTOCOL}://${DOMAIN}${HTTP_CLIENT_PREFIX}/"
