import { PipelineStage } from 'mongoose';
import { PROBLEM_FILTERABLE_KEYS, PROBLEM_SORTABLES, SOLUTION_FILTERABLE_KEYS, SORT_DIRECTIONS } from '../constants';
import Models from '../models';
import { ProblemAttributes } from '../models/Problem';
import { SolutionAttributes } from '../models/Solution';
import { ProblemFilterable } from '../types/problem';
import { CreateSolutionRequestBody, ProblemSolutions, ProblemSortable, SolutionFilterable } from '../types/solutions';
import { throwUnexpectedAsHttpError } from '../utils/errors';
import { createPaginationPipelineStages, getTextLength, toObjectId } from '../utils/mongoose';

/**
 * Creates a solution from a request body
 * @param {CreateSolutionRequestBody} data - request body data containing problem
 * Returns the persisted solution and updated problem
 */
async function create(
  data: CreateSolutionRequestBody
): Promise<{ solution: SolutionAttributes; problem: ProblemAttributes }> {
  const session = await Models.Solution.startSession();
  session.startTransaction();
  try {
    // Userid should already exist
    const userIsVerified = await Models.User.exists({
      _id: data.user_id,
      verified: true,
    });

    if (!userIsVerified) {
      throw { status: 400, message: 'User is not verified' };
    }

    // Update the problem
    const updatedProblemFields: Omit<ProblemAttributes, '_id' | 'solved_by' | 'created_at'> = {
      id: data.problem_id,
      title: data.problem_title,
      url: data.problem_url,
      difficulty: data.problem_difficulty,
      // deal with empty alt names and embed css
      description: data.problem_description.replaceAll(`alt=""`, `alt="visual" style="height:auto; max-width:100%;"`),
      tags: data.problem_tags,
    };

    // update problem details
    const updatedProblem: ProblemAttributes = await Models.Problem.findOneAndUpdate(
      { id: updatedProblemFields.id },
      updatedProblemFields,
      { upsert: true, new: true, session }
    );

    // add solved user
    const updatedProblemWithSolver = await Models.Problem.findOneAndUpdate(
      { _id: updatedProblem._id },
      { $addToSet: { solved_by: data.user_id } },
      { upsert: true, new: true, session }
    );

    const solutionData: Omit<SolutionAttributes, '_id'> = {
      user_id: toObjectId(data.user_id),
      problem_id: updatedProblemWithSolver._id,
      solution_language: data.solution_language,
      solution_code: data.solution_code,
      solution_length: getTextLength(data.solution_code),
      failed: data.failed,
      error: data.error,
      runtime_ms: data.runtime_ms,
      memory_usage_mb: data.memory_usage_mb,
      created_at: new Date(),
    };

    const createdSolution: SolutionAttributes[] = await Models.Solution.create([solutionData], { session });

    await session.commitTransaction();

    return {
      problem: updatedProblem,
      solution: createdSolution[0],
    };
  } catch (error: any) {
    if (error satisfies HttpError) {
      throw { status: error.status, message: 'Transaction Failed: ' + error.message };
    }
    throwUnexpectedAsHttpError(error);
  } finally {
    await session.endSession();
  }
}

