import express from 'express';
import { findAll, follow, login, presentUser, register, unfollow } from '../controllers/user-controller';
import { authenticateToken, errorHandler, verifyGuard } from '../controllers/middleware';

const userRoutes = express.Router();

userRoutes.post('/register', register, presentUser);
userRoutes.post('/login', login, authenticateToken, presentUser);
userRoutes.get('/session', authenticateToken, presentUser);
userRoutes.get('/all', findAll);
userRoutes.put('/follow', authenticateToken, verifyGuard, follow, errorHandler);
userRoutes.put('/unfollow', authenticateToken, verifyGuard, unfollow, errorHandler);

// follow
// unfollow
// edit bio
// upload-pfp
// upload-banner
//

export default userRoutes;
