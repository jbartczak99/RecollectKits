import * as React from 'react';

export const SubscriptionExpiringEmail = ({ username, planName, expirationDate }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#7C3AED', fontSize: '24px', textAlign: 'center' }}>Your Subscription Expires Soon</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {username},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Your <strong>{planName}</strong> subscription is set to expire on <strong>{expirationDate}</strong>.
      Renew now to keep access to all your premium features.
    </p>

    <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0', color: '#333', fontWeight: '600' }}>What you'll lose:</p>
      <ul style={{ margin: '12px 0 0', paddingLeft: '20px', color: '#555' }}>
        <li>Unlimited kit uploads</li>
        <li>Premium badge display</li>
        <li>Priority support</li>
        <li>Advanced collection analytics</li>
      </ul>
    </div>

    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <a href="https://recollectkits.com/pricing" style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        Renew Subscription
      </a>
    </div>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Team
    </p>
  </div>
);

export default SubscriptionExpiringEmail;
