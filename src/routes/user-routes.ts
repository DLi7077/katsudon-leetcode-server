import express from 'express';
import { authenticateToken, login, presentUser, register } from '../controllers/user-controller';

const userRoutes = express.Router();

userRoutes.post('/login', login, authenticateToken, presentUser);
userRoutes.post('/register', register, presentUser);

export default userRoutes;
