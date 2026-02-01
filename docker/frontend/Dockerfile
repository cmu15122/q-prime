# Q-Prime Frontend Dockerfile
# Multi-stage build: npm build → nginx serve
#
# Build args (passed from docker-compose):
# - VITE_APP_CONVEX_URL: Public Convex API URL
# - VITE_APP_CONVEX_SITE_URL: Public Convex Site URL
# - VITE_APP_GOOGLE_CLIENT_ID: Google OAuth client ID

# Stage 1: Build the Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_APP_CONVEX_URL
ARG VITE_APP_CONVEX_SITE_URL
ARG VITE_APP_GOOGLE_CLIENT_ID
ARG HTTP_CLIENT_PREFIX=/ohq

# Set environment variables for build
ENV VITE_APP_CONVEX_URL=${VITE_APP_CONVEX_URL}
ENV VITE_APP_CONVEX_SITE_URL=${VITE_APP_CONVEX_SITE_URL}
ENV VITE_APP_GOOGLE_CLIENT_ID=${VITE_APP_GOOGLE_CLIENT_ID}

# Build the application with configurable base path (quick build, no typecheck/lint)
RUN npm run build:quick -- --base=${HTTP_CLIENT_PREFIX}/

# Stage 2: Serve with NGINX
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy public assets (favicon, etc.)
COPY --from=builder /app/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
