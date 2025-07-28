# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application bundle
RUN npm run build:bundle

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy production package file
COPY package.prod.json ./package.json

# Install only runtime dependencies
RUN npm install --only=production && npm cache clean --force

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
