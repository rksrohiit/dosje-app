# syntax=docker/dockerfile:1
FROM node:20-alpine

# Install build tools for better-sqlite3 native module
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy rest of source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose API port
EXPOSE 5000

# Seed DB then start server
CMD ["sh", "-c", "node db/seed.js && node index.js"]
