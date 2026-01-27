import config from '../config';

export const sendSMS = async (phone: string, otp: string) => {
  const message = `Your Tuition Care OTP is: ${otp}. Valid for 5 minutes.`;

  try {
    // এখানে ভবিষ্যতে SMS Gateway API কল হবে
    console.log('---------------------------------');
    console.log(`📱 SMS SENT TO: ${phone}`);
    console.log(`💬 MESSAGE: ${message}`);
    console.log('---------------------------------');
  } catch (error) {
    console.error('SMS Gateway Error:', error);
  }
};
