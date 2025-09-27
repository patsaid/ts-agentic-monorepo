# Multi-stage build for NestJS backend
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm install

# Development stage
FROM base AS development
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev:backend"]

# Build stage
FROM base AS build
COPY . .
RUN npm run build:backend

# Production stage
FROM node:18-alpine AS production
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=build /app/apps/backend/dist ./apps/backend/dist
COPY --from=build /app/libs ./libs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
USER nestjs

EXPOSE 3000
CMD ["node", "apps/backend/dist/main"]