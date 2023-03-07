# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /build/auth-provider
COPY . .
RUN npm i
RUN npm run build
RUN npm pack

FROM node:lts-alpine
RUN apk add openssl
WORKDIR /app/package
COPY --from=0 /build/auth-provider/auth-provider-*.tgz /tmp/app.tgz
RUN tar x -C /app -f /tmp/app.tgz
RUN rm /tmp/app.tgz
COPY scripts /app/package/scripts
CMD ["npm", "start"]
EXPOSE 8889
