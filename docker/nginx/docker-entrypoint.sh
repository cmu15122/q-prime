#!/bin/sh
# Q-Prime NGINX Entrypoint
# Substitutes environment variables in config templates and selects HTTP or HTTPS mode

set -e

if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN environment variable is not set"
    exit 1
fi

# HTTP_API_PREFIX scopes Convex's HTTP API.
HTTP_API_PREFIX="${HTTP_API_PREFIX:-/api}"

export DOMAIN HTTP_API_PREFIX

echo "Configuration:"
echo "  DOMAIN: $DOMAIN"
echo "  HTTP_API_PREFIX: $HTTP_API_PREFIX"

# Check if SSL certificates exist
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo "SSL certificates found for $DOMAIN - using HTTPS"
    envsubst '${DOMAIN} ${HTTP_API_PREFIX}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
else
    echo "SSL certificates NOT found for $DOMAIN - using HTTP only"
    echo ""
    echo "To enable SSL: re-run ./docker/scripts/setup.sh and answer Y to the SSL prompt"
    echo ""
    envsubst '${DOMAIN} ${HTTP_API_PREFIX}' < /etc/nginx/templates/default-http-only.conf.template > /etc/nginx/conf.d/default.conf
fi

# Test config
nginx -t

exec "$@"
