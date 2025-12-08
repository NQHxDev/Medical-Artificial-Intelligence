import dotenv from 'dotenv';

dotenv.config({
   quiet: true,
   overwrite: false,
});

import app from './src/app.js';

const port = process.env.PORT_SV || 5000;
const host = process.env.HOST_SV || '127.0.0.1';

app.listen(port, host, () => {
   console.log('Server running ....');
});
