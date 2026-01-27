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

export type TJobPost = {
  tutoringType: 'home' | 'online';
  guardianPhone: string;
  location: string;
  studentGender: 'male' | 'female';
  tutorGenderPreference: 'male' | 'female' | 'any';
  studyCategory: TStudyCategory;
  classLevel: string;
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
  daysPerWeek: number[];
  demoClassDate: Date;
  status: 'pending' | 'published' | 'closed';
  isOtpVerified: boolean;
  
};
