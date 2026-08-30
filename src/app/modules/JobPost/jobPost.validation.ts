import { z } from 'zod';
import { isCompleteJobLocation } from './jobPost.location';

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
        .regex(/^01[2-9]\d{8}$/, 'সঠিক মোবাইল নাম্বার দিন'),
      guardianName: z.string({ required_error: 'গার্ডিয়ানের নাম দিন' }), // 🟢
      location: z.object({
        shortArea: z.string().trim().min(1, 'এলাকা নির্বাচন করুন'),
        mapAddress: z.string().trim().min(1, 'ম্যাপ ঠিকানা দিন'),
        detailedAddress: z
          .string({ required_error: 'বাসার বিস্তারিত ঠিকানা দিন' })
          .trim()
          .min(5, 'বাসার বিস্তারিত ঠিকানা দিন (বাসা/রোড নং)'),
        type: z.literal('Point').optional(),
        coordinates: z
          .array(z.number())
          .length(2, 'সার্চ থেকে এলাকা সিলেক্ট করুন'),
        districtId: z.string().optional(),
        districtName: z.string().optional(),
        districtNameBn: z.string().optional(),
        upazilaId: z.string().optional(),
        upazilaName: z.string().optional(),
        upazilaNameBn: z.string().optional(),
      }),

      studentGender: z.enum(['male', 'female']),
      tutorGenderPreference: z.enum(['male', 'female', 'any']),

      studyCategory: z.enum([
        'bangla medium',
        'english medium',
        'english version',
        'admission test',
        'specialized learning',
        'madrasa',
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
    .superRefine((data, ctx) => {
      if (!isCompleteJobLocation(data.location)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'জব পোস্টের জন্য সার্চ থেকে এলাকা সিলেক্ট এবং বাসার বিস্তারিত ঠিকানা দিন',
          path: ['location'],
        });
      }
    })
    .refine((data) => data.maxSalary >= data.minSalary, {
      message: 'ম্যাক্সিমাম স্যালারি মিনিমামের চেয়ে কম হতে পারবে না!',
      path: ['maxSalary'],
    }),
});

const updateJobPostValidationSchema = z.object({
  body: z
    .object({
      tutoringType: z.enum(['offline', 'online', 'both']).optional(),
      guardianPhone: z
        .string()
        .regex(/^01[2-9]\d{8}$/, 'সঠিক মোবাইল নাম্বার দিন')
        .optional(),
      guardianName: z.string().min(1).optional(),
      location: z
        .object({
          shortArea: z.string().optional(),
          mapAddress: z.string().optional(),
          detailedAddress: z.string().optional(),
          type: z.literal('Point').optional(),
          coordinates: z.array(z.number()).length(2).optional(),
          districtId: z.string().optional(),
          districtName: z.string().optional(),
          districtNameBn: z.string().optional(),
          upazilaId: z.string().optional(),
          upazilaName: z.string().optional(),
          upazilaNameBn: z.string().optional(),
        })
        .optional(),
      studentGender: z.enum(['male', 'female']).optional(),
      tutorGenderPreference: z.enum(['male', 'female', 'any']).optional(),
      studyCategory: z
        .enum([
          'bangla medium',
          'english medium',
          'english version',
          'admission test',
          'specialized learning',
          'madrasa',
        ])
        .optional(),
      classLevel: z.string().optional(),
      subjects: z.array(z.enum(ALL_SUBJECTS)).min(1).optional(),
      specialPreferences: z
        .object({
          isExperiencedRequired: z.boolean().optional(),
          isPublicVarsityRequired: z.boolean().optional(),
          isSubjectBackgroundRequired: z.boolean().optional(),
          selectedSubjectBackground: z
            .array(z.enum(SUBJECT_BACKGROUNDS))
            .optional(),
        })
        .optional(),
      minSalary: z.number().positive().optional(),
      maxSalary: z.number().positive().optional(),
      numberOfStudents: z.number().min(1).optional(),
      preferredTime: z
        .enum(['morning', 'afternoon', 'evening', 'tutor_availability'])
        .optional(),
      daysPerWeek: z.number().min(1).max(7).optional(),
      demoClassDate: z
        .string()
        .transform((val) => new Date(val))
        .optional(),
      status: z.enum(['pending', 'published', 'closed']).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.location !== undefined && !isCompleteJobLocation(data.location)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'এলাকা সিলেক্ট এবং বাসার বিস্তারিত ঠিকানা ছাড়া জব আপডেট করা যাবে না',
          path: ['location'],
        });
      }
    }),
});

export const JobPostValidation = {
  createJobPostValidationSchema,
  updateJobPostValidationSchema,
};
