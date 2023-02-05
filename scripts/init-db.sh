#! /bin/sh

docker build -t jonasmusall/auth-provider:init-db . -f ./docker/init-db/Dockerfile --build-arg uid=$(id -u) --build-arg gid=$(id -g)
mkdir -p $PWD/out/prisma/client
docker run -it -u $(id -u):$(id -g) -v $PWD/prisma:/home/node/prisma -v $PWD/out/prisma/client:/home/node/out/prisma/client --rm jonasmusall/auth-provider:init-db
