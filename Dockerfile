FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY server.js logger.js auth.js ./
COPY middleware ./middleware

EXPOSE 8080

CMD ["sh", "-c", "npx prisma db push --skip-generate && node server.js"]
