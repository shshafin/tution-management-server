/* eslint-disable no-console */
import axios from 'axios';
import config from '../config';

export const initiatePayment = async (paymentData: {
  cus_name: string;
  cus_email: string;
  amount: string;
  tutorId: string;
  packageId: string;
}) => {
  try {
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
  } catch (error: any) {

    console.error(
      'ZiniPay Create Error:',
      error.response?.data || error.message,
    );
    throw new Error(
      error.response?.data?.message || 'ZiniPay payment initiation failed!',
    );
  }
};

/**
 * ZiniPay থেকে পেমেন্ট ভেরিফাই করার ফাংশন
 */
export const verifyPayment = async (invoiceId: string) => {
  try {
    const response = await axios.post(
      config.zinipay.verify_url as string,
      { invoiceId },
      {
        headers: {
          'zini-api-key': config.zinipay.api_key,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error: any) {
    console.error(
      'ZiniPay Verify Error:',
      error.response?.data || error.message,
    );
    return null;
  }
};
