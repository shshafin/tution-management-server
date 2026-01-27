import { z } from 'zod';
import {
  BachelorMajors,
  DaysOfWeek,
  TeachingClasses,
  TeachingMediums,
} from './user.constant';

const educationValidation = z.object({
  background: z.enum([
    'bangla medium',
    'english medium',
    'english version',
    'Madrasa',
  ]),
  curriculum: z
    .enum(['Edexcell curriculam', 'Cambridge curriculam', 'IB curriculam'])
    .optional(),
  institute: z.string().min(1),
  group: z.enum(['science', 'commerce', 'humanities']),
  result: z.string().min(1),
  passingYear: z.string().length(4),
});

const createTutorSchema = z.object({
  body: z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string().min(6),
    phone: z.string(),
    location: z.string(),
    gender: z.enum(['male', 'female']),
    tutorType: z.array(z.enum(['online', 'offline'])),
    teachingMediums: z.array(z.enum(TeachingMediums)),
    teachingClasses: z.array(z.enum(TeachingClasses)),
    availableDays: z.array(z.enum(DaysOfWeek)),
    experienceYears: z.number().min(0),
    secondaryInfo: educationValidation,
    higherSecondaryInfo: educationValidation,
    bachelorInfo: z.object({
      institute: z.string(),
      discipline: z.enum([
        'engineering',
        'medical',
        'business',
        'science',
        'social science',
        'fine_arts',
      ]),
      major: z.enum(BachelorMajors),
      customMajor: z.string().optional(),
      result: z.string().,
      passingYear: z.string().length(4),
    }),
  }),
});

export const UserValidation = { createTutorSchema };
