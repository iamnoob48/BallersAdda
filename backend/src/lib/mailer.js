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

transporter.verify().then(() => {
  console.log('SMTP connection verified — mailer ready');
}).catch((err) => {
  console.error('SMTP connection FAILED:', err.message);
});

const FROM = process.env.SMTP_FROM || 'BallersAdda <noreply@ballersadda.com>';

export const sendPasswordResetEmail = async (to, link) => {
  try {
    const info = await transporter.sendMail({
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
    console.log(`Password reset email sent to ${to} (messageId: ${info.messageId})`);
  } catch (err) {
    console.error(`Failed to send password reset email to ${to}:`, err.message);
    throw err;
  }
};

