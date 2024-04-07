import { NextFunction, Request, Response } from 'express';
import { PAGINATION_LIMIT_MAX } from '../constants';
import SolutionService from '../service/solution-service';
import { ProblemFilterable } from '../types/problem';
import { SolutionFilterable } from '../types/solutions';

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
    interface ExpectedQueryParams extends SolutionFilterable, ProblemFilterable {
      userId: string;
      page?: number;
      limit?: number;
    }
    const queryParams = request.query as unknown as ExpectedQueryParams;
    const page = queryParams.page ?? 0;

    if (!!queryParams.limit && queryParams.limit <= 0) {
      throw <HttpError>{ status: 400, message: 'Limit should be a positive number' };
    }
    const limit = Math.min(queryParams.limit ?? PAGINATION_LIMIT_MAX, PAGINATION_LIMIT_MAX);

    const result = await SolutionService.findUserSolutions(queryParams.userId, queryParams, page * limit, limit);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function errorHandler(error: HttpError, request: Request, response: Response, next: NextFunction) {
  console.log(error);
  response.status(error.status).send({ error: error.message });
}
