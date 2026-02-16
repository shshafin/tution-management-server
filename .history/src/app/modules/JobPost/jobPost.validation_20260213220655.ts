import { z } from 'zod';

const ALL_SUBJECTS = [
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

// টিউটর মডেলে থাকা Discipline এর সাথে সিঙ্ক করা
const SUBJECT_BACKGROUNDS = [
  'engineering',
  'medical',
  'business',
  'science',
  'social science',
  'fine_arts',
] as const;

const createJobPostValidationSchema = z.object({
  body: z
    .object({
      tutoringType: z.enum(['offline', 'online'], {
        required_error: 'টিউশনি টাইপ সিলেক্ট করুন',
      }),
      guardianPhone: z
        .string()
        .regex(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নাম্বার দিন'),
      guardianName: z.string({ required_error: 'গার্ডিয়ানের নাম দিন' }), // 🟢
      location: z.object({
        shortArea: z.string({ required_error: 'এলাকার নাম দিতে হবে' }).min(1),
        mapAddress: z
          .string({ required_error: 'ম্যাপের ঠিকানা প্রয়োজন' })
          .min(1),
        detailedAddress: z
          .string({ required_error: 'বাসার বিস্তারিত ঠিকানা দিন' })
          .min(1),
        coordinates: z
          .array(z.number())
          .length(2, 'সঠিক স্থানাঙ্ক (Longitude & Latitude) দিন'),
      }),

      studentGender: z.enum(['male', 'female']),
      tutorGenderPreference: z.enum(['male', 'female', 'any']),

      studyCategory: z.enum([
        'bangla medium',
        'english medium',
        'english version',
        'admission test',
      ]),

      classLevel: z.string({ required_error: 'ক্লাস লেভেল আবশ্যক' }),

      subjects: z
        .array(z.enum(ALL_SUBJECTS))
        .min(1, 'অন্তত একটি বিষয় সিলেক্ট করুন'),

      specialPreferences: z.object({
        isExperiencedRequired: z.boolean().default(false),
        isPublicVarsityRequired: z.boolean().default(false),
        isSubjectBackgroundRequired: z.boolean().default(false),
        selectedSubjectBackground: z
          .array(z.enum(SUBJECT_BACKGROUNDS))
          .optional(),
      }),

      minSalary: z.number().positive('স্যালারি পজিটিভ হতে হবে'),
      maxSalary: z.number().positive('স্যালারি পজিটিভ হতে হবে'),
      numberOfStudents: z.number().min(1, 'ছাত্রসংখ্যা অন্তত ১ হতে হবে'),
      preferredTime: z.enum([
        'morning',
        'afternoon',
        'evening',
        'tutor_availability',
      ]),
      // ১ থেকে ৭ দিনের সংখ্যা
      daysPerWeek: z.number().min(1).max(7),
      demoClassDate: z.string().transform((val) => new Date(val)),
    })
    .refine((data) => data.maxSalary >= data.minSalary, {
      message: 'ম্যাক্সিমাম স্যালারি মিনিমামের চেয়ে কম হতে পারবে না!',
      path: ['maxSalary'],
    }),
});

export const JobPostValidation = { createJobPostValidationSchema };
