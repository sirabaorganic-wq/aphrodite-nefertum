# Stage 1: Build TypeScript and generate Prisma artifacts
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json ./
COPY src ./src/

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

# Stage 2: Minimal runtime image
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 5000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
