export type TAdminConfig = {
  // Tutor Logic
  signupBonusCredits: number;
  jobApplyCost: number;
  jobSearchRadius: number; // 🟢 নতুন: কিলোমিটার হিসেবে (e.g., 5, 10)

  // Guardian Guardrails
  globalMinSalary: number;
  salaryGapMultiplier: number;

  // Security Logic
  isOtpSecurityEnabled: boolean;
};
