import config from '../config';

export const sendSMS = async (phone: string, otp: string) => {
  // কনফিগ থেকে ডাটা নিচ্ছে
  const message = `Your Tuition Care OTP is: ${otp}. Valid for ${config.otp_expiry_minutes} minutes.`;

  try {
    // বর্তমানে আমরা শুধু টার্মিনালে দেখছি
    console.log('---------------------------------');
    console.log(`📱 SMS SENT TO: ${phone}`);
    console.log(`🔑 API KEY USED: ${config.sms_api_key}`); // জাস্ট চেক করার জন্য
    console.log(`💬 MESSAGE: ${message}`);
    console.log('---------------------------------');

    // ভবিষ্যতে এখানে axios রিকোয়েস্ট যাবে
  } catch (error) {
    console.error('SMS Gateway Error:', error);
  }
};
