import { executeQuery, transactionQuery } from '../services/databaseServices.js';

class RepoSecurity {
   static async getSecurity(ac_id) {
      const sql = `
         SELECT public_key, private_key, refresh_token
         FROM security_account
         WHERE ac_id = UUID_TO_BIN(?, 1)
         LIMIT 1
      `;

      const [rows] = await executeQuery(sql, [ac_id]);
      return rows || null;
   }

   static async updateRefreshToken(ac_id, refreshToken) {
      const sql = `
         UPDATE security_account
         SET refresh_token = ?
         WHERE ac_id = UUID_TO_BIN(?)
      `;
      await executeQuery(sql, [refreshToken, ac_id]);
   }
}

export default RepoSecurity;
