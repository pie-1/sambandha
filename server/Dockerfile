FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 5000

CMD ["sh", "docker-entrypoint.sh"]
