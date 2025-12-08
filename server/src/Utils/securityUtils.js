import jwt from 'jsonwebtoken';
import { generateKeyPairSync } from 'crypto';
import bycrpt from 'bcrypt';

import dotenv from 'dotenv';

dotenv.config({
   quiet: true,
   overwrite: false,
});

class SecurityUser {
   static async hashPassword(plaintPassword) {
      const salt = 10;
      const hashedPassword = await bycrpt.hash(plaintPassword, salt);

      return hashedPassword;
   }

   static createTokens(payload, private_key) {
      try {
         const accessToken = jwt.sign(
            payload,
            {
               key: private_key,
               passphrase: process.env.PASSPHRASE_SECRET,
            },
            {
               algorithm: 'RS256',
               expiresIn: '1d',
            }
         );

         const refreshToken = jwt.sign(
            payload,
            {
               key: private_key,
               passphrase: process.env.PASSPHRASE_SECRET,
            },
            {
               algorithm: 'RS256',
               expiresIn: '7d',
            }
         );
         const userToken = { accessToken, refreshToken };

         return userToken;
      } catch (error) {
         console.error('Create tokens error:', error);
         throw error;
      }
   }

   static generateUserKey() {
      const { publicKey, privateKey } = generateKeyPairSync('rsa', {
         modulusLength: 2048,
         publicKeyEncoding: {
            type: 'spki',
            format: 'pem',
         },
         privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: process.env.PASSPHRASE_SECRET,
         },
      });
      return { publicKey, privateKey };
   }
}

export default SecurityUser;
