import { NextFunction, Request, Response } from 'express';
import _ from 'lodash';
import Models from '../models';
import { UserAttributes } from '../models/User';
import UserService from '../service/user-service';
import Auth from '../utils/Auth';
import { ObjectId } from 'mongoose';

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

export async function follow(req: Request, res: Response, next: NextFunction): Promise<void> {
  const responseBody = req.body as { follow: ObjectId };

  try {
    const followResult = await UserService.follow(req.currentUser._id, responseBody.follow);
    res.status(201);
    res.send(followResult);
  } catch (error) {
    next(error);
  }
}

export async function unfollow(req: Request, res: Response, next: NextFunction): Promise<void> {
  const responseBody = req.body as { follow: ObjectId };

  try {
    const unfollowResult = await UserService.unfollow(req.currentUser._id, responseBody.follow);
    res.status(201);
    res.send(unfollowResult);
  } catch (error) {
    next(error);
  }
}

export async function findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  const allUsers = await UserService.findAll();

  res.status(200);
  res.json(allUsers);
}

export function presentUser(req: Request, res: Response): void {
  res.status(200);
  res.json({
    message: req.body,
    currentUser: !!req.currentUser && _.omit(req.currentUser, 'password'),
  });
}
