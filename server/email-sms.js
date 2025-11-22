require('dotenv').config();
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const twClient = process.env.TWILIO_ACCOUNT_SID
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

async function sendEmail(to, booking) {
  if (!process.env.SMTP_USER) return null;

  const html = `
    <p>Hi ${booking.name},</p>
    <p>Your booking <b>${booking.service}</b> is confirmed for ${booking.date} ${booking.time}.</p>
    <p>Thanks.</p>
  `;

  return await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject: `Booking confirmed — ${booking.service}`,
    html
  });
}

async function sendSms(to, booking) {
  if (!twClient) return null;

  return await twClient.messages.create({
    body: `Booking confirmed: ${booking.service} on ${booking.date} at ${booking.time}.`,
    from: process.env.TWILIO_FROM,
    to
  });
}

module.exports = { sendEmail, sendSms };
