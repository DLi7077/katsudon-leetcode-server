import { NextFunction, Request, Response } from 'express';
import SolutionService from '../service/solution-service';
import { PAGINATION_LIMIT_MAX } from '../constants';
import { SolutionFilterable, SolutionSortable } from '../types/solutions';
import _ from 'lodash';
import { ProblemFilterable } from '../types/problem';

export async function createSolution(request: Request, response: Response, next: NextFunction) {
  try {
    const result = await SolutionService.create(request.body);

    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getUserSolutions(request: Request, response: Response, next: NextFunction) {
  try {
    interface ExpectedQueryParams extends SolutionFilterable, SolutionSortable, ProblemFilterable {
      userId: string;
      page?: number;
      limit?: number;
    }
    const queryParams = request.query as unknown as ExpectedQueryParams;
    const page = queryParams.page ?? 0;
    const limit = Math.min(queryParams.limit ?? 0, PAGINATION_LIMIT_MAX);

    const result = await SolutionService.findUserSolutions(queryParams.userId, queryParams, page * limit, limit);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function errorHandler(error: HttpError, request: Request, response: Response, next: NextFunction) {
  response.status(error.status).send({ error: error.message });
}
