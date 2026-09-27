# Fastify API. poppler-utils provides pdftoppm for cited-page previews.
FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y --no-install-recommends poppler-utils && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
# Dev dependencies are needed: the API runs through tsx and creates its schema with drizzle-kit.
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY api ./api
COPY src/shared ./src/shared
COPY scripts ./scripts
COPY drizzle.config.ts tsconfig.json ./
ENV NODE_ENV=production API_HOST=0.0.0.0 API_PORT=4000
EXPOSE 4000
# Enable pgvector and create missing tables (idempotent), then start the API.
CMD ["sh", "-c", "node scripts/ensure-pgvector.mjs && npx drizzle-kit push && node node_modules/tsx/dist/cli.mjs api/server.ts"]
