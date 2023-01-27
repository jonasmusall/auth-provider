#! /bin/sh

docker build -t jonasmusall/auth-provider:init-db . -f ./docker/init-db/Dockerfile
docker run -it -v $PWD/prisma:/home/node/prisma -u $(id -u):$(id -g) --rm jonasmusall/auth-provider:init-db
