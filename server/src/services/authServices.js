import { uuidv7 } from 'uuidv7';

import SecurityUser from '../Utils/securityUtils.js';
import RepoAccount from '../repositories/repoAccount.js';
import { transactionQuery } from './databaseServices.js';

class AuthServices {
   static async login({ identifier, password }) {
      return {
         statusCode: 200,
         message: 'Đăng nhập thành công!',
         data: newAccount,
      };
   }

   static async register(formData) {
      try {
         const hashedPassword = await SecurityUser.hashPassword(formData.password);

         const newAccount = {
            ac_id: uuidv7(),
            username: formData.username,
            email: formData.email,
            phone: formData.phone || null,
            hash_password: hashedPassword,
            role: formData.role || 'patient',
         };

         const payload = {
            ac_id: newAccount.ac_id,
            username: newAccount.username,
            email: newAccount.email,
            role: newAccount.role,
         };

         const { publicKey, privateKey } = SecurityUser.generateUserKey();
         const { accessToken, refreshToken } = SecurityUser.createTokens(payload, privateKey);

         const newSecurity = {
            publicKey,
            privateKey,
            accessToken,
            refreshToken,
         };

         await transactionQuery(async (connection) => {
            await RepoAccount.createAccount(newAccount, connection);
            await RepoAccount.createSecurity(newAccount.ac_id, newSecurity, connection);
         });

         return {
            statusCode: 201,
            message: 'Tạo tài khoản thành công!',
            data: {
               newAccount: payload,
               token: {
                  accessToken: newSecurity.accessToken,
                  refreshToken: newSecurity.refreshToken,
               },
            },
         };
      } catch (err) {
         console.error('Register Service Error:', err);

         return {
            statusCode: 500,
            message: 'Lỗi hệ thống, vui lòng thử lại sau!',
         };
      }
   }
}

export default AuthServices;
