import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserModel } from './user.interface';
import config from '../../config'; // Assuming you have a config file for env vars

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: 0, // Security: Do not return password by default in queries
    },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'moderator'],
      default: 'admin',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware: Hash password automatically
UserSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  // Hash using bcrypt (salt rounds usually 10 or 12)
  this.password = await bcrypt.hash(
    this.password,
    Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
  );
  next();
});

// Create the Model
export const User = model<IUser, UserModel>('User', UserSchema);
