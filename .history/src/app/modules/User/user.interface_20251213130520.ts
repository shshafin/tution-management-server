import { Model, Document } from 'mongoose';

export type TUserRole = 'super_admin' | 'admin' | 'moderator';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  image?: string; // Optional profile photo
  role: TUserRole;
  createdAt: Date;
  updatedAt: Date;
}

