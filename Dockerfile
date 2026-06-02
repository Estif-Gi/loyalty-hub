FROM oven/bun:latest AS builder

WORKDIR /app

COPY package.json bun.lockb bunfig.toml ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build


FROM oven/bun:latest

WORKDIR /app

COPY package.json bun.lockb bunfig.toml ./
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "dist/server/index.js"]