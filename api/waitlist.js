import { render } from '@react-email/render';
import { resend, SENDERS } from '../lib/resend.js';
import WaitlistConfirmationEmail from '../lib/emails/templates/WaitlistConfirmationEmail.jsx';

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

    // 2. Send confirmation email using the React Email template
    const html = await render(WaitlistConfirmationEmail({ firstName, interest }));

    await resend.emails.send({
      from: SENDERS.transactional,
      to: email,
      subject: "You're on the list!",
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
