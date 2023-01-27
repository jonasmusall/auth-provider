# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /src/auth-provider
COPY . .
RUN npm i
RUN npm run build
RUN npm pack

FROM node:lts-alpine
WORKDIR /app/package
COPY --from=0 /src/auth-provider/auth-provider-*.tgz /tmp/app.tgz
RUN tar x -C /app -f /tmp/app.tgz
CMD ["npm", "start"]
EXPOSE 8889
