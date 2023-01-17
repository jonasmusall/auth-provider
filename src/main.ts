import fastify, { FastifyInstance } from 'fastify';
import { readFile, stat } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { sign } from './lib/jwt.js';
import * as schemas from './schemas.js';

const PORT = 8888;
const PROJECT_ROOT = fileURLToPath(new URL('..', import.meta.url));

const app: FastifyInstance = fastify();

const privateKeyPath = resolve(PROJECT_ROOT, 'certs', 'private.pem');
const publicKeyPath = resolve(PROJECT_ROOT, 'certs', 'public.pem');
if (!(await stat(privateKeyPath)).isFile || !(await stat(publicKeyPath)).isFile) {
  console.error(`private or public key file missing in ${resolve(PROJECT_ROOT, 'certs')}`);
  process.exit(1);
}
const privateKey = await readFile(privateKeyPath, { encoding: 'utf8' });
const publicKey = await readFile(publicKeyPath, { encoding: 'utf8' });

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

app.get<{
  Body: schemas.IGetToken,
  Params: schemas.INameUrl
}>(
  '/user/:name/token',
  { schema: { body: schemas.getTokenSchema } },
  async (request, reply) => {
    // TODO: check password, create and send JWT
    
    // dummy JWT
    const jwt = await sign({
      sub: request.params.name
    }, privateKey);
    reply.send({
      token: jwt,
      expiresAt: 0
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
    publicKey: publicKey
  });
});

app.listen({ port: PORT }, (err, addr) => {
  if (err) throw err;
  console.log(`Listening on ${addr}`);
});
