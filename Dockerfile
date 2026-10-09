FROM node:24-bookworm-slim AS build
WORKDIR /app
RUN npm install --global pnpm@10.26.2
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
ARG PUBLIC_GA4_ID=""
ENV NODE_ENV=production PUBLIC_GA4_ID=${PUBLIC_GA4_ID}
RUN pnpm build && node scripts/verify-structure.mjs

FROM node:24-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321 UPLOAD_DIR=/app/uploads
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json drizzle.config.ts ./
COPY drizzle ./drizzle
COPY src/lib/db-env.mjs ./src/lib/db-env.mjs
COPY src/db/schema ./src/db/schema
COPY scripts/seed-admin.mjs ./scripts/seed-admin.mjs
RUN mkdir uploads && chown node:node uploads
USER node
EXPOSE 4321
HEALTHCHECK --interval=10s --timeout=5s --start-period=20s --retries=6 CMD node -e "fetch('http://127.0.0.1:4321/admin/login').then(r=>{if(r.status!==200)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "dist/server/entry.mjs"]
