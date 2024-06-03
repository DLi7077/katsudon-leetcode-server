import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import * as dotenv from 'dotenv';
dotenv.config();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function passwordMatches(passwordA: string, passwordB: string): Promise<boolean> {
  return bcrypt.compare(passwordA, passwordB);
}

function createAccessToken(userLoginProps: UserLoginProps): string {
  return jwt.sign(userLoginProps, process.env.AUTH_SECRET!);
}

function getUserFromToken(token: string) {
  return jwt.verify(token, process.env.AUTH_SECRET!);
}

export default {
  hashPassword,
  passwordMatches,
  createAccessToken,
  getUserFromToken,
};
