import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  const user = process.env.SMTP_USER || process.env.GMAIL_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim(),
      },
    });
    return transporter;
  }

  // Custom SMTP host fallback if configured
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: { user, pass },
    });
    return transporter;
  }

  return null;
};

export const sendOtpEmail = async (toEmail, otpCode, type = 'registration') => {
  const mailer = getTransporter();

  const isReset = type === 'reset';
  const subject = isReset ? 'membiQ - Password Recovery Code' : 'membiQ - Library Activation Code';
  const title = isReset ? 'Reset Your Password' : 'Verify Your Email Address';
  const actionText = isReset
    ? 'Use the 6-digit verification code below to reset your membiQ password:'
    : 'Welcome to membiQ! Please use the 6-digit code below to activate your reading hall:';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #7c3aed; margin: 0; font-size: 24px;">membiQ</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Self-Study Reading Hall SaaS</p>
      </div>
      <div style="background: #f8fafc; border-radius: 8px; padding: 20px; text-align: center;">
        <h3 style="color: #0f172a; margin-top: 0;">${title}</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5;">${actionText}</p>
        <div style="display: inline-block; background: #7c3aed; color: #ffffff; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 28px; border-radius: 8px; margin: 16px 0;">
          ${otpCode}
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">This code is valid for 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 11px;">
        Powered by AddreX Solution • All Rights Reserved — membiQ
      </div>
    </div>
  `;

  if (!mailer) {
    console.log(`[Email Service Notice]: No SMTP configured. Verification OTP for ${toEmail} is: ${otpCode}`);
    return { success: false, reason: 'NO_SMTP_CONFIGURED', code: otpCode };
  }

  try {
    const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@membiq.com';
    const info = await mailer.sendMail({
      from: `"membiQ" <${fromAddr}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`[Email Sent]: Message ID ${info.messageId} to ${toEmail}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Send Error]: ${err.message}. Fallback code: ${otpCode}`);
    return { success: false, error: err.message, code: otpCode };
  }
};

export default sendOtpEmail;
