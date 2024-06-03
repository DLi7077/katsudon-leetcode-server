import { UserAttributes } from '../../models/User';

declare module 'express-serve-static-core' {
  interface Request {
    currentUser: UserAttributes;
  }
}
