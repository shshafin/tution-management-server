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
      classLevel: z.string({
        required_error: 'ক্লাস লেভেল সিলেক্ট করা আবশ্যক',
      }),
      subjects: z
        .array(z.enum(ALL_SUBJECTS))
        .min(1, 'অন্তত একটি বিষয় সিলেক্ট করুন'),
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
      minSalary: z.number().positive(),
      maxSalary: z.number().positive(),
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
      message:
        'ম্যাক্সিমাম স্যালারি অবশ্যই মিনিমাম স্যালারির চেয়ে বেশি হতে হবে!',
      path: ['maxSalary'],
    }),
});

export const JobPostValidation = { createJobPostValidationSchema };
