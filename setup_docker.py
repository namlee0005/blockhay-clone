import os
import re

# 1. Update next.config.ts for standalone output
config_path = 'next.config.ts'
with open(config_path, 'r') as f:
    content = f.read()

if 'output: "standalone"' not in content:
    content = content.replace('allowedDevOrigins:', 'output: "standalone",\n  allowedDevOrigins:')
    with open(config_path, 'w') as f:
        f.write(content)

# 2. Create Dockerfile
dockerfile = """FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED=1
# Ensure the correct env vars for build time if necessary
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Create local upload dir
RUN mkdir -p public/uploads
RUN chown -R nextjs:nodejs public/uploads

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
"""
with open('Dockerfile', 'w') as f:
    f.write(dockerfile)

# 3. Create .dockerignore
dockerignore = """Dockerfile
.dockerignore
node_modules
npm-debug.log
README.md
.next
.git
.env.local
.env.development.local
.env.test.local
.env.production.local
"""
with open('.dockerignore', 'w') as f:
    f.write(dockerignore)

# 4. Create docker-compose.yml
compose = """version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
      # Connect to the local mongo container
      - MONGODB_URI=mongodb://mongo:27017/blockhay
      - AUTH_SECRET=SnPfnA3W/srpLEOJ8Oza3is07ndUoLyig7r41XifkMc=
    volumes:
      # Persist local uploads across container restarts
      - uploads-data:/app/public/uploads
    depends_on:
      - mongo
    restart: unless-stopped

  mongo:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  mongo-data:
  uploads-data:
"""
with open('docker-compose.yml', 'w') as f:
    f.write(compose)

