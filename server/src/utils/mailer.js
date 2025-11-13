const nodemailer = require('nodemailer');

/**
 * sendEmail helper - production-only SMTP sender
 * Requires MAIL_HOST, MAIL_USER and MAIL_PASS to be set in env.
 * This helper intentionally does NOT fallback to Ethereal or
 * log preview URLs. Raw tokens or reset URLs must never be
 * printed to logs in production.
 */
async function sendEmail({ to, subject, html, text }) {
  // Require SMTP credentials to be present
  const hasSmtpConfig = !!(
    process.env.MAIL_HOST &&
    process.env.MAIL_USER &&
    process.env.MAIL_PASS
  );

  if (!hasSmtpConfig) {
    throw new Error(
      'SMTP mailer not configured. Set MAIL_HOST, MAIL_USER and MAIL_PASS in env.'
    );
  }

  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const fromAddress = process.env.MAIL_FROM ||
    `no-reply@${(process.env.CLIENT_URL || 'example.com')
      .replace(/^https?:\/\//, '')}`;

  // Send and let errors bubble up to caller for handling/logging
  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html
  });

  return info;
}

module.exports = { sendEmail };
