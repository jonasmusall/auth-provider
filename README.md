# auth-provider

Provides a REST API for user authentication with JWT.

## REST API reference

### POST /user

Create a new user.

#### Request

```ts
{
  name: string
}
```

#### Reply

##### 200 OK

User created. Use first password token to set a first login password. This token can only be used a single time.

```ts
{
  firstPasswordToken: string,
  expiresAt: number
}
```

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

### PUT /user/${name}/first-password

Set the first password for this user.

#### Request

```ts
{
  firstPasswordToken: string,
  password: string
}
```

#### Reply

##### 201 Created

Password has been set. No reply body.

##### 404 Not Found

User not found or token invalid.

```ts
{
  statusCode: 404,
  error: 'Not Found',
  message: 'User not found or token invalid'
}
```

##### 409 Conflict

First password token has already been used.

```ts
{
  statusCode: 409,
  error: 'Conflict',
  message: 'Token already used'
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
