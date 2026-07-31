# syntax=docker/dockerfile:1

FROM node:20-alpine AS base

# ─── Dependencies ──────────────────────────────────────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ─── Build ──────────────────────────────────────────────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Public env vars must be present at build time (Next.js inlines NEXT_PUBLIC_*).
# Default keeps the var unset (not empty string) when Dokploy doesn't pass the build arg.
ARG NEXT_PUBLIC_SITE_URL=https://cdc.stekom.ac.id
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# job/[slug] and event/[slug] call generateStaticParams() at build time, which
# fetches from the CDC/VJF APIs to prerender the newest listings — so these
# secrets must be present during `npm run build`, not just at container runtime.
# Pass them as build-time env vars in Dokploy (Advanced > Build Args), not
# committed here. They are not persisted into the final runtime image since
# only the standalone output is copied into the runner stage below.
ARG CDC_API_KEY
ARG VJF_API_KEY
ENV CDC_API_KEY=$CDC_API_KEY
ENV VJF_API_KEY=$VJF_API_KEY

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── Runtime ────────────────────────────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
