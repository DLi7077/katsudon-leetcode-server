import express from 'express';
import { createSolution, getUserSolutions, errorHandler } from '../controllers/solution-controller';

const solutionRoutes = express.Router();

solutionRoutes.post('/create', createSolution, errorHandler);
solutionRoutes.get('/all', getUserSolutions, errorHandler);

/*
create: {
  solution: SolutionAttributes,
  problem: ProblemAttributes
}

find?userId&page&limit: {
  problem: ProblemAttributes,
  solutions: SolutionAttributes[]
}

weekly-progress?userId: { // posts grouped by date
  days: {
    posts: {
      user: Partial<UserAttributes>,
      solutions: SolutionAttributes[]
    }[]
  }[]
}

submission-calender: { // submission count by month & year
  "Jan-2023": 10,
  "Feb-2023": 13,
  ...
  [`${month}-${year}]: number,
}

*/

export default solutionRoutes;
