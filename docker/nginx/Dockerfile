# Q-Prime NGINX Reverse Proxy
# Based on: https://github.com/wmnnd/nginx-certbot

FROM nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Create directories
RUN mkdir -p /etc/nginx/templates

# Copy configs
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/default.conf.template /etc/nginx/templates/default.conf.template
COPY conf.d/default-http-only.conf.template /etc/nginx/templates/default-http-only.conf.template
COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 80 443

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
