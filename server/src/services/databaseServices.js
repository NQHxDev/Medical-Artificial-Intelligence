import mysql from 'mysql2/promise';
import { DB_STATUS, cfgConnectDatabase } from '../configs/cfgDatabase.js';

let clientDB = {
   pool: null,
   status: DB_STATUS.DISCONNECT,
};

/**
 * Kết nối MySQL tạo Pool
 */
export const initDatabase = async () => {
   if (clientDB.pool) return clientDB.pool;

   try {
      const config = cfgConnectDatabase();

      const pool = mysql.createPool(config);
      await pool.getConnection();

      clientDB.pool = pool;
      clientDB.status = DB_STATUS.CONNECTED;
      console.log('Connected to Database ...');

      return pool;
   } catch (error) {
      clientDB.status = DB_STATUS.ERROR;
      console.error('Failed to Connect ...', error);
      throw error;
   }
};

/**
 * Hàm kiểm tra trạng thái Database
 */
export const getDbStatus = () => clientDB.status;

/**
 * Hàm kiểm lấy connection Database
 */
export const getConnectionDB = async () => {
   if (!clientDB.pool) await initDatabase();

   return clientDB.pool.getConnection();
};

/**
 * Execute Query thường
 * dùng cho SELECT / INSERT / UPDATE / DELETE
 */
export const executeQuery = async (query, params = [], connection = null) => {
   if (!connection) {
      connection = await getConnectionDB();
   }

   try {
      const [rows] = await connection.execute(query, params);
      return rows;
   } catch (error) {
      console.error('Query Error:', error);
      throw error;
   }
};

/**
 * Transaction Query
 */
export const transactionQuery = async (callback) => {
   const connection = await getConnectionDB();

   try {
      await connection.beginTransaction();

      const result = await callback(connection);

      await connection.commit();
      return result;
   } catch (error) {
      await connection.rollback();
      console.error('Transaction Error:', error);
      throw error;
   } finally {
      connection.release();
   }
};

/**
 * Auto reconnect
 */
export const handleConnect = () => {
   pool.on('error', async (err) => {
      console.error('Pool Error:', err);

      if (err.code === 'PROTOCOL_CONNECTION_LOST') {
         clientDB.status = DB_STATUS.DISCONNECT;
         console.log('Attempting reconnection ...');
         await initDatabase();
      }
   });
};

/**
 * Đóng kết nối
 */
export const closeConnect = async () => {
   if (!pool) return;

   try {
      await pool.end();
      console.log('Connection Closed');
      clientDB.pool = null;
      clientDB.status = DB_STATUS.DISCONNECT;
   } catch (error) {
      console.error('Close Error:', error);
   }
};
