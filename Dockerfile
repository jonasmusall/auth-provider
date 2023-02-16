# syntax=docker/dockerfile:1

FROM node:lts-alpine
WORKDIR /build/auth-provider
COPY . .
RUN npm i
RUN npm run build
RUN npm run prisma-generate
RUN npm pack

FROM node:lts-alpine
RUN apk add openssl
WORKDIR /app/package
COPY --from=0 /build/auth-provider/auth-provider-*.tgz /tmp/app.tgz
RUN tar x -C /app -f /tmp/app.tgz
RUN rm /tmp/app.tgz
COPY --from=0 /build/auth-provider/node_modules/.prisma /app/package/node_modules/.prisma
COPY --from=0 /build/auth-provider/node_modules/.bin /app/package/node_modules/.bin
COPY scripts /app/package/scripts
CMD ["npm", "start"]
EXPOSE 8889
