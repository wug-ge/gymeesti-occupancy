# ---- Base versions (override at build time if needed) ----
ARG NODE_IMAGE=node:24-alpine

# ---- Build stage ----
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

COPY apps/api .

RUN npm ci && npm run build && npx prisma generate

# ---- Runtime stage ----
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app
COPY --from=builder  /app/               ./

EXPOSE 3000
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/main.js"]