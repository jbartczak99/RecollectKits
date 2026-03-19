import { resend, SENDERS } from '../resend.js';
import { render } from '@react-email/render';
import { canSendEmail } from './preferences.js';

// Import templates
import WelcomeEmail from './templates/WelcomeEmail.jsx';
import PasswordResetEmail from './templates/PasswordResetEmail.jsx';
import FriendRequestEmail from './templates/FriendRequestEmail.jsx';
import FeaturedOnHomepageEmail from './templates/FeaturedOnHomepageEmail.jsx';
import BadgeEarnedEmail from './templates/BadgeEarnedEmail.jsx';
import SubscriptionConfirmEmail from './templates/SubscriptionConfirmEmail.jsx';
import SubscriptionExpiringEmail from './templates/SubscriptionExpiringEmail.jsx';
import PartnerAppReceivedEmail from './templates/PartnerAppReceivedEmail.jsx';
import PartnerAppApprovedEmail from './templates/PartnerAppApprovedEmail.jsx';
import PartnerAppDeniedEmail from './templates/PartnerAppDeniedEmail.jsx';

// ============ TRANSACTIONAL (always sent) ============

export async function sendWelcomeEmail(to, { username }) {
  const html = await render(WelcomeEmail({ username }));

  return resend.emails.send({
    from: SENDERS.transactional,
    to,
    subject: 'Welcome to RecollectKits!',
    html,
  });
}

export async function sendPasswordResetEmail(to, { resetLink }) {
  const html = await render(PasswordResetEmail({ resetLink }));

  return resend.emails.send({
    from: SENDERS.transactional,
    to,
    subject: 'Reset your RecollectKits password',
    html,
  });
}

// ============ NOTIFICATIONS (check preferences) ============

export async function sendFriendRequestEmail(userId, to, data) {
  if (!await canSendEmail(userId, 'friend_requests')) return null;

  const html = await render(FriendRequestEmail(data));

  return resend.emails.send({
    from: SENDERS.notifications,
    to,
    subject: `${data.senderUsername} sent you a friend request`,
    html,
  });
}

export async function sendFeaturedOnHomepageEmail(userId, to, data) {
  if (!await canSendEmail(userId, 'featured_notifications')) return null;

  const html = await render(FeaturedOnHomepageEmail(data));

  return resend.emails.send({
    from: SENDERS.notifications,
    to,
    subject: "You're featured on the homepage!",
    html,
  });
}

export async function sendBadgeEarnedEmail(userId, to, data) {
  if (!await canSendEmail(userId, 'featured_notifications')) return null;

  const html = await render(BadgeEarnedEmail(data));

  return resend.emails.send({
    from: SENDERS.notifications,
    to,
    subject: `You earned the ${data.badgeName} badge!`,
    html,
  });
}

// ============ SUBSCRIPTION ============

export async function sendSubscriptionConfirmEmail(to, data) {
  const html = await render(SubscriptionConfirmEmail(data));

  return resend.emails.send({
    from: SENDERS.transactional,
    to,
    subject: `Welcome to ${data.planName}!`,
    html,
  });
}

export async function sendSubscriptionExpiringEmail(to, data) {
  const html = await render(SubscriptionExpiringEmail(data));

  return resend.emails.send({
    from: SENDERS.transactional,
    to,
    subject: 'Your subscription expires soon',
    html,
  });
}

// ============ PARTNER ============

export async function sendPartnerAppReceivedEmail(to, data) {
  const html = await render(PartnerAppReceivedEmail(data));

  return resend.emails.send({
    from: SENDERS.partners,
    to,
    subject: "We've received your partner application",
    html,
  });
}

export async function sendPartnerAppApprovedEmail(userId, to, data) {
  if (!await canSendEmail(userId, 'partner_updates')) return null;

  const html = await render(PartnerAppApprovedEmail(data));

  return resend.emails.send({
    from: SENDERS.partners,
    to,
    subject: 'Your partner application was approved!',
    html,
  });
}

export async function sendPartnerAppDeniedEmail(userId, to, data) {
  if (!await canSendEmail(userId, 'partner_updates')) return null;

  const html = await render(PartnerAppDeniedEmail(data));

  return resend.emails.send({
    from: SENDERS.partners,
    to,
    subject: 'Update on your partner application',
    html,
  });
}
