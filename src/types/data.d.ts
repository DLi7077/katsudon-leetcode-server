interface CreateSolutionRequestBody {
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

interface HttpError {
  status: number;
  message: string;
}
