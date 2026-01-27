import { z } from 'zod';

const createTeamValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    designation: z.string({ required_error: 'Designation is required' }),
    bio: z.string().optional(),
    socialLinks: z
      .object({
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
      })
      .optional(),
    displayOrder: z.number().optional(),
  }),
});

const updateTeamValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    designation: z.string().optional(),
    bio: z.string().optional(),
    socialLinks: z
      .object({
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        facebook: z.string().optional(),
        instagram: z.string().optional(),
      })
      .optional(),
    displayOrder: z.number().optional(),
  }),
});

export const TeamValidation = {
  createTeamValidationSchema,
  updateTeamValidationSchema,
};
