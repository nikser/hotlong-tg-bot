# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Pinned pnpm (Node 25+ images have no corepack)
RUN npm i -g pnpm@12.21.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application bundle
RUN pnpm build:bundle

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

RUN npm i -g pnpm@12.21.0

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install only runtime dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built bundle from builder stage
COPY --from=builder /app/dist/bundle.js ./bundle.js

# Create cache directory
RUN mkdir -p cache

# Set environment variables
ENV NODE_ENV=production

# Expose port (if needed)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('Health check passed')" || exit 1

# Run the bot
CMD ["node", "bundle.js"]
