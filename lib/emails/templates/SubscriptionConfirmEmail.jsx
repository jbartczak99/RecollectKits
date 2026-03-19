import * as React from 'react';

export const SubscriptionConfirmEmail = ({ username, planName, price, nextBillingDate }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#7C3AED', fontSize: '24px', textAlign: 'center' }}>Welcome to {planName}!</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {username},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Thanks for upgrading! Your {planName} subscription is now active.
    </p>

    <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0 0 8px', color: '#333' }}><strong>Plan:</strong> {planName}</p>
      <p style={{ margin: '0 0 8px', color: '#333' }}><strong>Price:</strong> ${price}/month</p>
      <p style={{ margin: '0', color: '#333' }}><strong>Next billing date:</strong> {nextBillingDate}</p>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      You now have access to all {planName} features. Enjoy!
    </p>

    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <a href="https://recollectkits.com/collection" style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        Go to My Collection
      </a>
    </div>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Team
    </p>
  </div>
);

export default SubscriptionConfirmEmail;
