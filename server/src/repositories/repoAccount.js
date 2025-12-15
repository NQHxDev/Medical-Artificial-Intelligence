import { executeQuery, transactionQuery } from '../services/databaseServices.js';

/* Recommend:
   uuidv7 use Binary(16)
      INSERT INTO accounts (ac_id) VALUES (UUID_TO_BIN('018f8c2f-9f2a-7e12-a003-78e1611aa001', 1));
      SELECT BIN_TO_UUID(ac_id, 1) FROM accounts;
*/

class RepoAccount {
   static async checkExistsAccount(field, value) {
      try {
         const allowFields = ['email', 'username'];

         if (!allowFields.includes(field)) {
            throw new Error('Invalid field');
         }

         const queryCheckExisting = `Select 1 From accounts Where ${field} = ? LIMIT 1`;

         const result = await executeQuery(queryCheckExisting, [value]);
         return result.length > 0;
      } catch (error) {
         console.error(`Check Existing ${field} Error:`, error);
         throw error;
      }
   }

   static async findByIdentifier(identifier) {
      const sql = `
         SELECT BIN_TO_UUID(ac_id, 1) as ac_id, username, email, fullName, phone, hash_password, role
         FROM accounts
         WHERE email = ? OR username = ?
         LIMIT 1
      `;

      const [rows] = await executeQuery(sql, [identifier, identifier]);
      return rows || null;
   }

   static async createAccount(newAccount, connection) {
      const queryCreate = `
         Insert into accounts
         (ac_id, username, hash_password, email, fullName, phone, role)
         VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?)
      `;

      return executeQuery(
         queryCreate,
         [
            newAccount.ac_id,
            newAccount.username,
            newAccount.hash_password,
            newAccount.email,
            newAccount.fullName,
            newAccount.phone,
            newAccount.role,
         ],
         connection
      );
   }

   static async createSecurity(ac_id, newSecurity, connection) {
      const queryCreate = `
         Insert into security_account
         (ac_id, private_key, public_key, refresh_token)
         VALUES (UUID_TO_BIN(?), ?, ?, ?)
      `;

      return executeQuery(
         queryCreate,
         [ac_id, newSecurity.privateKey, newSecurity.publicKey, newSecurity.refreshToken],
         connection
      );
   }

   static async getAccount(username) {
      const query = `
         SELECT BIN_TO_UUID(ac_id) AS ac_id, username, email
         FROM accounts
         WHERE username = ?
      `;

      const result = await executeQuery(query, [username]);
      console.log(JSON.stringify(result));
   }
}

export default RepoAccount;
