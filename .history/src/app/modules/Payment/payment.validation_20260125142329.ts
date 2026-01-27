import { z } from 'zod';

const createPaymentValidationSchema = z.object({
  body: z.object({
    packageId: z.string({
      required_error: 'প্যাকেজ আইডি দেওয়া আবশ্যক',
    }),
  }),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
};
