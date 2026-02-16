import { Schema, model } from 'mongoose';
import { TAdminConfig } from './adminConfig.interface';

const adminConfigSchema = new Schema<TAdminConfig>(
  {
    signupBonusCredits: { type: Number, default: 5 },
    jobApplyCost: { type: Number, default: 1 },
    jobSearchRadius: { type: Number, default: 5 }, 
    globalMinSalary: { type: Number, default: 2000 },
    salaryGapMultiplier: { type: Number, default: 5 },
    isOtpSecurityEnabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

export const AdminConfig = model<TAdminConfig>(
  'AdminConfig',
  adminConfigSchema,
);
