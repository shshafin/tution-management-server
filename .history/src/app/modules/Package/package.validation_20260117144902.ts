import { z } from 'zod';

const createPackageValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Package name is required' }),
    credits: z
      .number({ required_error: 'Credits amount is required' })
      .positive(),
    price: z.number({ required_error: 'Price is required' }).positive(),
    isActive: z.boolean().optional(),
  }),
});

export const PackageValidation = {
  createPackageValidationSchema,
};
