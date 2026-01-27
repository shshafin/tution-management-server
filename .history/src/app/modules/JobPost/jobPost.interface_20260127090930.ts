export type TStudyCategory =
  | 'Bangla Medium'
  | 'English Medium'
  | 'English Version'
  | 'Admission Test';
export type TSubjectBackground =
  | 'CSE'
  | 'English'
  | 'Math'
  | 'Physics'
  | 'Chemistry'
  | 'Biology';
export type TPreferredTime =
  | 'morning'
  | 'afternoon'
  | 'evening'
  | 'tutor_availability';

// সব সাবজেক্টের টাইপ
export type TAllSubjects =
  | 'Bangla'
  | 'English'
  | 'Mathematics'
  | 'ICT'
  | 'Bangladesh & Global Studies'
  | 'Religion & Moral Studies'
  | 'Physical Education & Health'
  | 'Physics'
  | 'Chemistry'
  | 'Biology'
  | 'Higher Mathematics'
  | 'Accounting'
  | 'Business Entrepreneurship'
  | 'Finance & Banking'
  | 'Business Organization & Management'
  | 'Economics'
  | 'History'
  | 'Civics'
  | 'Geography'
  | 'English Literature'
  | 'Additional Mathematics'
  | 'Computer Science'
  | 'Business Studies'
  | 'Sociology'
  | 'Psychology'
  | 'Environmental Management'
  | 'Global Perspectives'
  | 'Law'
  | 'Statistics'
  | 'Media Studies'
  | 'Art & Design'
  | 'Music'
  | 'Drama'
  | 'Theory of Knowledge';

import { Date, Types } from 'mongoose';


// ২. ডাইনামিক ক্লাস লেভেল (সবগুলো এক জায়গায়, লজিক হ্যান্ডেল হবে কন্ট্রোলারে)
export type TClassLevel = 
  | 'Class 1' | 'Class 2' | 'Class 3' | 'Class 4' | 'Class 5' 
  | 'Class 6' | 'Class 7' | 'Class 8' | 'SSC' | 'HSC' // Bangla/Version
  | 'Class 9 (O Level)' | 'Class 10 (O Level)' | 'A-Level (AS)' | 'A-Level (A2)' // English Medium
  | 'Dhaka University Admission' | 'BUET Admission' | 'Medical Admission' | 'Private University Admission'; // Admission


export interface IJobPost {
  guardianId: Types.ObjectId; // রেফারেন্স হিসেবে রাখা ভালো
  tutoringType: 'home' | 'online';
  guardianPhone: string;
  location: string;
  district: string; // নতুন অ্যাড করলাম, ফিল্টারিংয়ের জন্য মাস্ট
  area: string;     // লোকেশনের ভেতরে এরিয়া আলাদা থাকা ভালো
  studentGender: 'male' | 'female';
  tutorGenderPreference: 'male' | 'female' | 'any';
  studyCategory: TStudyCategory;
  classLevel: TClassLevel; 
  subjects: string[]; // TAllSubjects এর মেম্বাররা থাকবে
  
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
  daysPerWeek: number; // ১ থেকে ৭ পর্যন্ত সংখ্যা
  demoClassDate: Date;
  
  status: 'pending' | 'published' | 'closed';
  isOtpVerified: boolean;
  totalApplications: number;
  createdAt: Date;
  updatedAt: Date;
}
