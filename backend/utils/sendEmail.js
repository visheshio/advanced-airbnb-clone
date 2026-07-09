const nodemailer = require('nodemailer');

/**
 * Create nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send an email
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Home Rental" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent: ${info.messageId} → ${to}`);
  return info;
};

// ─── Email Templates ──────────────────────────────────────────────────────

const emailTemplate = (title, content, ctaText = null, ctaUrl = null) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f4f4f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #e11d48, #f43f5e); padding: 32px 24px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; }
    .body p { color: #374151; line-height: 1.6; font-size: 15px; margin: 0 0 16px; }
    .cta { text-align: center; margin: 32px 0; }
    .cta a { background: #e11d48; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block; }
    .footer { background: #f9fafb; padding: 20px 24px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #9ca3af; font-size: 12px; margin: 0; }
    .divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 Home Rental</h1>
      <p>Your trusted home away from home</p>
    </div>
    <div class="body">
      <h2 style="color: #111827; margin: 0 0 16px; font-size: 20px;">${title}</h2>
      ${content}
      ${ctaText && ctaUrl ? `
        <div class="cta">
          <a href="${ctaUrl}">${ctaText}</a>
        </div>
      ` : ''}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Home Rental. All rights reserved.</p>
      <p style="margin-top: 8px;">If you did not request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send email verification email
 */
const sendVerificationEmail = async (user, verificationUrl) => {
  const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>Thank you for registering with Home Rental! Please verify your email address to activate your account and start exploring amazing stays across India.</p>
    <p>This link will expire in <strong>24 hours</strong>.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: '✅ Verify your Home Rental account',
    html: emailTemplate('Verify Your Email', content, 'Verify Email Address', verificationUrl),
  });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const content = `
    <p>Hi <strong>${user.name}</strong>,</p>
    <p>We received a request to reset your password. Click the button below to create a new password.</p>
    <p>This link will expire in <strong>1 hour</strong>. If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
  `;

  await sendEmail({
    to: user.email,
    subject: '🔐 Reset your Home Rental password',
    html: emailTemplate('Password Reset Request', content, 'Reset My Password', resetUrl),
  });
};

/**
 * Send booking confirmation email to guest
 */
const sendBookingConfirmationEmail = async (guest, booking, listing) => {
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-IN', { dateStyle: 'long' });
  const checkOut = new Date(booking.checkOut).toLocaleDateString('en-IN', { dateStyle: 'long' });

  const content = `
    <p>Hi <strong>${guest.name}</strong>,</p>
    <p>Great news! Your booking has been confirmed. Here are your reservation details:</p>
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Property:</strong> ${listing.title}</p>
      <p style="margin: 4px 0;"><strong>Location:</strong> ${listing.location.city}, ${listing.location.country}</p>
      <p style="margin: 4px 0;"><strong>Check-in:</strong> ${checkIn}</p>
      <p style="margin: 4px 0;"><strong>Check-out:</strong> ${checkOut}</p>
      <p style="margin: 4px 0;"><strong>Nights:</strong> ${booking.nights}</p>
      <p style="margin: 4px 0;"><strong>Confirmation Code:</strong> <strong style="color: #e11d48;">${booking.confirmationCode}</strong></p>
      <p style="margin: 4px 0;"><strong>Total Paid:</strong> ₹${booking.pricing.totalPrice.toLocaleString('en-IN')}</p>
    </div>
    <p>We hope you have a wonderful stay!</p>
  `;

  await sendEmail({
    to: guest.email,
    subject: `🎉 Booking Confirmed — ${listing.title}`,
    html: emailTemplate('Booking Confirmed!', content, 'View My Booking', `${process.env.CLIENT_URL}/trips`),
  });
};

/**
 * Send booking request notification to host
 */
const sendBookingRequestEmail = async (host, guest, booking, listing) => {
  const checkIn = new Date(booking.checkIn).toLocaleDateString('en-IN', { dateStyle: 'long' });
  const checkOut = new Date(booking.checkOut).toLocaleDateString('en-IN', { dateStyle: 'long' });

  const content = `
    <p>Hi <strong>${host.name}</strong>,</p>
    <p>You have a new booking request for <strong>${listing.title}</strong>!</p>
    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0;"><strong>Guest:</strong> ${guest.name}</p>
      <p style="margin: 4px 0;"><strong>Check-in:</strong> ${checkIn}</p>
      <p style="margin: 4px 0;"><strong>Check-out:</strong> ${checkOut}</p>
      <p style="margin: 4px 0;"><strong>Nights:</strong> ${booking.nights}</p>
      <p style="margin: 4px 0;"><strong>Guests:</strong> ${booking.adults + booking.children}</p>
      <p style="margin: 4px 0;"><strong>Payout:</strong> ₹${booking.pricing.hostPayout.toLocaleString('en-IN')}</p>
    </div>
    <p>Please respond within 24 hours to confirm or decline this request.</p>
  `;

  await sendEmail({
    to: host.email,
    subject: `🏠 New Booking Request — ${listing.title}`,
    html: emailTemplate('New Booking Request', content, 'Respond to Request', `${process.env.CLIENT_URL}/host/dashboard`),
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingRequestEmail,
};
