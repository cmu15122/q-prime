#!/bin/bash
# Q-Prime Frontend Deployment Script
# Usage: ./docker/scripts/deploy-frontend.sh
#
# This script:
# 1. Builds the frontend Docker container
# 2. Restarts the frontend service

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

echo "=========================================="
echo "Deploying Q-Prime Frontend"
echo "=========================================="
echo ""

# Source environment
if [ -f "$PROJECT_ROOT/.env.docker" ]; then
    set -a
    source "$PROJECT_ROOT/.env.docker"
    set +a
else
    echo "Error: .env.docker not found"
    exit 1
fi

# Build frontend container
echo "Building frontend container..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" build frontend
echo ""

# Restart frontend container
echo "Restarting frontend container..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" up -d frontend

echo ""
echo "=========================================="
echo "Frontend deployed!"
echo "=========================================="
echo ""
echo "Access at: https://$DOMAIN/ohq/"
