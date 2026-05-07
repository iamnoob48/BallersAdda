import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || 'BallersAdda <noreply@ballersadda.com>';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

export const sendPasswordResetEmail = async (to, rawToken) => {
  const link = `${CLIENT_URL}/reset-password?token=${rawToken}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Reset your BallersAdda password',
    text: `Click the link below to reset your password. It expires in 1 hour.\n\n${link}\n\nIf you didn't request this, ignore this email — your password won't change.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Reset your password</h2>
        <p>Click the button below to set a new password for your BallersAdda account. This link expires in <strong>1 hour</strong>.</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Reset Password
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:14px">
          Or copy this link into your browser:<br/>
          <span style="word-break:break-all">${link}</span>
        </p>
        <p style="color:#6b7280;font-size:12px">If you didn't request a password reset, ignore this email.</p>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (to, rawToken) => {
  const link = `${CLIENT_URL}/verify-email?token=${rawToken}`;

  await transporter.sendMail({
    from: FROM,
    to,
    subject: 'Verify your BallersAdda account',
    text: `Click the link below to verify your email address. It expires in 24 hours.\n\n${link}\n\nIf you didn't create an account, ignore this email.`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Verify your email</h2>
        <p>Click the button below to verify your BallersAdda account. This link expires in <strong>24 hours</strong>.</p>
        <a href="${link}"
           style="display:inline-block;padding:12px 24px;background:#16a34a;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Verify Email
        </a>
        <p style="margin-top:24px;color:#6b7280;font-size:14px">
          Or copy this link into your browser:<br/>
          <span style="word-break:break-all">${link}</span>
        </p>
        <p style="color:#6b7280;font-size:12px">If you didn't create an account, ignore this email.</p>
      </div>
    `,
  });
};
