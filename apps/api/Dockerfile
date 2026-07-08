# Stage 1: Build the TypeScript code
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/
RUN pnpm install --ignore-scripts
COPY . .
# Generate Prisma client for the build platform
RUN pnpm --filter @aicruiter/db exec prisma generate
RUN pnpm --filter @aicruiter/db build
RUN pnpm --filter @aicruiter/types build
RUN pnpm --filter @aicruiter/api build

# Stage 2: Production runtime image
FROM node:20-alpine AS runner
WORKDIR /app

# Install OpenSSL libs required by Prisma on Alpine
RUN apk add --no-cache openssl libssl3 libc6-compat

RUN npm install -g pnpm
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
COPY packages/types/package.json ./packages/types/

# Install ALL deps (not just prod) so prisma CLI is available for generate
RUN pnpm install --ignore-scripts

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/prisma ./packages/db/prisma
COPY --from=builder /app/packages/types/dist ./packages/types/dist

# Re-run prisma generate in the runner so the correct linux-musl binary is baked in
RUN pnpm --filter @aicruiter/db exec prisma generate

# AWS Lambda Web Adapter binary to run standard web server in Lambda
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 /lambda-adapter /opt/extensions/lambda-adapter

ENV PORT=4000
ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "apps/api/dist/server.js"]
