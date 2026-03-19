import * as React from 'react';

export const PartnerAppReceivedEmail = ({ partnerName, partnerType }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#7C3AED', fontSize: '24px', textAlign: 'center' }}>Application Received</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {partnerName},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Thanks for applying to become a RecollectKits {partnerType} partner! We've received your application and our team is reviewing it now.
    </p>

    <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
      <p style={{ margin: '0 0 8px', color: '#333', fontWeight: '600' }}>What happens next:</p>
      <ol style={{ margin: '0', paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
        <li>Our team reviews your application</li>
        <li>We may reach out for additional details</li>
        <li>You'll receive an email with our decision</li>
      </ol>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      This typically takes 3–5 business days. We'll be in touch!
    </p>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Partners Team
    </p>
  </div>
);

export default PartnerAppReceivedEmail;
