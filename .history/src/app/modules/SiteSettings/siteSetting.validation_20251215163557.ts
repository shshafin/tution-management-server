import { z } from 'zod';

const updateSiteSettingValidationSchema = z.object({
  body: z.object({
    siteName: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    socialLinks: z
      .object({
        facebook: z.string().optional(),
        linkedin: z.string().optional(),
        twitter: z.string().optional(),
        instagram: z.string().optional(),
        tiktok: z.string().optional(),
        pinterest: z.string().optional(),
        reddit: z.string().optional(),
      })
      .optional(),
  }),
});

export const SiteSettingValidation = {
  updateSiteSettingValidationSchema,
};
