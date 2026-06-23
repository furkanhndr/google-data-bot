# Playwright's official image ships Chromium + all system deps.
FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

# Install workspace deps. Copy manifests first for better layer caching.
COPY package.json package-lock.json ./
COPY packages/shared-types/package.json packages/shared-types/
COPY scraper-service/package.json scraper-service/
RUN npm ci --omit=dev --workspace=@googlebusinessdata/scraper-service --include-workspace-root

# Source
COPY tsconfig.base.json ./
COPY packages/shared-types packages/shared-types
COPY extension/src/content/extractor.ts extension/src/content/extractor.ts
COPY scraper-service scraper-service

ENV NODE_ENV=production
CMD ["npm", "run", "start", "--workspace=@googlebusinessdata/scraper-service"]
