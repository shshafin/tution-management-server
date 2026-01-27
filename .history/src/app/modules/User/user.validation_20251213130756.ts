import { z } from 'zod';

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'),
    password: z
      .string({
        required_error: 'Password is required',
      })
      .min(6, 'Password must be at least 6 characters'),
    role: z.enum(['super_admin', 'admin', 'moderator'], {
      required_error: 'Role is required',
    }),
    image: z.string().optional(),
  }),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['super_admin', 'admin', 'moderator']).optional(),
    image: z.string().optional(),
    // Password updates should typically be handled in a separate "Change Password" route for security,
    // but Super Admin might need to reset it here.
    password: z.string().min(6).optional(),
  }),
});

export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
