import express from 'express';
import { authenticateToken, findAll, login, presentUser, register } from '../controllers/user-controller';

const userRoutes = express.Router();

userRoutes.post('/register', register, presentUser);
userRoutes.post('/login', login, authenticateToken, presentUser);
userRoutes.get('/session', authenticateToken, presentUser);
userRoutes.get('/all', findAll);

// all
// follow
// unfollow
// edit bio
// upload-pfp
// upload-banner
//

export default userRoutes;
