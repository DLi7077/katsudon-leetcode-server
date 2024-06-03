import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import Models from '../models';
import { UserAttributes } from '../models/User';
import UserService from '../service/user-service';
import Auth from '../utils/Auth';
import { assert } from 'console';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  const requestBody = req.body as UserAttributes;
  const existingEmail = await UserService.findByEmail(requestBody.email);

  if (existingEmail) {
    res.status(400).send('This email already has an associated account');
    return;
  }

  req.body = await UserService.create(requestBody);
  return next();
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  const responseBody = req.body as UserAttributes;
  const email = responseBody.email;
  const userExists = await Models.User.exists({ email });
  if (!userExists) {
    res.status(401).send('User not found');
    return;
  }

  // user should not be null after above check
  const user = await UserService.findByEmail(email);
  const incomingPassword = responseBody.password;
  const expectedPassword = user!.password;

  const matches: boolean = await Auth.passwordMatches(incomingPassword, expectedPassword);

  if (!matches) {
    res.status(401).send('Incorrect Password');
    return;
  }

  const userObject: UserLoginProps = _.pick(responseBody, ['email', 'password']);
  const accessToken = Auth.createAccessToken(userObject);

  req.body = {
    status: 'Successfully logged in!',
    access_token: accessToken,
    email,
  };

  req.headers.authorization = `Bearer ${accessToken}`;
  next();
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

export function presentUser(req: Request, res: Response): void {
  res.status(200);
  res.json({
    message: req.body,
    currentUser: !!req.currentUser && _.omit(req.currentUser, 'password'),
  });
}
