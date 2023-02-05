# syntax=docker/dockerfile:1

FROM node:lts-alpine
ARG uid
ARG gid
COPY ./package.json /home/node/package.json
WORKDIR /home/node
# minimal install: get prisma version and delete everything else from package.json
RUN echo "{\"devDependencies\":{\"prisma\":$(npm pkg get devDependencies.prisma)}}" > package.json
RUN npm i
RUN mkdir -p /home/node/out/prisma
RUN chown -hR $uid:$gid /home/node
CMD ["npx", "prisma", "migrate", "reset", "-f"]
