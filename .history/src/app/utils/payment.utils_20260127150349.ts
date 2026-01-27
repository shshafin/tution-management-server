/* eslint-disable no-console */
import axios from 'axios';
import config from '../config';

/**
 * ZiniPay-তে পেমেন্ট রিকোয়েস্ট পাঠানোর ফাংশন
 */
export const initiatePayment = async (paymentData: {
  cus_name: string;
  cus_email: string;
  amount: string;
  tutorId: string;
  packageId: string;
  invoiceId: string; // 🟢 এই আইডিটা সার্ভিস থেকে পাঠাতে হবে
}) => {
  try {
    const payload = {
      cus_name: paymentData.cus_name,
      cus_email: paymentData.cus_email,
      amount: paymentData.amount,
      invoice_id: paymentData.invoiceId, // 🟢 জিনিপে-কে আমরা আমাদের ইনভয়েস আইডি বলে দিচ্ছি
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
    // 🟢 জিনিপে সাধারণত ইনভয়েস আইডি দিয়েই ভেরিফাই করতে দেয়
    const response = await axios.post(
      config.zinipay.verify_url as string,
      { invoice_id: invoiceId }, // 🟢 জিনিপে-এর ডকুমেন্টেশন অনুযায়ী 'invoice_id' হতে পারে
      {
        headers: {
          'zini-api-key': config.zinipay.api_key,
          'Content-Type': 'application/json',
        },
      },
    );

    // জিনিপে-র রেসপন্স যদি সরাসরি ডাটা হয় তবে data রিটার্ন করবে
    return response.data;
  } catch (error: any) {
    console.error(
      'ZiniPay Verify Error:',
      error.response?.data || error.message,
    );
    return null;
  }
};
