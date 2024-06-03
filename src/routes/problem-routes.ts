import express from 'express';
import { findProblemTags } from '../controllers/problem-controller';
import { errorHandler } from '../controllers/middleware';

const problemRoutes = express.Router();

problemRoutes.get('/tags', findProblemTags, errorHandler);

export default problemRoutes;
