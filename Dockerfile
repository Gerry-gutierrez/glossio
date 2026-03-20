FROM node:22-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN npm install -g serve@14
COPY --from=builder /app/_site ./_site

EXPOSE 3000
CMD ["serve", "_site", "-l", "3000", "-s"]
