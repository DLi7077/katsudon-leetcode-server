import Models from '../models';
import { ProblemAttributes } from '../models/Problem';
import { SolutionAttributes } from '../models/Solution';
import { throwUnexpected } from '../utils/errors';
import { getTextLength, toObjectId } from '../utils/mongoose';

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
    // Userid should already exis
    const userIsVerified = await Models.User.exists({
      _id: data.user_id,
      verified: true,
    });

    if (!userIsVerified) {
      throw { status: 400, message: 'User is not verified' };
    }

    // Update the problem
    const updatedProblemFields: Partial<ProblemAttributes> = {
      id: data.problem_id,
      title: data.problem_title,
      url: data.problem_url,
      difficulty: data.problem_difficulty,

      // deal with empty alt names and embed css
      description: data.problem_description.replaceAll(`alt=""`, `alt="visual" style="height:auto; max-width:100%;"`),
      tags: data.problem_tags,
    };

    const updatedProblem: ProblemAttributes = await Models.Problem.findOneAndUpdate(
      { id: updatedProblemFields.id },
      updatedProblemFields,
      { upsert: true, new: true, session }
    );

    const solutionData: Omit<SolutionAttributes, '_id'> = {
      user_id: toObjectId(data.user_id),
      problem_id: updatedProblem._id,
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
    throwUnexpected(error);
  } finally {
    await session.endSession();
  }
}

const SolutionService = {
  create,
};

export default SolutionService;
