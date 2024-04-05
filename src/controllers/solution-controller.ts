import { NextFunction, Request, Response } from 'express';
import SolutionService from '../service/solution-service';

export async function createSolution(request: Request, response: Response, next: NextFunction) {
  try {
    const result = await SolutionService.create(request.body);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function errorHandler(error: HttpError, request: Request, response: Response, next: NextFunction) {
  response.status(error.status).send({ error: error.message });
}
