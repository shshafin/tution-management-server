import { Model, Document } from 'mongoose';
import {
  BachelorMajors,
  DaysOfWeek,
  TeachingClasses,
  TeachingMediums,
} from './user.constant';

export type TUserRole = 'super_admin' | 'admin' | 'tutor';
export type TUserStatus = 'active' | 'pending' | 'blocked';

export interface IBasicEducation {
  background:
    | 'bangla medium'
    | 'english medium'
    | 'english version'
    | 'Madrasa'
    | 'specialized learning';
  /** Curriculum শুধুমাত্র 'english medium' এর জন্য প্রযোজ্য। English Version এ এটি ব্যবহার করা যাবে না। */
  curriculum?: 'Edexcell curriculam' | 'Cambridge curriculam' | 'IB curriculam';
  institute: string;
  group: 'science' | 'commerce' | 'humanities';
  result: string;
  passingYear: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  image?: string;
  role: TUserRole;
  status: TUserStatus;
  credits: number;

  // Step 1-5 Info
  location: {
    shortArea: string;
    mapAddress: string;
    type: 'Point';
    coordinates: [number, number];
  };
  gender: 'male' | 'female';
  tutorType: ('online' | 'offline')[];
  teachingMediums: (typeof TeachingMediums)[number][];
  teachingClasses: (typeof TeachingClasses)[number][];
  availableDays: (typeof DaysOfWeek)[number][];
  experienceYears: number;

  // Step 6-10 Education
  secondaryInfo: IBasicEducation;
  higherSecondaryInfo: IBasicEducation;
  bachelorInfo: {
    institute: string;
    discipline:
      | 'engineering'
      | 'medical'
      | 'business'
      | 'science'
      | 'social science'
      | 'fine_arts';
    major: (typeof BachelorMajors)[number];
    customMajor?: string;
    result?: string;
    passingYear: string;
  };

  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface UserModel extends Model<IUser> {}
