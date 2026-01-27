import { Model, Document } from 'mongoose';

export type TUserRole = 'super_admin' | 'admin' | 'tutor';
export type TUserStatus = 'active' | 'pending' | 'blocked';

export interface IBasicEducation {
  background:
    | 'bangla medium'
    | 'english medium'
    | 'english version'
    | 'Madrasa';
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
  location: string;
  gender: 'male' | 'female';
  tutorType: ('online' | 'offline')[];
  teachingMediums: (
    | 'bangla medium'
    | 'english medium'
    | 'english version'
    | 'admission test'
  )[];
  teachingClasses: string[];
  availableDays: ('Sat' | 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri')[];
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
    major: string; // From the big list
    customMajor?: string; // If 'Other' is selected
    result: string;
    passingYear: string;
  };

  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface UserModel extends Model<IUser> {}
