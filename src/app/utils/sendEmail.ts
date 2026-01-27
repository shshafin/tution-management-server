import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (to: string, html: string) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: config.node_env === 'production',
    auth: {
      user: config.email_user,
      pass: config.email_pass,
    },
  });

  await transporter.sendMail({
    from: '"Tutorliy Support" <noreply@tutorliy.com>',
    to,
    subject: 'Reset your password within 10 mins!',
    text: '',
    html,
  });
};
