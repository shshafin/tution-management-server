/* eslint-disable no-console */
import axios from 'axios';
import config from '../config';

/**
 * ZiniPay-তে পেমেন্ট রিকোয়েস্ট পাঠানোর ফাংশন
 */
export const initiatePayment = async (paymentData: any) => {
  const payload = {
    cus_name: paymentData.cus_name,
    cus_email: paymentData.cus_email,
    amount: paymentData.amount,
    redirect_url: config.zinipay.redirect_url,
    cancel_url: config.zinipay.cancel_url,
    webhook_url: config.zinipay.webhook_url,
    metadata: {
      tutorId: paymentData.tutorId,
      packageId: paymentData.packageId,
    },
  };

  const response = await axios.post(
    config.zinipay.create_url as string,
    payload,
    {
      headers: {
        'zini-api-key': config.zinipay.api_key,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const verifyPayment = async (invoiceId: string) => {
  try {
    const response = await axios.post(
      config.zinipay.verify_url as string,
      {
        invoiceId: invoiceId, // ডক অনুযায়ী ফিল্ড নাম
        apiKey: config.zinipay.api_key, // ডক অনুযায়ী বডিতেও এপিআই কি চায়
      },
      {
        headers: {
          'zini-api-key': config.zinipay.api_key,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data; // ডকের রেসপন্স অবজেক্ট সরাসরি রিটার্ন
  } catch (error) {
    return null;
  }
};
