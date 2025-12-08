import express from 'express';

import authRouter from './authRouter.js';

const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);

mainRouter.get('/', (req, res) => {
   res.status(200).send({
      message: 'Trang chủ',
   });
});

export default mainRouter;
