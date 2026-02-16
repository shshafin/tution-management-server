export type TAdminConfig = {
  // Tutor Logic
  signupBonusCredits: number;
  jobApplyCost: number;
  jobSearchRadius: number;

  // Guardian Guardrails
  globalMinSalary: number;
  salaryGapMultiplier: number;

  // Security Logic
  isOtpSecurityEnabled: boolean;
};
