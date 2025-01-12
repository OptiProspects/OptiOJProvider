FROM node:20.10.0-alpine AS builder

ARG NEXT_PUBLIC_GIT_SHA
ENV NEXT_PUBLIC_GIT_SHA=$NEXT_PUBLIC_GIT_SHA

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm cache clean --force && \
    rm -rf node_modules && \
    npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:20.10.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
