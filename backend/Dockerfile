FROM node:14-alpine as builder

WORKDIR /app
COPY package*.json ./

RUN npm install
COPY . .
RUN npm run test
RUN npm prune --production

FROM node:14-alpine as runner
WORKDIR /app

COPY --from=builder /app/ /app

EXPOSE 4000
CMD ["npm", "run", "start"]
