FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
COPY scripts/patch-drizzle-kit.js ./scripts/patch-drizzle-kit.js
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js telemetry is disabled
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_OUTPUT_STANDALONE=1

# These are the only build-time public vars needed
ENV NEXT_PUBLIC_APP_URL=""
ENV NEXT_PUBLIC_POSTHOG_KEY=""
ENV NEXT_PUBLIC_POSTHOG_HOST=""

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set the correct permission for prerender cache
RUN mkdir -p .next public
RUN chown nextjs:nodejs .next

# Install production dependencies for runtime scripts and server modules.
COPY package.json package-lock.json* ./
COPY scripts/patch-drizzle-kit.js ./scripts/patch-drizzle-kit.js
RUN npm ci --omit=dev

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/payload.config.ts ./payload.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/payload ./payload
# Needed by scripts/seed-public-content.ts in runtime image.
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@esbuild/linux-x64 ./node_modules/@esbuild/linux-x64
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/resolve-pkg-maps ./node_modules/resolve-pkg-maps

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
