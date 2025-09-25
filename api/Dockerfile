# Multi-stage Dockerfile for Node.js API (Azure Functions style)
# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Stage 2: Production
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=builder /app .
# Install only production dependencies
RUN npm ci --omit=dev
EXPOSE 7071
CMD ["npm", "start"]
