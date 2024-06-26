/* eslint-disable camelcase */
import { Schema, Model, ObjectId, model } from 'mongoose';

export interface SolutionAttributes {
  _id: ObjectId;
  user_id: ObjectId;
  problem_id: ObjectId;
  solution_language: string;
  solution_code: string;
  solution_length: number;
  failed?: boolean;
  error?: string;
  runtime_ms?: number;
  memory_usage_mb?: number;
  created_at: Date;
}

export type SolutionModelDefintition = Model<SolutionAttributes>;

export const SolutionSchema: Schema<SolutionAttributes> = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
    auto: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: 'User',
  },
  problem_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Problem',
  },
  solution_language: {
    type: String,
    required: true,
  },
  solution_code: {
    type: String,
    required: true,
  },
  solution_length: {
    type: Number,
    required: true,
  },
  runtime_ms: {
    type: Number,
    required: false,
  },
  memory_usage_mb: {
    type: Number,
    required: false,
  },
  failed: {
    type: Boolean,
    required: false,
  },
  error: {
    type: String,
    required: false,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

SolutionSchema.index({ user_id: 1 });
SolutionSchema.index({ problem_id: 1 });
SolutionSchema.index({ created_at: 1 });

const SolutionModel: Model<SolutionAttributes> = model(
  'Solution',
  SolutionSchema
);

export default SolutionModel;
