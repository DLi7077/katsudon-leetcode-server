import { configDotenv } from 'dotenv';
import { Express } from 'express';
import listEndpoints from 'express-list-endpoints';
import mongoose from 'mongoose';
import solutionRoutes from '../routes/solution-routes';
import problemRoutes from './problem-routes';
import userRoutes from './user-routes';

configDotenv();

export default async function generateRoutes(appController: Express) {
  appController.use('/api/solution', solutionRoutes);
  appController.use('/api/problem', problemRoutes);
  appController.use('/api/user', userRoutes);

  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => {
      console.log('Successfully Connected To MongoDB');
    })
    .catch(console.error);
  console.table(listEndpoints(appController));
}
