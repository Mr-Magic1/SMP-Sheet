import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn(`[Nodemailer Warning] SMTP not configured. Would have sent email to ${to} with subject: "${subject}"\nText: ${text}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SheetForge" <noreply@sheetforge.com>',
      to,
      subject,
      text,
      html: html || text,
    });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};
