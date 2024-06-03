import _ from 'lodash';
import { ObjectId, QueryOptions } from 'mongoose';
import Models from '../models';
import { UserAttributes } from '../models/User';
import Auth from '../utils/Auth';
import { PUBLIC_USER_FIELDS } from '../constants';
import { throwUnexpectedAsHttpError } from '../utils/errors';

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

async function follow(
  devinId: ObjectId,
  jasonId: ObjectId
): Promise<[Partial<UserAttributes>, Partial<UserAttributes>]> {
  const session = await Models.Solution.startSession();
  session.startTransaction();

  try {
    const devinNotFound: boolean = !(await Models.User.exists({ _id: devinId }));
    const jasonNotFound: boolean = !(await Models.User.exists({ _id: jasonId }));

    if (devinNotFound) {
      throw { status: 404, message: `User not found with id ${devinId}` };
    }
    if (jasonNotFound) {
      throw { status: 404, message: `User not found with id ${jasonId}` };
    }

    const devinFollowingJason: UserAttributes | null = await Models.User.findByIdAndUpdate(
      { _id: devinId },
      { $addToSet: { following: jasonId } },
      { new: true }
    ).lean();

    const jasonFollowedByDevin: UserAttributes | null = await Models.User.findByIdAndUpdate(
      { _id: jasonId },
      { $addToSet: { followers: devinId } },
      { new: true }
    ).lean();

    await update({ _id: devinId }, { session });
    await update({ _id: jasonId }, { session });

    await session.commitTransaction();
    const displayFields = [...PUBLIC_USER_FIELDS, 'followers', 'following'];

    return [_.pick(devinFollowingJason, displayFields)!, _.pick(jasonFollowedByDevin!, displayFields)];
  } catch (error: any) {
    if (error satisfies HttpError) {
      throw { status: error.status, message: 'Transaction Failed: ' + error.message };
    }
    throwUnexpectedAsHttpError(error);
  } finally {
    await session.endSession();
  }
}

async function unfollow(
  devinId: ObjectId,
  jasonId: ObjectId
): Promise<[Partial<UserAttributes>, Partial<UserAttributes>]> {
  const session = await Models.Solution.startSession();
  session.startTransaction();
  try {
    const devinNotFound: boolean = !(await Models.User.exists({ _id: devinId }));
    const jasonNotFound: boolean = !(await Models.User.exists({ _id: jasonId }));

    if (devinNotFound) {
      throw { status: 404, message: `User not found with id ${devinId}` };
    }
    if (jasonNotFound) {
      throw { status: 404, message: `User not found with id ${jasonId}` };
    }

    const devinUnfollowsJason: UserAttributes | null = await Models.User.findByIdAndUpdate(
      { _id: devinId },
      { $pull: { following: jasonId } },
      { new: true }
    ).lean();

    const jasonUnfollowedByDevin: UserAttributes | null = await Models.User.findByIdAndUpdate(
      { _id: jasonId },
      { $pull: { followers: devinId } },
      { new: true }
    ).lean();

    const displayFields = [...PUBLIC_USER_FIELDS, 'followers', 'following'];

    return [_.pick(devinUnfollowsJason, displayFields)!, _.pick(jasonUnfollowedByDevin!, displayFields)];
  } catch (error: any) {
    if (error satisfies HttpError) {
      throw { status: error.status, message: 'Transaction Failed: ' + error.message };
    }
    throwUnexpectedAsHttpError(error);
  } finally {
    await session.endSession();
  }
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
  follow,
  unfollow,
  findByEmail,
  findById,
  findAll,
};
