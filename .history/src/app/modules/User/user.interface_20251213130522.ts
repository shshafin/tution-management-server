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

// Interface for the static model methods (if we need custom statics later)
export interface UserModel extends Model<IUser> {
  // Example: isUserExists(email: string): Promise<IUser | null>;
}
