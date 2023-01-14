import fastify, { FastifyInstance } from 'fastify';
import { IPostUser, postUserSchema } from './schemas.js';

const PORT = 8888;

const app: FastifyInstance = fastify();

// TODO: RSA keypair
// TODO: database

app.post<{
  Body: IPostUser
}>(
  '/user',
  { schema: { body: postUserSchema } },
  async (request, reply) => {
    // TODO: check name form (RegEx?), check db if name exists, reply
  }
);

app.listen({ port: PORT }, (err, addr) => {
  if (err) throw err;
  console.log(`Listening on ${addr}`);
})
