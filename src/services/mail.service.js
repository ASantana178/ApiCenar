const nodemailer = require('nodemailer');
const config = require('../config/env');

let etherealTransporterPromise = null;

async function getTransporter() {
  if (config.email.host && config.email.user) {
    return nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: false,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  if (!etherealTransporterPromise) {
    etherealTransporterPromise = nodemailer.createTestAccount().then((account) =>
      nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: account.user,
          pass: account.pass,
        },
      })
    );
  }

  return etherealTransporterPromise;
}

async function sendMail({ to, subject, html, text }) {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: config.email.from,
    to,
    subject,
    html,
    text,
  });

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log('[mail] Ethereal preview:', preview);
  }

  return info;
}

async function sendActivationEmail({ to, token }) {
  const link = `${config.appUrl}/api/auth/confirm-email?token=${encodeURIComponent(token)}`;
  console.log('[mail] Activation token for', to, '→', token);
  return sendMail({
    to,
    subject: 'ApiCenar — Confirm your account',
    text: `Confirm your account with this token: ${token}\nOr POST /api/auth/confirm-email with { "token": "..." }\nLink helper: ${link}`,
    html: `<p>Confirm your ApiCenar account.</p><p>Token: <code>${token}</code></p><p>POST <code>/api/auth/confirm-email</code> with the token.</p>`,
  });
}

async function sendResetPasswordEmail({ to, token }) {
  console.log('[mail] Reset token for', to, '→', token);
  return sendMail({
    to,
    subject: 'ApiCenar — Reset password',
    text: `Reset token: ${token}\nPOST /api/auth/reset-password with token + new password.`,
    html: `<p>Reset token: <code>${token}</code></p>`,
  });
}

module.exports = {
  sendMail,
  sendActivationEmail,
  sendResetPasswordEmail,
};
