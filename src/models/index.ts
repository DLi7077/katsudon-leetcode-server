import UserModel from './User';
import ProblemModel from './Problem';
import SolutionModel from './Solution';
import mongoose from 'mongoose';
import { Database } from '../types/database';

const Models: Database = {
  mongoose,
  User: UserModel,
  Problem: ProblemModel,
  Solution: SolutionModel,
};

export default Models;
