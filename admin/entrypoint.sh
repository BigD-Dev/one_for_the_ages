#!/bin/sh
# Inject API_BASE_URL into admin.js
echo "Setting API_BASE to: $API_BASE_URL"
sed -i "s|const API_BASE = '.*'|const API_BASE = '$API_BASE_URL'|g" /usr/share/nginx/html/admin.js
