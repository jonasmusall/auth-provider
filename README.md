# auth-provider

Provides a REST API for user authentication with JWT.

**ToDo**
- Implement user deletion endpoint

## Docker image

Build with `docker build -t auth-provider .`. You can also use the prebuild [jonasmusall/auth-provider](https://hub.docker.com/r/jonasmusall/auth-provider) image (just replace the image name `auth-provider` with `jonasmusall/auth-provider` in the following commands).

To run the server using Docker, first generate the JWT keys and an empty database:

`docker run --rm -v $PWD/certs:/app/package/certs -u $(id -u):$(id -g) auth-provider scripts/keygen-jwt.sh`

> This creates a `certs` folder in the current directory and mounts it inside of the container running the `auth-provider` image you built. The `keygen-jwt.sh` script now generates the JWT keys and places them in that folder so they can be used later when actually running the server.

`docker run --rm -v $PWD/db:/app/package/prisma/db -u $(id -u):$(id -g) auth-provider npm run prisma-deploy`

> Here we tell Docker to create and mount a `db` folder and run `npm run prisma-deploy` inside of the container, invoking the Prisma CLI to create an empty database.

The second command can also be used to migrate to a new version of *auth-provider* where the database schema has changed.

After these setup steps, the server can be started with the following command (specify what IP and port you want it to listen to):

`docker run -v $PWD/certs:/app/package/certs -v $PWD/db:/app/package/prisma/db -p [<ip>:]<port>:8889 -u $(id -u):$(id -g) --name auth-provider auth-provider`

If you want to configure the server inside of the docker container to change parameters such as the token lifetime, mount a `config.json` file in the container by adding `-v <path to config file>:/app/package/config.json` to the flags of the command above. The `config.json` file may include the following fields:

```ts
{
  userNameAllowedRegEx: string,
  userNameReservedRegEx: string,
  tokenLifetime: number // in seconds
}
```

## REST API reference

### POST /user/${name}

Create a new user.

#### Request

```ts
{
  password: string
}
```

#### Reply

##### 201 Created

User created. No reply body.

##### 400 Bad Request

Username malformed. <!-- TODO: specify allowed format (RegEx?) -->

```ts
{
  statusCode: 400,
  error: 'Bad Request',
  message: 'Username malformed'
}
```

##### 409 Conflict

Username unavailable (already in use, reserved or not allowed).

```ts
{
  statusCode: 409,
  error: 'Conflict',
  message: 'Username unavailable'
}
```

### POST /user/${name}/token

Request a JWT for user authentication.

#### Request

```ts
{
  password: string
}
```

#### Reply

##### 200 OK

JWT has been created and signed.

```ts
{
  token: string,
  expiresAt: number
}
```

##### 404 Not Found

User not found or password incorrect.

```ts
{
  statusCode: 404,
  error: 'Not Found',
  message: 'User not found or password incorrect'
}
```

### PUT /user/${name}/password

Change a user's password.

#### Request

```ts
{
  password: string,
  newPassword: string
}
```

#### Reply

##### 201 Created

Password has been changed. No reply body.

##### 404 Not Found

User not found or password incorrect.

```ts
{
  statusCode: 404,
  error: 'Not Found',
  message: 'User not found or password incorrect'
}
```

### DELETE /user/${name}

Delete a user. *Not implemented yet.*

> #### Request
>
> ```ts
> {
>   password: string
> }
> ```
> 
> #### Reply
> 
> ##### 201 Created
> 
> User has been deleted. No reply body.
> 
> ##### 404 Not Found
> 
> User not found or password incorrect.
> 
> ```ts
> {
>   statusCode: 404,
>   error: 'Not Found',
>   message: 'User not found or password incorrect'
> }
> ```

### GET /publickey

Retrieve the PEM encoded public RSA key used to sign all JWTs.

#### Reply (200 OK)

```ts
{
  publicKey: string
}
```
