import { uuidv7 } from 'uuidv7';

import SecurityUser from '../Utils/securityUtils.js';
import RepoAccount from '../repositories/repoAccount.js';
import RepoSecurity from '../repositories/repoSecurity.js';

import { transactionQuery } from './databaseServices.js';
class AuthServices {
   static async login({ identifier, password }) {
      try {
         const account = await RepoAccount.findByIdentifier(identifier);

         if (!account) {
            return {
               statusCode: 404,
               message: 'Tài khoản không tồn tại!',
            };
         }
         const isValid = await SecurityUser.comparePassword(password, account.hash_password);

         if (!isValid) {
            return {
               statusCode: 401,
               message: 'Mật khẩu không chính xác!',
            };
         }

         const security = await RepoSecurity.getSecurity(account.ac_id);

         if (!security) {
            return {
               statusCode: 500,
               message: 'Không tìm thấy khóa bảo mật cho tài khoản!',
            };
         }

         const payload = {
            ac_id: account.ac_id,
            username: account.username,
            email: account.email,
            role: account.role,
         };

         const { accessToken, refreshToken } = SecurityUser.createTokens(
            payload,
            security.private_key
         );

         await RepoSecurity.updateRefreshToken(account.ac_id, refreshToken);

         return {
            statusCode: 200,
            message: 'Đăng nhập thành công!',
            data: {
               user: payload,
               accessToken,
               refreshToken,
            },
         };
      } catch (err) {
         console.error('Login Service Error:', err);
         return {
            statusCode: 500,
            message: 'Lỗi hệ thống, vui lòng thử lại sau!',
         };
      }
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
            fullName: formData.fullName,
            role: formData.role || 'patient',
         };

         const payload = {
            ac_id: newAccount.ac_id,
            username: newAccount.username,
            email: newAccount.email,
            fullName: newAccount.fullName,
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
