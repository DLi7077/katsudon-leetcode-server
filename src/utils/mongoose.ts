import { ObjectId, PipelineStage, Types } from 'mongoose';

export function toObjectId(text: string): ObjectId {
  return new Types.ObjectId(text) as unknown as ObjectId;
}

// remove all spaces and return number of characters used
export function getTextLength(code: string): number {
  return code.replace(/\s/g, '').length;
}

export function createPaginationPipelineStages(skip: number, limit: number): PipelineStage[] {
  const paginate = {
    $facet: {
      rows: [{ $skip: skip }, { $limit: limit }],
      count: [{ $count: 'count' }],
    },
  };
  const cleanProjection = {
    $project: {
      rows: true,
      count: {
        $ifNull: [{ $first: '$count.count' }, 0],
      },
    },
  };

  return [paginate, cleanProjection];
}
