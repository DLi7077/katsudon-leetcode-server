import { configDotenv } from 'dotenv';
import { Express } from 'express';
import solutionRoutes from '../routes/solution-routes';
import listEndpoints from 'express-list-endpoints';
import mongoose from 'mongoose';

configDotenv();

export default async function generateRoutes(appController: Express) {
  appController.use('/api/solution', solutionRoutes);

  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(() => {
      console.log('Successfully Connected To MongoDB');
    })
    .catch(console.error);
  console.table(listEndpoints(appController));
}
