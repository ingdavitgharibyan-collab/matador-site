# Matador: one container, data (SQLite + uploads) on the /data volume.
FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
ARG NEXT_PUBLIC_SERVER_URL
ENV NEXT_PUBLIC_SERVER_URL=$NEXT_PUBLIC_SERVER_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# a throwaway database for the build-time prerender; the real one lives on /data
RUN PAYLOAD_SECRET=build-only DATABASE_URI=file:/tmp/build.db ALLOW_OPEN_SIGNUP=1 npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DATABASE_URI=file:/data/matador.db MEDIA_DIR=/data/media BACKUP_DIR=/data/backups
COPY --from=build /app ./
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=60s --timeout=5s CMD node -e "fetch('http://localhost:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["npm", "run", "start"]
