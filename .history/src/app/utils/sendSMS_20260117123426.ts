/* eslint-disable no-console */
import config from '../config';

export const sendSMS = async (phone: string, otp: string) => {
  // কনফিগ থেকে ডাটা নিচ্ছে
  const message = `Your Tuition Care OTP is: ${otp}. Valid for ${config.otp_expiry_minutes} minutes.`;

  try {
 
    console.log('---------------------------------');
    console.log(`📱 SMS SENT TO: ${phone}`);
    console.log(`🔑 API KEY USED: ${config.sms_api_key}`); 
    console.log(`💬 MESSAGE: ${message}`);
    console.log('---------------------------------');

    
  } catch (error) {
    console.error('SMS Gateway Error:', error);
  }
};
