# Build stage — compile TypeScript and install all deps (needs native build tools)
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# Runtime stage — install only production deps and copy compiled output
FROM node:20-alpine AS runtime

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist/

CMD ["node", "dist/index.js"]
