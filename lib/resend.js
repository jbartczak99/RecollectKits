import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

// Sender addresses
export const SENDERS = {
  transactional: 'RecollectKits <hello@recollectkits.com>',
  notifications: 'RecollectKits <notifications@recollectkits.com>',
  partners: 'RecollectKits Partners <partners@recollectkits.com>',
};
