import express from 'express';
import { findProblemTags } from '../controllers/problem-controller';
import { errorHandler } from '../controllers/solution-controller';

const problemRoutes = express.Router();

problemRoutes.get('/tags', findProblemTags, errorHandler);

export default problemRoutes;
