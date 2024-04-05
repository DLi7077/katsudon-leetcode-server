import express from 'express';
import { createSolution, errorHandler } from '../controllers/solution-controller';

const solutionRoutes = express.Router();

solutionRoutes.post('/create', createSolution, errorHandler);

export default solutionRoutes;
