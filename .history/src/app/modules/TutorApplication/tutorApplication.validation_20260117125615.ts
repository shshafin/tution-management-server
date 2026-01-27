import { z } from 'zod';

const createApplicationValidationSchema = z.object({
  body: z.object({
    jobPostId: z.string({ required_error: 'Job Post ID is required' }),
  }),
});

export const TutorApplicationValidation = {
  createApplicationValidationSchema,
};
