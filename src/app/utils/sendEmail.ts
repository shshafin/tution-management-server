import nodemailer from 'nodemailer';
import config from '../config';

export const sendEmail = async (
  to: string,
  html: string,
  subject: string = 'Tutorliy Notification',
) => {
  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port),
    secure: false,
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });

  await transporter.sendMail({
    from: '"Tutorliy Support" <support@tutorliy.com>',
    to,
    subject: subject,
    html,
  });
};