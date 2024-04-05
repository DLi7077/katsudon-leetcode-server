import { ObjectId } from 'mongoose';

export function toObjectId(text: string): ObjectId {
  return text as unknown as ObjectId;
}

// remove all spaces and return number of characters used
export function getTextLength(code: string): number {
  return code.replace(/\s/g, '').length;
}
