FROM node:22-alpine

WORKDIR /app

ENV DATABASE_URL=file:/app/data/dev.db

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

RUN npm run build

RUN chmod +x docker-entrypoint.sh && mkdir -p /app/data

EXPOSE 3000

CMD ["./docker-entrypoint.sh"]
