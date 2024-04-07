export const PROBLEM_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export const PAGINATION_LIMIT_MAX = 50;

export const PROBLEM_SORTABLES = ['id', 'title', 'lastSolved'] as const;

export type SORT_DIRECTIONS = 'asc' | 'desc';

export const SOLUTION_FILTERABLE_KEYS = ['solution_language', 'failed'] as const;

export const PROBLEM_FILTERABLE_KEYS = ['difficulty', 'tags', 'id'] as const;
