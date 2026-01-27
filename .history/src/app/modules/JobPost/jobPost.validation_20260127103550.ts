import { z } from 'zod';

const ALL_SUBJECTS = [
  'Bangla', 'English', 'Mathematics', 'ICT', 'Bangladesh & Global Studies',
  'Religion & Moral Studies', 'Physical Education & Health', 'Physics',
  'Chemistry', 'Biology', 'Higher Mathematics', 'Accounting',
  'Business Entrepreneurship', 'Finance & Banking', 'Business Organization & Management',
  'Economics', 'History', 'Civics', 'Geography', 'English Literature',
  'Additional Mathematics', 'Computer Science', 'Business Studies', 'Sociology',
  'Psychology', 'Environmental Management', 'Global Perspectives', 'Law',
  'Statistics', 'Media Studies', 'Art & Design', 'Music', 'Drama', 'Theory of Knowledge',
] as const;

const SUBJECT_BACKGROUNDS = [
  'engineering', 'medical', 'business', 'science', 'social science', 'fine_arts',
] as const;

const createJobPostValidationSchema = z.object({
  // 🟢 'body' র‍্যাপার রিমুভ করা হয়েছে কারণ মিডলওয়্যার এটা হ্যান্ডেল করে
  tutoringType: z.enum(['offline', 'online'], {
    required_error: 'টিউশনি টাইপ সিলেক্ট করুন',
  }),
  guardianPhone: z
    .string({ required_error: 'ফোন নম্বর আবশ্যক' })
    .regex(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নাম্বার দিন'),
  location: z.string({ required_error: 'লোকেশন দেওয়া আবশ্যক' }),
  studentGender: z.enum(['male', 'female'], {
    required_error: 'স্টুডেন্টের জেন্ডার সিলেক্ট করুন',
  }),
  tutorGenderPreference: z.enum(['male', 'female', 'any'], {
    required_error: 'টিউটর জেন্ডার প্রেফারেন্স আবশ্যক',
  }),
  studyCategory: z.enum(
    ['bangla medium', 'english medium', 'english version', 'admission test'],
    { required_error: 'স্টাডি ক্যাটাগরি সিলেক্ট করুন' }
  ),
  classLevel: z.string({ required_error: 'ক্লাস লেভেল আবশ্যক' }),
  subjects: z
    .array(z.enum(ALL_SUBJECTS))
    .min(1, 'অন্তত একটি বিষয় সিলেক্ট করুন'),

  specialPreferences: z.object({
    isExperiencedRequired: z.boolean().default(false),
    isPublicVarsityRequired: z.boolean().default(false),
    isSubjectBackgroundRequired: z.boolean().default(false),
    selectedSubjectBackground: z
      .array(z.enum(SUBJECT_BACKGROUNDS))
      .optional(),
  }),

  minSalary: z.number({ required_error: 'মিনিমাম স্যালারি আবশ্যক' }).positive(),
  maxSalary: z.number({ required_error: 'ম্যাক্সিমাম স্যালারি আবশ্যক' }).positive(),
  numberOfStudents: z.number({ required_error: 'ছাত্রসংখ্যা আবশ্যক' }).min(1),
  preferredTime: z.enum(
    ['morning', 'afternoon', 'evening', 'tutor_availability'],
    { required_error: 'পছন্দনীয় সময় সিলেক্ট করুন' }
  ),
  daysPerWeek: z.number({ required_error: 'সপ্তাহে কতদিন তা আবশ্যক' }).min(1).max(7),
  // 🟢 transform এখানে ডেট অবজেক্ট বানাবে, যা ডাটাবেজ মডেলে সরাসরি সেভ হবে
  demoClassDate: z.string({ required_error: 'ডেমো ক্লাসের তারিখ আবশ্যক' }).transform((val) => new Date(val)),
}).refine((data) => data.maxSalary >= data.minSalary, {
  message: 'ম্যাক্সিমাম স্যালারি মিনিমামের চেয়ে কম হতে পারবে না!',
  path: ['maxSalary'],
});

export const JobPostValidation = { createJobPostValidationSchema };