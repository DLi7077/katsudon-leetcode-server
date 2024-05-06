import { NextFunction, Request, Response } from 'express';
import ProblemService from '../service/problem-service';
import { ProblemTagFilterable } from '../types/problem';

export async function findProblemTags(request: Request, response: Response, next: NextFunction) {
  try {
    const queryParams = request.query as unknown as ProblemTagFilterable;
    const result = await ProblemService.findProblemTags(queryParams);

    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
