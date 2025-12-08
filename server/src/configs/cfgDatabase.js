import dotenv from 'dotenv';

dotenv.config({
   quiet: true,
   overwrite: false,
});

const DB_STATUS = {
   CONNECTED: 'connected',
   DISCONNECT: 'disconnect',
   ERROR: 'error',
};

const cfgConnectDatabase = () => {
   const isProd = process.env.NODE_ENV === 'production';

   return {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'medical_ai',

      // Pooling
      waitForConnections: true,
      connectionLimit: Number(process.env.DB_POOL_LIMIT) || 15,
      queueLimit: 0,

      // Auto reconnect
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,

      charset: process.env.DB_CHARSET || 'utf8mb4_unicode_ci',
      timezone: process.env.DB_TIMEZONE || '+07:00',
      debug: process.env.DB_DEBUG === 'true' ? true : false,
      compress: process.env.DB_COMPRESS === 'true',
      ssl: isProd
         ? {
              rejectUnauthorized: false,
           }
         : false,
      multipleStatements: process.env.DB_MULTI_STATEMENTS === 'true',
   };
};

export { DB_STATUS, cfgConnectDatabase };
