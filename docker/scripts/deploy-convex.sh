#!/bin/bash
# Q-Prime Convex Deployment Script
# Usage: ./docker/scripts/deploy-convex.sh
#
# This script:
# 1. Sets Convex environment variables
# 2. Deploys Convex functions to the self-hosted backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "=========================================="
echo "Deploying Convex Functions"
echo "=========================================="
echo ""

# Source environment
if [ -f "$PROJECT_ROOT/.env.docker" ]; then
    set -a
    source "$PROJECT_ROOT/.env.docker"
    set +a
else
    echo "Error: .env.docker not found"
    echo "Run ./docker/scripts/setup.sh first"
    exit 1
fi

# Validate required variables
MISSING_VARS=""

if [ -z "$CONVEX_SELF_HOSTED_URL" ]; then
    MISSING_VARS="$MISSING_VARS CONVEX_SELF_HOSTED_URL"
fi

if [ -z "$CONVEX_SELF_HOSTED_ADMIN_KEY" ]; then
    MISSING_VARS="$MISSING_VARS CONVEX_SELF_HOSTED_ADMIN_KEY"
fi

if [ -z "$AUTH_GOOGLE_ID" ]; then
    MISSING_VARS="$MISSING_VARS AUTH_GOOGLE_ID"
fi

if [ -z "$AUTH_GOOGLE_SECRET" ]; then
    MISSING_VARS="$MISSING_VARS AUTH_GOOGLE_SECRET"
fi

# CONVEX_SITE_URL is needed for the --site-url flag
if [ -z "$CONVEX_SITE_URL" ]; then
    MISSING_VARS="$MISSING_VARS CONVEX_SITE_URL"
fi

if [ -z "$JWKS" ]; then
    MISSING_VARS="$MISSING_VARS JWKS"
fi

if [ -z "$JWT_PRIVATE_KEY" ]; then
    MISSING_VARS="$MISSING_VARS JWT_PRIVATE_KEY"
fi

if [ -n "$MISSING_VARS" ]; then
    echo "Error: The following required variables are not set in .env.docker:"
    echo " $MISSING_VARS"
    echo ""
    echo "Run ./docker/scripts/setup.sh to generate missing values"
    exit 1
fi

cd "$PROJECT_ROOT"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm ci
    echo ""
fi

# Create .env.local for Convex CLI
cat > "$PROJECT_ROOT/.env.local" << EOF
CONVEX_SELF_HOSTED_URL=$CONVEX_SELF_HOSTED_URL
CONVEX_SELF_HOSTED_ADMIN_KEY=$CONVEX_SELF_HOSTED_ADMIN_KEY
EOF

echo "Target: $CONVEX_SELF_HOSTED_URL"
echo ""

# Set environment variables in Convex
echo "Setting Convex environment variables..."

# Use -- before all values to prevent special characters from being interpreted as options

# Required for Google OAuth
if [ -n "$AUTH_GOOGLE_ID" ]; then
    echo "  Setting AUTH_GOOGLE_ID..."
    npx convex env set AUTH_GOOGLE_ID -- "$AUTH_GOOGLE_ID"
fi

if [ -n "$AUTH_GOOGLE_SECRET" ]; then
    echo "  Setting AUTH_GOOGLE_SECRET..."
    npx convex env set AUTH_GOOGLE_SECRET -- "$AUTH_GOOGLE_SECRET"
fi

# Required for Convex Auth
if [ -n "$CLIENT_ORIGIN" ]; then
    echo "  Setting CLIENT_ORIGIN..."
    npx convex env set CLIENT_ORIGIN -- "$CLIENT_ORIGIN"
fi

if [ -n "$SITE_URL" ]; then
    echo "  Setting SITE_URL..."
    npx convex env set SITE_URL -- "$SITE_URL"
fi

# Note: CONVEX_SITE_URL is passed to the backend as a Docker environment variable
# (see docker-compose.yml). We don't need to set it via env set.

# HTTP API prefix for CSV endpoints (default: /api)
HTTP_API_PREFIX="${HTTP_API_PREFIX:-/api}"
echo "  Setting HTTP_API_PREFIX..."
npx convex env set HTTP_API_PREFIX -- "$HTTP_API_PREFIX"

# JWT keys for authentication
if [ -n "$JWKS" ]; then
    echo "  Setting JWKS..."
    npx convex env set JWKS -- "$JWKS"
fi

if [ -n "$JWT_PRIVATE_KEY" ]; then
    echo "  Setting JWT_PRIVATE_KEY..."
    npx convex env set JWT_PRIVATE_KEY -- "$JWT_PRIVATE_KEY"
fi

echo ""
echo "Deploying functions..."
npx convex deploy --cmd-url-env-var-name VITE_CONVEX_URL --cmd 'npm run build:quick'

echo ""
echo "=========================================="
echo "Convex deployment complete!"
echo "=========================================="
