ARG BASE_IMAGE=node:22-alpine
FROM ${BASE_IMAGE}

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY dist/ dist/

EXPOSE 8080
CMD ["node", "dist/index.js"]
