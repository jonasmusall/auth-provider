import fastify, { FastifyInstance } from 'fastify';
import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { sign } from './lib/jwt.js';
import * as schemas from './schemas.js';

const PORT = 8889;
const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));

const app: FastifyInstance = fastify();

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
  console.error(`private or public key file for JWT signing missing in ${resolve(PROJECT_ROOT, 'certs', 'jwt')}`);
  process.exit(1);
}
const privateJwtKey = await readFile(privateJwtKeyPath, { encoding: 'utf8' });
const publicJwtKey = await readFile(publicJwtKeyPath, { encoding: 'utf8' });

// TODO: database

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
    // TODO: check password, create and send JWT
    if (request.params.name !== 'test' || request.body.password !== '1234') {
      reply.code(404);
      reply.send({
        reason: 'User not found or password incorrect'
      });
      return;
    }
    
    // dummy JWT
    const jwt = await sign({
      sub: request.params.name
    }, privateJwtKey);
    reply.send({
      token: jwt,
      expiresAt: Date.now() + 3600,
      maxAge: 3600
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

app.listen({ port: PORT }, (err, addr) => {
  if (err) throw err;
  console.log(`Listening on ${addr}`);
});
