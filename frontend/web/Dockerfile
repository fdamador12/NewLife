# frontend/web/Dockerfile
# Patrón producción: build con ARG horneado, luego servidor Next.js standalone

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variable horneada en build time (no depende de .env.local ni de runtime)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# ── Imagen final ──────────────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

# Solo copiamos lo necesario para correr (no node_modules de dev)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]