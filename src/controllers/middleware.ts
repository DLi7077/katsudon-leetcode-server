import { NextFunction, Request, Response } from 'express';
import Auth from '../utils/Auth';
import UserService from '../service/user-service';

export async function errorHandler(error: HttpError, request: Request, response: Response, next: NextFunction) {
  console.log(error);
  response.status(error.status).send({ error: error.message });
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.split(' ')[1]) ?? '';

  if (!token) {
    res.status(401).send('Forbidden');
    return;
  }

  try {
    const userFromToken = Auth.getUserFromToken(token) as UserLoginProps;
    const userEmail = userFromToken.email;
    const foundUser = await UserService.findByEmail(userEmail);

    if (!foundUser) {
      res.status(404).send('No user found with email ' + userEmail);
      return;
    }

    req.currentUser = foundUser;
    next();
  } catch (error) {
    console.error(error);
    res.status(403).send('Invalid Token');
    return;
  }
}

export function verifyGuard(req: Request, res: Response, next: NextFunction): void {
  if (!req.currentUser.verified) {
    res.status(401);
    res.send('You must be verified to do this');
  }

  next();
}
