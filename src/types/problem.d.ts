import { PROBLEM_DIFFICULTIES } from '../constants';

export interface ProblemFilterable {
  difficulty?: (typeof PROBLEM_DIFFICULTIES)[number];
  tags?: string[];
  id: number;
}

export interface ProblemTagFilterable {
  userId?: string;
  tags?: string[];
}

export type ProblemTagCount = {
  tag: string;
  count: number;
};
