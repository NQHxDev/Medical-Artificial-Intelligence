import AuthServices from '../services/authServices.js';

class AuthController {
   async login(req, res) {
      const { identifier, password } = req.body;

      const result = await AuthServices.login({ identifier, password });

      res.status(result.statusCode).send({
         message: result.message,
         data: result.data,
      });
   }

   async register(req, res) {
      const formData = req.body;

      const result = await AuthServices.register(formData);

      res.status(result.statusCode).send({
         message: result.message,
         data: result.data,
      });
   }
}

export default AuthController;
