# syntax=docker/dockerfile:1
FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm i
RUN npm run build
CMD ["npm", "start"]
EXPOSE 8889
