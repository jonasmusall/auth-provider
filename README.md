# auth-provider

Provides a REST API for user authentication with JWT.

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

### GET /publickey

Retrieve the PEM encoded public RSA key used to sign all JWTs.

#### Reply (200 OK)

```ts
{
  publicKey: string
}
```
