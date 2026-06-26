#!/bin/bash
# Q-Prime SSL Certificate Renewal Script
# Based on: https://github.com/wmnnd/nginx-certbot
#
# Add to crontab for automatic renewal:
#   0 3 * * * /path/to/q-prime/docker/scripts/renew-certs.sh >> /var/log/qprime-certs.log 2>&1

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
PROJECT_ROOT="$(cd "$DOCKER_DIR/.." && pwd)"

echo "=========================================="
echo "Q-Prime SSL Certificate Renewal"
echo "$(date)"
echo "=========================================="

# Run certbot renewal
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" run --rm certbot renew

# Reload nginx to pick up new certs
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" exec nginx-proxy nginx -s reload

echo "Done!"
