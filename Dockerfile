FROM node:22-alpine

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install @11ty/eleventy
COPY . .
RUN npx @11ty/eleventy

ENV PORT=3000
EXPOSE 3000
CMD ["node", "server.js"]
