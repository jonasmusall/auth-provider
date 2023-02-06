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
  Body: schemas.IPostUser
}>(
  '/user',
  { schema: { body: schemas.postUserSchema } },
  async (request, reply) => {
    // TODO: check name form (RegEx?), check db if name exists, reply
  }
);

app.put<{
  Body: schemas.IPutFirstPassword,
  Params: schemas.INameUrl
}>(
  '/user/:name/first-password',
  { schema: { body: schemas.putFirstPasswordSchema } },
  async (request, reply) => {
    // TODO: check firstPasswordToken, create user
  }
);

app.post<{
  Body: schemas.IGetToken,
  Params: schemas.INameUrl
}>(
  '/user/:name/token',
  { schema: { body: schemas.getTokenSchema } },
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
  Body: schemas.IPutPassword,
  Params: schemas.INameUrl
}>(
  '/user/:name/password',
  { schema: { body: schemas.putPasswordSchema } },
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
