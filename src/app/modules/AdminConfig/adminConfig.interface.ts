export type TAdminConfig = {
  // Tutor Logic
  signupBonusCredits: number;
  jobApplyCost: number;

  // Guardian Guardrails
  globalMinSalary: number;
  salaryGapMultiplier: number; // যেমন: ৫ গুণ (৫০০০ - ২৫০০০ এর মধ্যে রাখতে)

  // Security Logic
  isOtpSecurityEnabled: boolean; // Anti-Spam Toggle
};
