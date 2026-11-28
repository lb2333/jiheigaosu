FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
RUN corepack enable pnpm
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder --chown=node:node /app/.next/standalone ./

USER node
EXPOSE 3000
CMD ["node", "server.js"]
