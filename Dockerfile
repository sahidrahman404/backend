# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine AS base

RUN corepack enable
# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock .yarnrc.yml ./
RUN yarn --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.yarnrc.yml ./.yarnrc.yml
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrate ./migrate
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/start.sh ./
COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 4444

ENTRYPOINT [ "./start.sh" ]