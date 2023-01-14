import fastify, { FastifyInstance } from 'fastify';
import * as schemas from './schemas.js';

const PORT = 8888;

const app: FastifyInstance = fastify();

// TODO: RSA keypair
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
  // TODO: send RSA public key
});

app.listen({ port: PORT }, (err, addr) => {
  if (err) throw err;
  console.log(`Listening on ${addr}`);
})
