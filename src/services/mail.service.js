const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporterPromise = null;

function hasRealSmtp() {
  const host = config.email.host;
  const user = config.email.user;
  const pass = config.email.pass;
  if (!host || !user || !pass) return false;
  if (/^tu_/i.test(String(user)) || /^tu_/i.test(String(pass))) return false;
  return true;
}

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (hasRealSmtp()) {
      console.log(
        `[mail] SMTP configured: ${config.email.host}:${config.email.port} (user ${config.email.user})`
      );
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

    console.warn(
      '[mail] EMAIL_* missing or placeholder → using Ethereal (preview in console), not Mailtrap'
    );
    const account = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
  })();

  return transporterPromise;
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
    text: `Open this link to activate your account: ${link}\nOr POST /api/auth/confirm-email with { "token": "${token}" }`,
    html: `
      <p>Confirm your <strong>ApiCenar</strong> account.</p>
      <p><a href="${link}">Click here to activate</a></p>
      <p>Or copy: <code>${link}</code></p>
      <p>Token (for Swagger POST): <code>${token}</code></p>
    `,
  });
}

async function sendResetPasswordEmail({ to, token }) {
  console.log('[mail] Reset token for', to, '→', token);
  return sendMail({
    to,
    subject: 'ApiCenar — Reset password',
    text: `Reset token: ${token}\nPOST /api/auth/reset-password with token + new password.`,
    html: `<p>Reset token: <code>${token}</code></p><p>Use POST <code>/api/auth/reset-password</code> with the token and new password.</p>`,
  });
}

module.exports = {
  sendMail,
  sendActivationEmail,
  sendResetPasswordEmail,
};
