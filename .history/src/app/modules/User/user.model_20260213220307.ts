import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, UserModel } from './user.interface';
import {
  BachelorMajors,
  DaysOfWeek,
  TeachingClasses,
  TeachingMediums,
} from './user.constant';

const BasicEducationSchema = new Schema(
  {
    background: {
      type: String,
      enum: ['bangla medium', 'english medium', 'english version', 'Madrasa'],
      required: true,
    },
    curriculum: {
      type: String,
      enum: ['Edexcell curriculam', 'Cambridge curriculam', 'IB curriculam'],
    },
    institute: { type: String, required: true },
    group: {
      type: String,
      enum: ['science', 'commerce', 'humanities'],
      required: true,
    },
    result: { type: String, required: true },
    passingYear: { type: String, required: true },
  },
  { _id: false },
);

const UserSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: 0 },
    phone: { type: String, required: true },
    image: { type: String },
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'tutor'],
      default: 'tutor',
    },
    status: {
      type: String,
      enum: ['active', 'blocked'],
      default: 'active',
    },
    credits: { type: Number, default: 0 },

    location: {
      // ১. ম্যাপ থেকে আসা ছোট এলাকা (উদা: মালিবাগ)
      shortArea: { type: String, required: true },

      // ২. ম্যাপ থেকে আসা ফুল ঠিকানা (উদা: মালিবাগ চৌধুরী পাড়া, ঢাকা)
      mapAddress: { type: String, required: true },

      // ৩. ইউজারের নিজের লেখা বিস্তারিত ঠিকানা (উদা: বাসা-১২, রোড-৫)
      detailedAddress: { type: String, required: true },

      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true, 
      },
    },
    gender: { type: String, enum: ['male', 'female'], required: true },
    tutorType: [{ type: String, enum: ['online', 'offline'] }],
    teachingMediums: [{ type: String, enum: TeachingMediums }],
    teachingClasses: [{ type: String, enum: TeachingClasses }],
    availableDays: [{ type: String, enum: DaysOfWeek }],
    experienceYears: { type: Number, required: true },

    secondaryInfo: { type: BasicEducationSchema, required: true },
    higherSecondaryInfo: { type: BasicEducationSchema, required: true },
    bachelorInfo: {
      institute: { type: String, required: true },
      discipline: {
        type: String,
        enum: [
          'engineering',
          'medical',
          'business',
          'science',
          'social science',
          'fine_arts',
        ],
        required: true,
      },
      major: { type: String, enum: BachelorMajors, required: true },
      customMajor: { type: String },
      result: { type: String },
      passingYear: { type: String, required: true },
    },
    passwordResetToken: { type: String, select: 0 },
    passwordResetExpires: { type: Date, select: 0 },
  },
  { timestamps: true },
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.index({ location: '2dsphere' });

export const User = model<IUser, UserModel>('User', UserSchema);
