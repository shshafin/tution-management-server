import { z } from 'zod';

const createPackageValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Package name is required' }),
    credits: z.coerce
      .number({ required_error: 'Credits amount is required' })
      .positive('Credits must be a positive number'),
    price: z.coerce
      .number({ required_error: 'Price is required' })
      .positive('Price must be a positive number'),
    isActive: z.boolean().optional(),
  }),
});

export const PackageValidation = {
  createPackageValidationSchema,
};
