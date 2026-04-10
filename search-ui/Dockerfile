FROM oven/bun AS build

WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

FROM oven/bun

WORKDIR /app

COPY --from=build /app/.output .output

EXPOSE 3000

CMD ["bun", "run", "./.output/server/index.mjs"]
