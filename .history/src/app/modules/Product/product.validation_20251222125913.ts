import { z } from 'zod';

const createProductValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Product Name is required' }),
    category: z.enum(
      ['Plush', 'Plastic', 'Educational', 'Electronic', 'Wooden', 'Others'],
      {
        required_error: 'Category is required',
      },
    ),
    images: z.array(z.string()).optional(), // Array of strings (URLs)
    description: z.string({ required_error: 'Description is required' }),
    price: z.number().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

const updateProductValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    category: z
      .enum(['Soft Toy', 'Plastic Toy', 'Baby Accessories', 'Others'])
      .optional(),
    images: z.array(z.string()).optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    isFeatured: z.boolean().optional(),
  }),
});

export const ProductValidation = {
  createProductValidationSchema,
  updateProductValidationSchema,
};
