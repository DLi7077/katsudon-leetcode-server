export const PROBLEM_DIFFICULTIES = ['Easy', 'Medium', 'Hard'] as const;

export const PAGINATION_LIMIT_MAX = 50;

export const SOLUTION_SORTABLES = ['runtime_ms', 'memory_usage_mb', 'solution_length', 'created_at'] as const;

export const SORT_DIRECTIONS = ['asc', 'desc'] as const;

export const SOLUTION_FILTERABLE_KEYS = ['solution_language', 'failed'] as const;

export const PROBLEM_FILTERABLE_KEYS = ['difficulty', 'tags', 'id'] as const;
