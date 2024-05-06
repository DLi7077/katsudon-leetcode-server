import { PipelineStage } from 'mongoose';
import Models from '../models';
import { ProblemTagCount, ProblemTagFilterable } from '../types/problem';
import { toObjectId } from '../utils/mongoose';

function generateProblemTagsFromUser(userId?: string, tags?: string[]): PipelineStage[] {
  // omit user match if not provided
  const matchUser: PipelineStage = {
    $match: !userId ? {} : { _id: toObjectId(userId) },
  };
  const pickSolvedField: PipelineStage = {
    $project: { solved: 1, _id: 0 },
  };
  // omit tag match if not provided
  const filterForIncludedTags: PipelineStage = {
    $match: !tags || tags.length === 0 ? {} : { tags: { $all: tags } },
  };
  const lookupSolvedProblems: PipelineStage = {
    $lookup: {
      from: 'problems',
      localField: 'solved',
      foreignField: '_id',
      as: 'solved',
    },
  };
  const flattenProblemObject: PipelineStage = {
    $unwind: '$solved',
  };
  const setSolvedProblemsAsRoot: PipelineStage = {
    $replaceRoot: { newRoot: '$solved' },
  };
  const groupProblemTags: PipelineStage = {
    $facet: {
      problemTags: [{ $unwind: '$tags' }, { $sortByCount: '$tags' }],
    },
  };
  const flattenTagObject: PipelineStage = {
    $unwind: '$problemTags',
  };
  const setTagAsRoot: PipelineStage = {
    $replaceRoot: { newRoot: '$problemTags' },
  };

  return [
    matchUser,
    pickSolvedField,
    lookupSolvedProblems,
    flattenProblemObject,
    setSolvedProblemsAsRoot,
    filterForIncludedTags,
    groupProblemTags,
    flattenTagObject,
    setTagAsRoot,
  ];
}

async function findProblemTags(query: ProblemTagFilterable): Promise<ProblemTagCount[]> {
  const { userId, tags } = query;
  const problemTagQuery = generateProblemTagsFromUser(userId, tags);
  const problemTagCountMapping: { _id: string; count: number }[] = await Models.User.aggregate(problemTagQuery);

  return problemTagCountMapping.map(({ _id, count }) => ({ tag: _id, count }));
}

export default {
  findProblemTags,
};
