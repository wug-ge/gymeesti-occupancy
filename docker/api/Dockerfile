# ---- Base versions (override at build time if needed) ----
ARG NODE_IMAGE=node:24-alpine

# ---- Build stage ----
FROM ${NODE_IMAGE} AS builder
WORKDIR /app

COPY apps/api .

RUN npm ci
RUN npm run build

# ---- Runtime stage ----
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built app
COPY --from=builder  /app/dist               ./dist
COPY --from=builder  /app/node_modules               ./node_modules

EXPOSE 3001
CMD ["node", "dist/main.js"]
