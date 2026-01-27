export const initiatePayment = async (paymentData: {
  cus_name: string;
  cus_email: string;
  amount: string;
  tutorId: string;
  packageId: string;
  invoiceId: string;
}) => {
  try {
    const payload = {
      cus_name: paymentData.cus_name,
      cus_email: paymentData.cus_email,
      amount: paymentData.amount,
      invoice_id: paymentData.invoiceId, // 🟢 এখন জিনিপে এই আইডিটাই ব্যবহার করবে
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
    throw new Error(
      error.response?.data?.message || 'ZiniPay initiation failed!',
    );
  }
};

export const verifyPayment = async (invoiceId: string) => {
  try {
    const response = await axios.post(
      config.zinipay.verify_url as string,
      { invoice_id: invoiceId }, // 🟢 জিনিপে এই ফিল্ডেই ইনভয়েস আইডি চেক করে
      {
        headers: {
          'zini-api-key': config.zinipay.api_key,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    return null;
  }
};
