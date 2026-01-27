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

export type TJobPost = {
  tutoringType: 'home' | 'online';
  guardianPhone: string;
  studentGender: 'male' | 'female';
  tutorGenderPreference: 'male' | 'female' | 'any';

  studyCategory: TStudyCategory;
  classLevel: string;
  subjects: string[];

  specialPreferences: {
    isExperiencedRequired: boolean;
    isPublicVarsityRequired: boolean;
    isSubjectBackgroundRequired: boolean;
    selectedSubjectBackground?: TSubjectBackground[];
  };

  minSalary: number;
  maxSalary: number;
  numberOfStudents: number;
  preferredTime: 'morning' | 'afternoon' | 'evening' | 'tutor_availability';
  daysPerWeek: number[];
  demoClassDate: Date;

  // System status
  status: 'pending' | 'published' | 'closed';
  isOtpVerified: boolean;
};
