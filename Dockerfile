# Build the TypeScript project first
FROM node:20-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Runtime image only needs production deps + compiled JS
FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV ROLE=server
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 4000
# ROLE determines which process runs: worker or API server
CMD ["sh", "-c", "if [ \"$ROLE\" = \"worker\" ]; then npm run worker; else npm run start; fi"]
