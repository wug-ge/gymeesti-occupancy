
FROM node:24-alpine AS build

WORKDIR /app
COPY . .
ENV ENV "PROD"

RUN cd ./apps/web && npm i && npm run build

# Stage 2: Create a minimal image for serving the application
FROM node:24-alpine

WORKDIR /app
ENV HOST 0.0.0.0
ENV ENV "PROD"

# Copy only necessary files from the build stage
COPY --from=build /app/apps/web/.output ./.output
COPY --from=build /app/apps/web/package.json ./package.json
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]