# Stage 1 — Build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build for production (Vite outputs to /app/dist)
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:1.25-alpine

# Copy built app
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
