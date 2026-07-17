FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY index.js ./
COPY tasks.json ./

ENTRYPOINT ["node", "index.js"]
CMD ["list"]
