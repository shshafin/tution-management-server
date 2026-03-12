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
        invoiceId: invoiceId,
        apiKey: config.zinipay.api_key,
      },
      {
        headers: {
          'zini-api-key': config.zinipay.api_key,
          'Content-Type': 'application/json',
        },
      },
    );
    console.log('ZiniPay verify response:', JSON.stringify(response.data));
    return response.data;
  } catch (error: any) {
    console.log(
      'ZiniPay verify error:',
      error?.response?.data || error.message,
    );
    return null;
  }
};
