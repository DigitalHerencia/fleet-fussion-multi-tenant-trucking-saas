import nodemailer from 'nodemailer';

export async function sendReportEmail({
  to,
  subject,
  text,
  attachments = [],
}: {
  to: string;
  subject: string;
  text: string;
  attachments?: { filename: string; content: Buffer }[];
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    text,
    attachments,
  });
}
