#! /bin/sh

# Use this script to generate an RSA keypair for signing JWTs. Run from project root directory.

mkdir -p certs/jwt
cd certs/jwt
echo "generating private RSA key"
openssl genpkey -out private.pem -quiet -algorithm RSA -pkeyopt rsa_keygen_bits:4096
echo "generating public RSA key"
openssl rsa -in private.pem -out public.pem -pubout
echo "done"
