#!/bin/bash
# Q-Prime SSL Certificate Initialization Script
# Based on: https://github.com/wmnnd/nginx-certbot
#
# This script:
# 1. Creates dummy certificates so nginx can start
# 2. Starts nginx
# 3. Deletes dummy certificates
# 4. Requests real certificates from Let's Encrypt
# 5. Reloads nginx
#
# Usage: ./docker/scripts/init-letsencrypt.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DOCKER_DIR="$PROJECT_ROOT/docker"

# Load environment
if [ -f "$PROJECT_ROOT/.env.docker" ]; then
    set -a
    source "$PROJECT_ROOT/.env.docker"
    set +a
else
    echo "Error: .env.docker not found"
    echo "Copy .env.docker.example to .env.docker and configure it first"
    exit 1
fi

if [ -z "$DOMAIN" ]; then
    echo "Error: DOMAIN not set in .env.docker"
    exit 1
fi

if [ -z "$LETSENCRYPT_EMAIL" ]; then
    echo "Warning: LETSENCRYPT_EMAIL not set in .env.docker"
    echo "You will need to provide an email for Let's Encrypt registration"
    read -p "Enter email for Let's Encrypt: " LETSENCRYPT_EMAIL
fi

# Configuration
domains=($DOMAIN)
rsa_key_size=4096
data_path="$PROJECT_ROOT/docker/certbot"
staging=${LETSENCRYPT_STAGING:-0}  # Set to 1 to use staging servers (for testing)

echo "=========================================="
echo "Q-Prime SSL Certificate Initialization"
echo "=========================================="
echo ""
echo "Domain: $DOMAIN"
echo "Email: $LETSENCRYPT_EMAIL"
echo "Staging: $staging"
echo ""

# Check for existing certificates
if [ -d "$data_path/conf/live/$DOMAIN" ]; then
    read -p "Existing certificates found. Replace them? (y/N) " decision
    if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
        echo "Keeping existing certificates."
        exit 0
    fi
fi

# Create required directories
mkdir -p "$data_path/conf/live/$DOMAIN"
mkdir -p "$data_path/www"

# Download recommended TLS parameters if needed
if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
    echo "Downloading recommended TLS parameters..."
    mkdir -p "$data_path/conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
    curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
    echo ""
fi

# Create dummy certificate
echo "Creating dummy certificate for $DOMAIN..."
path="/etc/letsencrypt/live/$DOMAIN"
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" run --rm --entrypoint "\
    openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1 \
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo ""

# Start nginx
echo "Starting nginx..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" up --force-recreate -d nginx-proxy
echo ""

# Wait for nginx to be ready
echo "Waiting for nginx to start..."
sleep 5

# Delete dummy certificate
echo "Deleting dummy certificate..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" run --rm --entrypoint "\
    rm -Rf /etc/letsencrypt/live/$DOMAIN && \
    rm -Rf /etc/letsencrypt/archive/$DOMAIN && \
    rm -Rf /etc/letsencrypt/renewal/$DOMAIN.conf" certbot
echo ""

# Request real certificate
echo "Requesting Let's Encrypt certificate for $DOMAIN..."

# Select staging or production
if [ $staging != "0" ]; then
    staging_arg="--staging"
    echo "(Using STAGING server - certificates will NOT be valid)"
else
    staging_arg=""
fi

docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" run --rm --entrypoint "\
    certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    --email $LETSENCRYPT_EMAIL \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN" certbot
echo ""

# Reload nginx
echo "Reloading nginx..."
docker compose -f "$DOCKER_DIR/docker-compose.yml" --env-file "$PROJECT_ROOT/.env.docker" exec nginx-proxy nginx -s reload

echo ""
echo "=========================================="
echo "SSL Certificate initialization complete!"
echo "=========================================="
echo ""
echo "Your site should now be accessible at: https://$DOMAIN"
echo ""
echo "To set up automatic renewal, add this to your crontab:"
echo "  0 3 * * * $PROJECT_ROOT/docker/scripts/renew-certs.sh"
