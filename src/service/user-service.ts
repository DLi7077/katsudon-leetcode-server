import _ from 'lodash';
import { ObjectId, QueryOptions } from 'mongoose';
import Models from '../models';
import { UserAttributes } from '../models/User';
import Auth from '../utils/Auth';

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

async function update(
  attributes: Partial<UserAttributes>,
  additionalOptions: Partial<QueryOptions> = {}
): Promise<UserAttributes | null> {
  const { _id } = attributes;

  const updateAttributes = {
    ..._.omit(attributes, '_id'),
    updated_at: new Date(),
  };

  return Models.User.findByIdAndUpdate({ _id }, updateAttributes, {
    runValidators: true,
    new: true,
    ...additionalOptions,
  }).lean();
}

async function findByEmail(email: string): Promise<UserAttributes | null> {
  return Models.User.findOne({ email, deleted_at: null }).lean();
}

async function findById(user_id: ObjectId): Promise<UserAttributes | null> {
  return Models.User.findOne({ _id: user_id }).lean();
}

async function findAll(): Promise<Paginated<Partial<UserAttributes>>> {
  const users: UserAttributes[] = await Models.User.aggregate([
    { $match: { verified: true } },
    { $sort: { updated_at: -1, created_at: -1 } },
  ]);

  const usersPresentable = users.map((user) => _.pick(user, ['_id', 'username', 'profile_picture_url']));

  return {
    count: users.length,
    rows: usersPresentable,
  };
}

export default {
  create,
  update,
  findByEmail,
  findById,
  findAll,
};
