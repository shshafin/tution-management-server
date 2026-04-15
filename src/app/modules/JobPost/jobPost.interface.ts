import { Types } from 'mongoose';

// ১. সব সাবজেক্টের কনস্ট্যান্ট থেকে টাইপ জেনারেট
export const ALL_SUBJECTS = [
  'Bangla',
  'English',
  'Mathematics',
  'ICT',
  'Bangladesh & Global Studies',
  'Religion & Moral Studies',
  'Physical Education & Health',
  'Physics',
  'Chemistry',
  'Biology',
  'Higher Mathematics',
  'Accounting',
  'Business Entrepreneurship',
  'Finance & Banking',
  'Business Organization & Management',
  'Economics',
  'History',
  'Civics',
  'Geography',
  'English Literature',
  'Additional Mathematics',
  'Computer Science',
  'Business Studies',
  'Sociology',
  'Psychology',
  'Environmental Management',
  'Global Perspectives',
  'Law',
  'Statistics',
  'Media Studies',
  'Art & Design',
  'Music',
  'Drama',
  'Theory of Knowledge',
] as const;

export type TAllSubjects = (typeof ALL_SUBJECTS)[number];

// ২. স্টাডি ক্যাটাগরি (Synced with Tutor)
export type TStudyCategory =
  | 'bangla medium'
  | 'english medium'
  | 'english version'
  | 'admission test'
  | 'specialized learning'
  | 'madrasa';

// ৩. টিউটর সাবজেক্ট ব্যাকগ্রাউন্ড (Synced with Tutor Discipline)
export type TSubjectBackground =
  | 'engineering'
  | 'medical'
  | 'business'
  | 'science'
  | 'social science'
  | 'fine_arts';

// ৪. ক্লাস লেভেল (Synced with Tutor Classes)
export type TClassLevel =
  | 'Nursery'
  | 'KG-1'
  | 'KG-2'
  | 'Class 1'
  | 'Class 2'
  | 'Class 3'
  | 'Class 4'
  | 'Class 5'
  | 'Class 6'
  | 'Class 7'
  | 'Class 8'
  | 'Class 9'
  | 'SSC'
  | 'HSC 1st Year'
  | 'HSC 2nd Year'
  | 'A-Level(AS)'
  | 'A-Level(A2)'
  | 'Dhaka University Admission'
  | 'BUET Admission'
  | 'Medical Admission'
  | 'Private University Admission'
  | 'Quran Learning'
  | 'Bangla Language Learning'
  | 'English Language Learning'
  | 'French Language Learning'
  | 'দাখিল / SSC'
  | 'আলিম HSC 1st'
  | 'আলিম HSC 2nd'
  | 'Drawing'
  | 'Music';

export type TPreferredTime =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'tutor_availability';

export interface IJobPost {
  guardianId?: Types.ObjectId;
  tutoringType?: 'offline' | 'online' | 'both';
  guardianPhone: string;
  guardianName: string;
  location: {
    shortArea: string;
    mapAddress: string;
    detailedAddress: string;
    type: 'Point';
    coordinates: [number, number];
  };
  studentGender: 'male' | 'female';
  tutorGenderPreference: 'male' | 'female' | 'any';
  studyCategory: TStudyCategory;
  classLevel: TClassLevel;
  subjects: TAllSubjects[];
  specialPreferences: {
    isExperiencedRequired: boolean;
    isPublicVarsityRequired: boolean;
    isSubjectBackgroundRequired: boolean;
    selectedSubjectBackground?: TSubjectBackground[];
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
}
