import * as React from 'react';

const INTEREST_LABELS = {
  collector: 'a Collector',
  creator: 'a Content Creator',
  shop: 'a Shop / Retailer',
  club: 'a Club / Organization',
};

export const WaitlistConfirmationEmail = ({ firstName, interest }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <img src="https://recollectkits.com/logo-horizontal.png" alt="RecollectKits" style={{ width: '240px', height: 'auto', marginBottom: '24px' }} />
      <h1 style={{ color: '#7C3AED', fontSize: '28px', margin: '0' }}>You're on the list!</h1>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {firstName},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Thanks for signing up! You're now on the RecollectKits launch list
      {interest && ` as ${INTEREST_LABELS[interest] || interest}`}.
      We'll send you an email the moment we officially launch.
    </p>

    <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0', color: '#333', fontWeight: '600' }}>What's coming:</p>
      <ul style={{ margin: '12px 0 0', paddingLeft: '20px', color: '#555' }}>
        <li>Kit tracking & collection management</li>
        <li>Discover new kits & wishlist</li>
        <li>Connect with fellow collectors</li>
        <li>And much more...</li>
      </ul>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      In the meantime, follow us for behind-the-scenes updates:
    </p>

    <div style={{ textAlign: 'center', margin: '24px 0' }}>
      <a href="https://instagram.com/recollectkits" style={{ color: '#7C3AED', margin: '0 12px', textDecoration: 'none' }}>Instagram</a>
      <a href="https://tiktok.com/@recollectkits" style={{ color: '#7C3AED', margin: '0 12px', textDecoration: 'none' }}>TikTok</a>
      <a href="https://youtube.com/@recollectkits" style={{ color: '#7C3AED', margin: '0 12px', textDecoration: 'none' }}>YouTube</a>
      <a href="https://www.linkedin.com/company/recollectkits/" style={{ color: '#7C3AED', margin: '0 12px', textDecoration: 'none' }}>LinkedIn</a>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Your kits. Your story. Recollected.
    </p>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — Jerrad & The RecollectKits Team
    </p>
  </div>
);

export default WaitlistConfirmationEmail;
