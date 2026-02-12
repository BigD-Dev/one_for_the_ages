FROM nginx:alpine

# Copy static files
COPY . /usr/share/nginx/html

# Replace default NGINX config with simple SPA catch-all
RUN echo 'server { \
    listen 80; \
    location / { \
    root   /usr/share/nginx/html; \
    index  index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# ⚠️ ADMIN API URL: We need to inject runtime env vars
# This creates a small script that replaces __API_URL__ with the actual URL on startup
COPY entrypoint.sh /docker-entrypoint.d/99-env-subst.sh
RUN chmod +x /docker-entrypoint.d/99-env-subst.sh
