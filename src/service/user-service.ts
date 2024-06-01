import Models from '../models';
import _ from 'lodash';
import { UserAttributes } from '../models/User';
import Auth from '../utils/Auth';
import { ObjectId } from 'mongoose';

async function create(attributes: UserAttributes): Promise<UserAttributes> {
  const hashedPassword = await Auth.hashPassword(attributes.password);

  return Models.User.create({
    ...attributes,
    password: hashedPassword,
    followers: [],
    following: [],
    verified: false,
    created_at: new Date(),
  });
}

async function update(attributes: Partial<UserAttributes>): Promise<UserAttributes | null> {
  const { _id } = attributes;

  const updateAttributes = {
    ..._.omit(attributes, '_id'),
    updated_at: new Date(),
  };

  return Models.User.findByIdAndUpdate({ _id }, updateAttributes, {
    runValidators: true,
    new: true,
  }).lean();
}

async function findByEmail(email: string): Promise<UserAttributes | null> {
  return Models.User.findOne({ email, deleted_at: null }).lean();
}

async function findById(user_id: ObjectId): Promise<UserAttributes | null> {
  return Models.User.findOne({ _id: user_id }).lean();
}

async function findAll(queryParams: any): Promise<Paginated<UserAttributes>> {
  const users = await Models.User.find({
    ...queryParams,
    verified: true,
  });

  return {
    count: users.length,
    rows: users,
  };
}

export default {
  create,
  update,
  findByEmail,
  findById,
  findAll,
};
