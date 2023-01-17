import * as _jwt from 'jsonwebtoken';

// promisification of jsonwebtoken.sign
/**
 * Asynchronously sign the given payload into a JWT string with RSA SHA256.
 * @param payload Payload to sign.
 * @param privateKey PEM encoded private RSA key.
 * @returns The JWT string.
 */
export function sign(payload: _jwt.JwtPayload, privateKey: string): Promise<string> {
  return new Promise((resolve, reject) => {
    _jwt.sign(payload, privateKey, { algorithm: 'RS256' }, (err, token) => {
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