// Returns the main aggregate pipeline stages that will aggregate into solutions grouped by problems
// This will be in the format of the ProblemSolutions interface (from src/types/solutions.d.ts).
// The solutions will be the most recent solution grouped by language.
// All languages in this ProblemSolutions.solution array will be unique
function findSolutionsByProblemPipelineStages(): PipelineStage[] {
  const pickFirstSolutionByProblemAndLanguage: PipelineStage = {
    $group: {
      _id: {
        problem_id: '$problem_id',
        language: '$solution_language',
      },
      solution: { $first: '$$ROOT' },
    },
  };
  const groupSolutionsByProblem: PipelineStage = {
    $group: {
      _id: '$_id.problem_id',
      solutions: { $push: '$solution' },
    },
  };
  const lookupProblem: PipelineStage = {
    $lookup: {
      from: 'problems',
      localField: '_id',
      foreignField: '_id',
      as: 'problem',
    },
  };
  const unwindProblemFromArray: PipelineStage = {
    $unwind: '$problem',
  };
  const projectData: PipelineStage = {
    $project: {
      _id: false,
      solutions: {
        // sort by most recent
        $sortArray: {
          input: '$solutions',
          sortBy: { created_at: -1 },
        },
      },
      problem: true,
    },
  };
  const addLastSolvedField: PipelineStage = {
    $addFields: {
      lastSolved: {
        $max: {
          // https://www.mongodb.com/docs/manual/reference/operator/aggregation/map/
          $map: {
            input: '$solutions',
            as: 'solution',
            in: '$$solution.created_at',
          },
        },
      },
    },
  };
  const sortByLastSolved: PipelineStage = {
    $sort: { lastSolved: -1 },
  };

  return [
    pickFirstSolutionByProblemAndLanguage,
    groupSolutionsByProblem,
    lookupProblem,
    unwindProblemFromArray,
    projectData,
    addLastSolvedField,
    sortByLastSolved,
  ];
}

function generateProblemSortPipelineStage(
  sortBy?: (typeof PROBLEM_SORTABLES)[number],
  sortDir?: SORT_DIRECTIONS
): PipelineStage[] {
  if (!sortBy) return [];
  if (sortBy == 'lastSolved') {
    return [{ $sort: { [sortBy]: sortDir === 'asc' ? 1 : -1 } }];
  }
  return [{ $sort: { [`problem.${sortBy}`]: sortDir === 'asc' ? 1 : -1 } }];
}

/**
 * Picks the first solution by problem and language, sorted by created time
 * @param {ObjectId} userId user solutions to query for
 * @returns SolutionAttributes[]
 */
async function findUserSolutions(
  userId: string,
  queryParams: SolutionFilterable & ProblemFilterable & ProblemSortable,
  skip: number,
  limit: number
): Promise<Paginated<ProblemSolutions>> {
  try {
    const matchUser: PipelineStage = {
      $match: { user_id: toObjectId(userId) },
    };
    const groupSolutionsByProblemAndLanguage = findSolutionsByProblemPipelineStages();
    const preAggregationSolutionFilters: PipelineStage[] = SOLUTION_FILTERABLE_KEYS.filter(
      (key) => !!queryParams[key]
    ).map((key) => {
      switch (key) {
        case 'failed': // boolean
          return { $match: { [key]: JSON.parse(queryParams[key] as any) } };
        default: // string
          return { $match: { [key]: queryParams[key] } };
      }
    });

    const sortByMostRecent: PipelineStage = { $sort: { created_at: -1 } };

    const paginationPipelineStages = createPaginationPipelineStages(skip, limit);

    const postAggregationProblemFilters: PipelineStage[] = PROBLEM_FILTERABLE_KEYS.filter(
      (key) => !!queryParams[key]
    ).map((key) => {
      // if tags is array, use includes operator instead of exact match
      return { $match: { [`problem.${key}`]: key === 'tags' ? { $in: queryParams[key] } : queryParams[key] } };
    });

    const postAggregationProblemSorting: PipelineStage[] = generateProblemSortPipelineStage(
      queryParams.sortBy,
      queryParams.sortDir
    );

    const aggregateResult = (await Models.Solution.aggregate([
      matchUser,
      ...preAggregationSolutionFilters,
      sortByMostRecent,
      ...groupSolutionsByProblemAndLanguage,
      ...postAggregationProblemFilters,
      ...postAggregationProblemSorting,
      ...paginationPipelineStages,
    ])) as Paginated<ProblemSolutions>[];

    // data will be aggregated into one document, which contains the pagination
    return aggregateResult[0];
  } catch (error) {
    throwUnexpectedAsHttpError(error);
  }
}

const SolutionService = {
  create,
  findUserSolutions,
};

export default SolutionService;
