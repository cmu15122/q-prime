## Step 5: Install Docker

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group (avoids needing sudo)
sudo usermod -aG docker $USER

# Install Docker Compose plugin
sudo apt install docker-compose-plugin -y

# Log out and back in for group changes to take effect
exit
```

Reconnect via SSH, then verify Docker works:

```bash
docker --version
docker compose version
```

## Step 6: Install Node.js via nvm

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Load nvm into current session
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install Node.js 20
nvm install 20
nvm use 20

# Verify installation
node --version
npm --version
```

## Step 7: Clone and Configure the Project

```bash
# Clone the repository
git clone https://github.com/cmu15122/q-prime.git
cd q-prime

# Install dependencies
npm ci
```

## Step 8: Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **APIs & Services > OAuth consent screen**
   - Select **External** user type
   - Fill in app name and your email
   - Add your domain to **Authorized domains** (e.g., `cmu.edu`)
   - Add scopes: `email`, `profile`, `openid`
   - **Publish** the app when ready
4. Go to **APIs & Services > Credentials**
5. Click **Create Credentials > OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins:**
     ```
     https://yourdomain.edu
     ```
   - **Authorized redirect URIs:**
     ```
     https://yourdomain.edu/api/auth/callback/google
     ```
6. Save your **Client ID** and **Client Secret**

## Step 9: Configure Environment

```bash
# Run the setup script (creates .env.docker from template)
./docker/scripts/setup.sh
```

The script will prompt you to edit `.env.docker`. Fill in:

```bash
# REQUIRED - Fill these in
DOMAIN=yourdomain.edu
LETSENCRYPT_EMAIL=admin@yourdomain.edu
AUTH_GOOGLE_ID=your-google-client-id.apps.googleusercontent.com
AUTH_GOOGLE_SECRET=your-google-client-secret
```

Run the setup script again after editing:

```bash
./docker/scripts/setup.sh
```

This will:

- Generate JWT keys automatically
- Generate the Convex admin key
- Update all derived URLs based on your domain

## Step 10: Initialize SSL Certificates

```bash
# Get SSL certificates from Let's Encrypt
./docker/scripts/init-letsencrypt.sh
```

This script will:

- Start nginx temporarily for the ACME challenge
- Obtain SSL certificates from Let's Encrypt
- Configure automatic renewal

## Step 11: Deploy Convex Functions

```bash
./docker/scripts/deploy-convex.sh
```

This deploys your Convex functions and sets all required environment variables.

## Step 12: Start All Services

```bash
docker compose -f docker/docker-compose.yml --env-file .env.docker up -d
```

Verify all containers are running:

```bash
docker compose -f docker/docker-compose.yml --env-file .env.docker ps
```

You should see all 5 containers running:

```
NAME                      SERVICE            STATUS
qprime-convex-backend     convex-backend     Up (healthy)
qprime-convex-dashboard   convex-dashboard   Up
qprime-frontend           frontend           Up
qprime-nginx-proxy        nginx-proxy        Up
qprime-certbot            certbot            Up
```

## Step 13: Initial Setup

1. Visit `https://yourdomain.edu/ohq/`
2. Click **Log In** and authenticate with Google
3. You'll be redirected to the initial setup page
4. Enter:
   - **Semester name** (e.g., "Fall 2026")
   - **Owner email(s)** - your admin email address(es)
5. Click **Save** to initialize the database

## Useful Commands

### View logs

```bash
# All services
docker compose -f docker/docker-compose.yml --env-file .env.docker logs -f

# Specific service
docker compose -f docker/docker-compose.yml --env-file .env.docker logs -f convex-backend
```

### Restart services

```bash
docker compose -f docker/docker-compose.yml --env-file .env.docker restart
```

### Stop all services

```bash
docker compose -f docker/docker-compose.yml --env-file .env.docker down
```

### Update deployment

```bash
# Pull latest code
git pull

# Rebuild frontend and redeploy
./docker/scripts/deploy-convex.sh
docker compose -f docker/docker-compose.yml --env-file .env.docker up -d --build frontend
```

### Access Convex Dashboard

The Convex dashboard runs on port 6791 but is only accessible locally. Use SSH tunneling:

```bash
# From your local machine
ssh -i ~/path/to/q-prime-key.pem -L 6791:localhost:6791 ubuntu@<your-instance-ip>

# Then open http://localhost:6791 in your browser
```

### Backup data

```bash
./docker/scripts/backup.sh
```

Backups are stored in the `backups/` directory.

## Troubleshooting

### Container won't start

```bash
# Check logs for errors
docker compose -f docker/docker-compose.yml --env-file .env.docker logs convex-backend

# Verify environment variables
cat .env.docker
```

### SSL certificate issues

```bash
# Check certificate status
sudo certbot certificates

# Force renewal
./docker/scripts/renew-certs.sh
```

### OAuth not working

1. Verify your Google OAuth callback URL matches exactly:
   ```
   https://yourdomain.edu/api/auth/callback/google
   ```
2. Check that `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are set correctly
3. Ensure your Google OAuth app is **published** (not in testing mode)

### Database issues

```bash
# Access the Convex dashboard via SSH tunnel to inspect data
# See "Access Convex Dashboard" section above
```

### Frontend not loading

```bash
# Rebuild frontend
docker compose -f docker/docker-compose.yml --env-file .env.docker up -d --build frontend

# Check nginx logs
docker compose -f docker/docker-compose.yml --env-file .env.docker logs nginx-proxy
```

## Architecture Overview

```
                    ┌─────────────────┐
                    │   Internet      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  nginx-proxy    │ :80, :443
                    │  (SSL, routing) │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│   frontend    │   │convex-backend │   │    certbot    │
│  (Vite build) │   │  :3210/:3211  │   │  (SSL certs)  │
│     :4000     │   └───────────────┘   └───────────────┘
└───────────────┘

Routes:
  /ohq/*           → frontend
  /api/*           → convex-backend:3210 (WebSocket + API)
  /api/auth/*      → convex-backend:3211 (OAuth callbacks)
  /.well-known/*   → convex-backend:3211 (OIDC discovery)
```

## Security Notes

- The `.env.docker` file contains secrets - never commit it to git
- The Convex dashboard is only accessible via SSH tunnel
- SSL certificates auto-renew via certbot
- All traffic is forced to HTTPS in production
