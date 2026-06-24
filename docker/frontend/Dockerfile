# Q-Prime Frontend Dockerfile
# Multi-stage build: npm build → nginx serve
#
# Build args (passed from docker-compose):
# - VITE_CONVEX_URL: Public Convex API URL
# - VITE_APP_CONVEX_SITE_URL: Public Convex Site URL
# - VITE_APP_GOOGLE_CLIENT_ID: Google OAuth client ID
# - VITE_SINGLE_COURSE_MODE: "true" for single-OHQ deployment (root redirects to the one course)
# - BASE_PATH: sub-path the app is served from (default "/"; e.g. "/ohq/" when fronted by a shared host nginx)

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
ARG VITE_CONVEX_URL
ARG VITE_APP_CONVEX_SITE_URL
ARG VITE_APP_GOOGLE_CLIENT_ID
ARG VITE_SINGLE_COURSE_MODE
ARG BASE_PATH=/

# Set environment variables for build
ENV VITE_CONVEX_URL=${VITE_CONVEX_URL}
ENV VITE_APP_CONVEX_SITE_URL=${VITE_APP_CONVEX_SITE_URL}
ENV VITE_APP_GOOGLE_CLIENT_ID=${VITE_APP_GOOGLE_CLIENT_ID}
ENV VITE_SINGLE_COURSE_MODE=${VITE_SINGLE_COURSE_MODE}
# VITE_BASE_PATH feeds the %VITE_BASE_PATH% replacement in index.html (theme bootstrap).
ENV VITE_BASE_PATH=${BASE_PATH}

# Build with the configured base path (default "/"; "/ohq/" for sub-path hosting).
RUN npm run build:quick -- --base=${BASE_PATH}

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
