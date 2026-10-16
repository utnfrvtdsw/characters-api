FROM docker.io/library/node:22-bookworm-slim AS build
WORKDIR /app
ENV HUSKY=0
COPY package*.json ./
RUN npm ci
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN npm run build

FROM docker.io/library/node:22-bookworm-slim AS dependencies
WORKDIR /app
COPY package*.json ./
# Husky is a development dependency; skip lifecycle scripts in this stage.
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

FROM docker.io/library/node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node package*.json ./
USER node
EXPOSE 3000
CMD ["node", "dist/init.js"]
