import express from "express";
import UserController from '../controllers/Users.js';
import Middleware from "../middleware/JWT.js";

const router = express.Router();

router.get('/', Middleware.verifyTokenUser, UserController.index);
router.post('/', UserController.register);
router.post('/login', UserController.login);
router.get('/token', Middleware.refreshTokenUser);
router.get('/logout', UserController.logout);

export default router;