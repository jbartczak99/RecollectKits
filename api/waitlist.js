import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const INTEREST_LABELS = {
  collector: 'a Collector',
  creator: 'a Content Creator',
  shop: 'a Shop / Retailer',
  club: 'a Club / Organization',
};

function buildConfirmationEmail(firstName, interest) {
  const interestLine = interest && INTEREST_LABELS[interest]
    ? ` as ${INTEREST_LABELS[interest]}`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#7C3AED;font-size:28px;margin:0;">You're on the list!</h1>
    </div>

    <p style="font-size:16px;line-height:1.6;color:#333;">
      Hey ${firstName},
    </p>

    <p style="font-size:16px;line-height:1.6;color:#333;">
      Thanks for signing up! You're now on the RecollectKits launch list${interestLine}.
      We'll send you an email the moment we officially launch.
    </p>

    <div style="background:#f8f5ff;padding:20px;border-radius:8px;margin:24px 0;">
      <p style="margin:0;color:#333;font-weight:600;">What's coming:</p>
      <ul style="margin:12px 0 0;padding-left:20px;color:#555;">
        <li>Kit tracking &amp; collection management</li>
        <li>Discover new kits &amp; wishlist</li>
        <li>Connect with fellow collectors</li>
        <li>And much more...</li>
      </ul>
    </div>

    <p style="font-size:16px;line-height:1.6;color:#333;">
      In the meantime, follow us for behind-the-scenes updates:
    </p>

    <div style="text-align:center;margin:24px 0;">
      <a href="https://instagram.com/recollectkits" style="color:#7C3AED;margin:0 12px;text-decoration:none;">Instagram</a>
      <a href="https://tiktok.com/@recollectkits" style="color:#7C3AED;margin:0 12px;text-decoration:none;">TikTok</a>
      <a href="https://youtube.com/@recollectkits" style="color:#7C3AED;margin:0 12px;text-decoration:none;">YouTube</a>
      <a href="https://www.linkedin.com/company/recollectkits/" style="color:#7C3AED;margin:0 12px;text-decoration:none;">LinkedIn</a>
    </div>

    <p style="font-size:16px;line-height:1.6;color:#333;">
      Your kits. Your story. Recollected.
    </p>

    <p style="font-size:14px;color:#666;margin-top:40px;border-top:1px solid #eee;padding-top:20px;">
      &mdash; Jerrad &amp; The RecollectKits Team
    </p>
  </div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, interest } = req.body;

  if (!email || !firstName) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    // 1. Add to Resend Audience
    const contactResult = await resend.contacts.create({
      email,
      firstName,
      unsubscribed: false,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    // If contact already exists, that's okay — we'll still send confirmation
    if (contactResult.error && !contactResult.error.message.includes('already exists')) {
      throw new Error(contactResult.error.message);
    }

    // 2. Send confirmation email
    const html = buildConfirmationEmail(firstName, interest);

    await resend.emails.send({
      from: 'RecollectKits <hello@recollectkits.com>',
      to: email,
      subject: 'RecollectKits Waitlist Confirmation',
      html,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Waitlist signup error:', error);

    if (error.message?.includes('already exists')) {
      return res.status(400).json({ error: "You're already on the list!" });
    }

    return res.status(500).json({ error: 'Failed to sign up. Please try again.' });
  }
}
