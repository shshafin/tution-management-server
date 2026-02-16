import { TAdminConfig } from './adminConfig.interface';
import { AdminConfig } from './adminConfig.model';

const updateAdminConfig = async (payload: Partial<TAdminConfig>) => {
  const result = await AdminConfig.findOneAndUpdate({}, payload, {
    new: true,
    upsert: true,
    runValidators: true,
  });
  return result;
};

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
