# frontend/web/Dockerfile
# Patrón producción: build con ARG horneado, luego servidor Next.js standalone

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Variables horneadas en build time (no dependen de .env.local ni de runtime)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# URL del mobile-api para el formulario de eliminar cuenta
ARG NEXT_PUBLIC_MOBILE_API_URL
ENV NEXT_PUBLIC_MOBILE_API_URL=$NEXT_PUBLIC_MOBILE_API_URL

RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
