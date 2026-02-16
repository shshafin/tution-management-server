import { TAdminConfig } from './adminConfig.interface';
import { AdminConfig } from './adminConfig.model';

// কনফিগ পাওয়া অথবা আপডেট করা
const updateAdminConfig = async (payload: Partial<TAdminConfig>) => {
  // {} মানে যেকোনো ডকুমেন্ট খুঁজো, যদি না পাও তবে upsert: true দিয়ে নতুন বানাও
  const result = await AdminConfig.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  return result;
};

// বর্তমান কনফিগ রিট্রিভ করা (গার্ডরেইল চেক করার জন্য লাগবে)
const getAdminConfig = async () => {
  let result = await AdminConfig.findOne();

  if (!result) {
    result = await AdminConfig.create({
      signupBonusCredits: 5,
      jobApplyCost: 1,
      globalMinSalary: 2000,
      salaryGapMultiplier: 5,
      isOtpSecurityEnabled: false,
    });
  }
  return result;
};

export const AdminConfigService = {
  updateAdminConfig,
  getAdminConfig,
};
