# Multi-stage Dockerfile for React client app
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
# Only copy built static files and minimal files needed for serving
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
# Install only production dependencies (if needed for static server)
RUN npm ci --omit=dev
# Install a simple static server (e.g. serve)
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
