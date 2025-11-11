const nodemailer = require('nodemailer');

/**
 * sendEmail helper
 * - If SMTP env vars are provided, use them.
 * - Otherwise use Ethereal test account and log preview URL.
 */
async function sendEmail({ to, subject, html, text }) {
  let transporter;

  if (process.env.MAIL_HOST && process.env.MAIL_USER) {
    // Use real SMTP transport from env
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });
  } else {
    // Fallback: create ethereal test account for dev
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  const fromAddress = process.env.MAIL_FROM ||
    `no-reply@${process.env.CLIENT_URL?.replace(/^https?:\/\//, '') || 'example.com'}`;

  const info = await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    text,
    html
  });

  // If ethereal, log preview URL
  try {
    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) {
      console.log('Preview email URL:', preview);
    }
  } catch (err) {
    // ignore
  }

  return info;
}

module.exports = { sendEmail };
