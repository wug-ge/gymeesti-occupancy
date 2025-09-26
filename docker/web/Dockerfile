
FROM node:24-alpine AS build

WORKDIR /app
COPY ./apps/web .
ENV ENV "PROD"

RUN npm ci --loglevel verbose && npm run build

# Stage 2: Create a minimal image for serving the application
FROM node:24-alpine

WORKDIR /app
ENV HOST 0.0.0.0
ENV ENV "PROD"

# Copy only necessary files from the build stage
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]