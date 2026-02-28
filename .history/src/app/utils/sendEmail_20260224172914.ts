import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (
  to: string,
  html: string,
  subject: string = 'Tutorliy Notification',
) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS এর জন্য false
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  await transporter.sendMail({
    from: '"Tutorliy Support" <noreply@tutorliy.com>',
    to,
    subject: subject, // এখন ডাইনামিক সাবজেক্ট
    html,
  });
};
