import { Types } from 'mongoose';

// ১. স্টাডি ক্যাটাগরি (Synced with TeachingMediums)
export type TStudyCategory =
  | 'bangla medium'
  | 'english medium'
  | 'english version'
  | 'admission test';

// ২. টিউটর সাবজেক্ট ব্যাকগ্রাউন্ড (Synced with Bachelor Discipline)
export type TSubjectBackground =
  | 'engineering'
  | 'medical'
  | 'business'
  | 'science'
  | 'social science'
  | 'fine_arts';

// ৩. ক্লাস লেভেল (Synced with TeachingClasses)
export type TClassLevel =
  | 'Class 1'
  | 'Class 2'
  | 'Class 3'
  | 'Class 4'
  | 'Class 5'
  | 'Class 6'
  | 'Class 7'
  | 'Class 8'
  | 'Class 9'
  | 'Class 10'
  | 'SSC'
  | 'HSC'
  | 'A-Level(AS)'
  | 'A-Level(A2)'
  | 'Dhaka University Admission'
  | 'BUET Admission'
  | 'Medical Admission'
  | 'Private University Admission';

export type TPreferredTime =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'tutor_availability';

export interface IJobPost {
  guardianId?: Types.ObjectId;
  tutoringType: 'offline' | 'online'; // 'home' এর বদলে 'offline' করলাম টিউটরের সাথে মিলাতে
  guardianPhone: string;
  location: string;
  district: string; // ফিল্টারিং এর জন্য এটা অ্যাড করা জরুরি
  studentGender: 'male' | 'female';
  tutorGenderPreference: 'male' | 'female' | 'any';
  studyCategory: TStudyCategory;
  classLevel: TClassLevel;
  subjects: string[];

  specialPreferences: {
    isExperiencedRequired: boolean;
    isPublicVarsityRequired: boolean;
    isSubjectBackgroundRequired: boolean;
    selectedSubjectBackground?: TSubjectBackground[]; // ডিসিপ্লিন এর সাথে ম্যাচ হবে
  };

  minSalary: number;
  maxSalary: number;
  numberOfStudents: number;
  preferredTime: TPreferredTime;
  daysPerWeek: number;
  demoClassDate: Date;

  status: 'pending' | 'published' | 'closed';
  isOtpVerified: boolean;
  totalApplications: number;
  createdAt?: Date;
  updatedAt?: Date;
}
