import * as React from 'react';

export const PartnerAppDeniedEmail = ({ partnerName, reason }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#7C3AED', fontSize: '24px', textAlign: 'center' }}>Application Update</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {partnerName},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Thank you for your interest in the RecollectKits partner program. After careful review, we're unable to approve your application at this time.
    </p>

    {reason && (
      <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0' }}>
        <p style={{ margin: '0', color: '#555' }}><strong>Feedback:</strong> {reason}</p>
      </div>
    )}

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      This doesn't have to be the end of the road. You're welcome to reapply in the future, and we encourage you to continue growing your presence in the collecting community.
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      If you have any questions, feel free to reach out to us.
    </p>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Partners Team
    </p>
  </div>
);

export default PartnerAppDeniedEmail;
