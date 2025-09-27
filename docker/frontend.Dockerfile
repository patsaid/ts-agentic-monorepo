# Multi-stage build for React frontend
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm install

# Development stage
FROM base AS development
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev:frontend"]

# Build stage
FROM base AS build
COPY . .
RUN npm run build:frontend

# Production stage
FROM nginx:alpine AS production
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]