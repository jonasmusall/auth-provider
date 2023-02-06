import { PrismaClient } from '@prisma/client';
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import fastify, { FastifyInstance } from 'fastify';
import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { sign } from './lib/jwt.js';
import * as schemas from './schemas.js';

const PORT = 8889;
const HOST = '0.0.0.0';
const UNAME_REGEX = /^[a-z0-9]+(?:[a-z0-9_-]*[a-z0-9]+)?$/i;
const UNAME_RESERVED_REGEX = /^(?:root|admin)$/i;
const TOKEN_LIFETIME = 60; // in seconds
const SALT_LENGTH = 16;
const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));

const app: FastifyInstance = fastify();

const db = new PrismaClient();

const { privateJwtKey, publicJwtKey } = await getJwtKeypair();
if (privateJwtKey === undefined) {
  console.error(`private or public key file for JWT signing missing in ${resolve(PROJECT_ROOT, 'certs', 'jwt')}`);
  process.exit(1);
}

app.post<{
  Body: schemas.IPasswordBody,
  Params: schemas.INameUri
}>(
  '/user/:name',
  { schema: { body: schemas.passwordBodySchema } },
  async (request, reply) => {
    // check if username is well-formed
    if (!request.params.name.match(UNAME_REGEX)) {
      reply.code(400);
      reply.send({
        reason: 'Username malformed'
      });
      return;
    }

    // check if username is reserved or already taken
    if (
      request.params.name.match(UNAME_RESERVED_REGEX) ||
      (await db.user.count({
        where: {
          name: request.params.name
        }
      })) > 0
    ) {
      reply.code(409);
      reply.send({
        reason: 'Username unavailable'
      });
      return;
    }

    // username acceptable, create password hash and insert user into database
    const salt = generateSalt();
    const hash = getPasswordHash(request.body.password, salt);
    await db.user.create({
      data: {
        name: request.params.name,
        salt,
        hash
      }
    });
    reply.code(201);
    reply.send({});
  }
);

app.post<{
  Body: schemas.IPasswordBody,
  Params: schemas.INameUri
}>(
  '/user/:name/token',
  { schema: { body: schemas.passwordBodySchema } },
  async (request, reply) => {
    // search user in database
    const user = await db.user.findUnique({
      where: {
        name: request.params.name
      }
    });

    // reply 404 if user does not exist
    if (user === null) {
      reply.code(404);
      reply.send({
        reason: 'User not found or password incorrect'
      });
      return;
    }

    // calculate hash from input password and compare to stored hash
    // reply 404 if hashes (passwords) do not match
    const hash = getPasswordHash(request.body.password, user.salt);
    if (!timingSafeEqual(hash, user.hash)) {
      reply.code(404);
      reply.send({
        reason: 'User not found or password incorrect'
      });
      return;
    }

    // user authentication successful, reply with new JWT
    const jwt = await sign({
      sub: request.params.name
    }, privateJwtKey);
    reply.send({
      token: jwt,
      expiresAt: Date.now() + TOKEN_LIFETIME,
      maxAge: TOKEN_LIFETIME
    });
  }
);

app.put<{
  Body: schemas.IUpdatePasswordBody,
  Params: schemas.INameUri
}>(
  '/user/:name/password',
  { schema: { body: schemas.updatePasswordBodySchema } },
  async (request, reply) => {
    // TODO: check old password, set new one
  }
);

app.get('/publickey', async (request, reply) => {
  reply.send({
    publicKey: publicJwtKey
  });
});

async function getJwtKeypair(): Promise<{ privateJwtKey?: string, publicJwtKey?: string }> {
  const privateJwtKeyPath = resolve(PROJECT_ROOT, 'certs', 'jwt', 'private.pem');
  const publicJwtKeyPath = resolve(PROJECT_ROOT, 'certs', 'jwt', 'public.pem');
  let jwtKeyFilesCheck = false;
  try {
    jwtKeyFilesCheck = (await stat(privateJwtKeyPath)).isFile() && (await stat(publicJwtKeyPath)).isFile();
  } catch (error: any) {
    if ('ENOENT' != error?.code) {
      throw error;
    }
  }
  if (!jwtKeyFilesCheck) {
    return {};
  }
  return {
    privateJwtKey: await readFile(privateJwtKeyPath, { encoding: 'utf8' }),
    publicJwtKey: await readFile(publicJwtKeyPath, { encoding: 'utf8' })
  };
}

function getPasswordHash(password: string, salt: Buffer): Buffer {
  return sha256Hash(Buffer.concat([
    Buffer.from(password, 'utf8'),
    salt
  ]));
}

function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

function sha256Hash(input: Buffer): Buffer {
  return createHash('sha256').update(input).digest();
}

app.listen({ port: PORT, host: HOST }, (err, addr) => {
  if (err) throw err;
  console.log(`Listening on ${addr}`);
});
