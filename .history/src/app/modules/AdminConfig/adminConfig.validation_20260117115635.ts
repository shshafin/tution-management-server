import { z } from 'zod';

const updateAdminConfigValidationSchema = z.object({
  body: z.object({
    signupBonusCredits: z.number().min(0).optional(),
    jobApplyCost: z.number().min(1).optional(),
    globalMinSalary: z.number().min(500).optional(),
    salaryGapMultiplier: z.number().min(1).optional(),
    isOtpSecurityEnabled: z.boolean().optional(),
  }),
});

export const AdminConfigValidation = {
  updateAdminConfigValidationSchema,
};