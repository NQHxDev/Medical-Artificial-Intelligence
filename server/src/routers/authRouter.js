import express from 'express';

import AuthValidator from '../validators/authValidator.js';
import AuthController from '../controllers/authController.js';

const authRouter = express.Router();
const authController = new AuthController();

authRouter.post('/login', AuthValidator.login(), authController.login);
authRouter.post('/register', AuthValidator.register(), authController.register);

export default authRouter;
