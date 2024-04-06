import { PROBLEM_DIFFICULTIES } from '../constants';

export interface ProblemFilterable {
  difficulty?: (typeof PROBLEM_DIFFICULTIES)[number];
  tags?: string[];
  id: number;
}
