FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/agent/package.json ./packages/agent/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY packages/agent/ ./packages/agent/
COPY tsconfig.json ./

# Build
RUN pnpm --filter agent build

# ── Production Stage ──
FROM node:22-alpine

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=builder /app/packages/agent/package.json ./packages/agent/
RUN pnpm install --filter agent --prod --frozen-lockfile

COPY --from=builder /app/packages/agent/dist/ ./packages/agent/dist/

ENV NODE_ENV=production
ENV AGENT_PORT=3001

EXPOSE 3001

CMD ["node", "packages/agent/dist/index.js"]
