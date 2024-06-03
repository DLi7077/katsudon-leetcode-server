import express from 'express';
import { authenticateToken, login, presentUser, register } from '../controllers/user-controller';

const userRoutes = express.Router();

userRoutes.post('/register', register, presentUser);
userRoutes.post('/login', login, authenticateToken, presentUser);

// jwt-retrieve
// all
// follow
// unfollow
// edit bio
// upload-pfp
// upload-banner
//

export default userRoutes;
