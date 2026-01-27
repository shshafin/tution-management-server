const initPayment = async (tutorId: string, packageId: string) => {
  const tutor = await User.findById(tutorId);
  const pkg = await Package.findById(packageId);

  if (!tutor || !pkg) {
    throw new AppError(httpStatus.NOT_FOUND, 'Tutor or Package not found!', '');
  }

  // ১. তোর কাস্টম আইডি জেনারেট
  const invoiceId = `INV-${uuidv4().split('-')[0].toUpperCase()}-${Date.now()}`;

  // ২. ইউটিলিটিতে আইডিটা পাস করা
  const paymentResponse = await initiatePayment({
    cus_name: tutor.name,
    cus_email: tutor.email,
    amount: pkg.price.toString(),
    tutorId: tutorId,
    packageId: packageId,
    invoiceId: invoiceId, // 🟢 সার্ভিস থেকে আইডি পাঠাচ্ছি
  });

  if (paymentResponse.status) {
    await Payment.create({
      tutor: tutorId,
      package: packageId,
      amount: pkg.price,
      invoiceId: invoiceId, // 🟢 ডাটাবেজে একই আইডি সেভ হচ্ছে
      status: 'pending',
    });

    return { paymentUrl: paymentResponse.payment_url };
  }

  throw new AppError(
    httpStatus.BAD_REQUEST,
    'ZiniPay payment link generation failed!',
    '',
  );
};
