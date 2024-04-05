/* eslint-disable camelcase */
import  { Schema, Model, ObjectId, model } from 'mongoose';
import { PROBLEM_DIFFICULTIES } from '../constants';

export interface ProblemAttributes {
  _id: ObjectId;
  id: number;
  title: string;
  url: string;
  difficulty?: string;
  description: string;
  tags?: string[];
  solved_by?: ObjectId[];
  created_at: Date;
}

export type ProblemModelDefinition = Model<ProblemAttributes>;

export const ProblemSchema: Schema<ProblemAttributes> =
  new Schema<ProblemAttributes>({
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
      auto: true,
    },
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    url: {
      type: String,
      required: true,
      unique: true,
    },
    difficulty: {
      type: String,
      enum: PROBLEM_DIFFICULTIES,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    tags: {
      type: [String],
      required: false,
    },
    solved_by: {
      type: [Schema.Types.ObjectId],
      required: false,
      ref: 'User',
    },
    created_at: {
      type: Date,
      required: true,
    },
  });

ProblemSchema.index({ id: 1 });
ProblemSchema.index({ title: 1 });
ProblemSchema.index({ difficulty: 1 });

const ProblemModel: Model<ProblemAttributes> = model(
  'Problem',
  ProblemSchema
);

export default ProblemModel;
