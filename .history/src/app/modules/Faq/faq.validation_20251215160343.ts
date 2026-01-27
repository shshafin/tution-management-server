import { z } from 'zod';

const createFaqValidationSchema = z.object({
  body: z.object({
    question: z.string({ required_error: 'Question is required' }),
    answer: z.string({ required_error: 'Answer is required' }),
  }),
});

const updateFaqValidationSchema = z.object({
  body: z.object({
    question: z.string().optional(),
    answer: z.string().optional(),
  }),
});

export const FaqValidation = {
  createFaqValidationSchema,
  updateFaqValidationSchema,
};
