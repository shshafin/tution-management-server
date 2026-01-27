import { z } from 'zod';

const createBlogValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    content: z.string({ required_error: 'Content is required' }),
    category: z.enum(['News', 'Event', 'Tips', 'Stories']).optional(),
    author: z.string().optional(),
    isPublished: z.boolean().optional(),
  }),
});

const updateBlogValidationSchema = z.object({
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    category: z.enum(['News', 'Event', 'Tips', 'Stories']).optional(),
    author: z.string().optional(),
    isPublished: z.boolean().optional(),
  }),
});

export const BlogValidation = {
  createBlogValidationSchema,
  updateBlogValidationSchema,
};
