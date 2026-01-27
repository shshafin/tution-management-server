import { z } from 'zod';

const ALL_SUBJECTS = [
  'Bangla',
  'English',
  'Mathematics',
  'ICT',
  'Physics',
  'Chemistry',
  'Biology',
  'Higher Mathematics',
  'Accounting',
  'Finance & Banking',
  'Economics',
  'History',
  'Civics',
  'Geography',
  'English Literature',
  'Additional Mathematics',
  'Computer Science',
  'Law',
  'Statistics', // ... (বাকিগুলোও এর মধ্যে থাকবে)
] as const;

const createJobPostValidationSchema = z.object({
  body: z
    .object({
      tutoringType: z.enum(['home', 'online']),
      guardianPhone: z
        .string()
        .regex(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নাম্বার দিন'),
      studentGender: z.enum(['male', 'female']),
      tutorGenderPreference: z.enum(['male', 'female', 'any']),

      studyCategory: z.enum([
        'Bangla Medium',
        'English Medium',
        'English Version',
        'Admission Test',
      ]),
      classLevel: z.string({ required_error: 'ক্লাস লেভেল আবশ্যক' }),
      subjects: z.array(z.string()).min(1, 'অন্তত একটি বিষয় সিলেক্ট করুন'),

      specialPreferences: z.object({
        isExperiencedRequired: z.boolean().default(false),
        isPublicVarsityRequired: z.boolean().default(false),
        isSubjectBackgroundRequired: z.boolean().default(false),
        selectedSubjectBackground: z
          .array(
            z.enum([
              'CSE',
              'English',
              'Math',
              'Physics',
              'Chemistry',
              'Biology',
            ]),
          )
          .optional(),
      }),

      minSalary: z.number().min(500),
      maxSalary: z.number(),
      numberOfStudents: z.number().min(1),
      preferredTime: z.enum([
        'morning',
        'afternoon',
        'evening',
        'tutor_availability',
      ]),
      daysPerWeek: z.array(z.number().min(1).max(7)).min(1),
      demoClassDate: z.string().transform((val) => new Date(val)),
    })
    .refine((data) => data.maxSalary > data.minSalary, {
      message: 'Max range must be larger than min range',
      path: ['maxSalary'],
    }),
});

export const JobPostValidation = {
  createJobPostValidationSchema,
};
