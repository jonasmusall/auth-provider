import jsonwebtoken from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
const { sign: _sign } = jsonwebtoken;

// promisification of jsonwebtoken.sign
/**
 * Asynchronously sign the given payload into a JWT string with RSA SHA256.
 * @param payload Payload to sign.
 * @param privateKey PEM encoded private RSA key.
 * @returns The JWT string.
 */
export function sign(payload: JwtPayload, privateKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    _sign(payload, privateKey, { algorithm: 'RS256' }, (err, token) => {
      if (err !== null) {
        reject(err);
        return;
      }
      if (token === undefined) {
        reject({
          name: 'SigningError',
          message: 'token is undefined'
        });
        return;
      }
      resolve(token);
    });
  });
}
