#!/bin/sh

# 替换运行时配置
sed -i "s|PLACEHOLDER_API_ENDPOINT|${NEXT_PUBLIC_API_ENDPOINT}|g" /app/public/config.js

exec "$@"
