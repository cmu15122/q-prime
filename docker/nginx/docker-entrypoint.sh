#!/bin/sh
# Q-Prime NGINX Entrypoint
# Substitutes ${DOMAIN} in config template and selects HTTP or HTTPS mode

set -e

if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN environment variable is not set"
    exit 1
fi

# Check if SSL certificates exist
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_PATH" ]; then
    echo "SSL certificates found for $DOMAIN - using HTTPS"
    envsubst '${DOMAIN}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf
else
    echo "SSL certificates NOT found for $DOMAIN - using HTTP only"
    echo ""
    echo "Run init-letsencrypt.sh to obtain SSL certificates"
    echo ""
    cp /etc/nginx/templates/default-http-only.conf /etc/nginx/conf.d/default.conf
fi

# Test config
nginx -t

exec "$@"
