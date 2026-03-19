import * as React from 'react';

export const PartnerAppApprovedEmail = ({ partnerName, partnerType }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#7C3AED', fontSize: '28px', textAlign: 'center' }}>You're Approved!</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {partnerName},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Great news — your application to become a RecollectKits {partnerType} partner has been approved! Welcome to the partner program.
    </p>

    <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0', color: '#333', fontWeight: '600' }}>As a partner, you get:</p>
      <ul style={{ margin: '12px 0 0', paddingLeft: '20px', color: '#555' }}>
        <li>Your brand featured on RecollectKits</li>
        <li>Access to the partner dashboard</li>
        <li>Direct line to our team</li>
        <li>Early access to new features</li>
      </ul>
    </div>

    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <a href="https://recollectkits.com/partners/dashboard" style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        Go to Partner Dashboard
      </a>
    </div>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Partners Team
    </p>
  </div>
);

export default PartnerAppApprovedEmail;
