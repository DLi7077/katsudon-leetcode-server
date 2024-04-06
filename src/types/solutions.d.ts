import { SOLUTION_SORTABLES, SORT_DIRECTIONS } from '../constants';
import { ProblemAttributes } from '../models/Problem';
import { SolutionAttributes } from '../models/Solution';

export interface CreateSolutionRequestBody {
  user_id: string;
  memory_usage_mb: number;
  problem_description: string;
  problem_difficulty: string;
  problem_id: number;
  problem_tags: string[];
  problem_title: string;
  problem_url: string;
  runtime_ms: number;
  failed?: boolean;
  error?: string;
  solution_code: string;
  solution_language: string;
}

export interface ProblemSolutions {
  problem: ProblemAttributes;
  solutions: SolutionAttributes[];
}

export interface SolutionFilterable {
  solution_language?: string;
  failed?: boolean;
}

export interface SolutionSortable {
  sortBy?: (typeof SOLUTION_SORTABLES)[number];
  sortDir?: (typeof SORT_DIRECTIONS)[number];
}
