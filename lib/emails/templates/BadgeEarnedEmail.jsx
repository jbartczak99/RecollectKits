import * as React from 'react';

export const BadgeEarnedEmail = ({ username, badgeName, badgeDescription }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <img src="https://recollectkits.com/logo-horizontal.png" alt="RecollectKits" style={{ width: '240px', height: 'auto' }} />
    </div>
    <h1 style={{ color: '#7C3AED', fontSize: '28px', textAlign: 'center' }}>Badge Earned!</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {username},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Congratulations! You just earned the <strong>{badgeName}</strong> badge.
    </p>

    {badgeDescription && (
      <div style={{ background: '#f8f5ff', padding: '20px', borderRadius: '8px', margin: '24px 0', textAlign: 'center' }}>
        <p style={{ margin: '0', color: '#555', fontStyle: 'italic' }}>{badgeDescription}</p>
      </div>
    )}

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
        View Your Badges
      </a>
    </div>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      You're receiving this because you have badge notifications enabled.
      {' '}<a href="https://recollectkits.com/settings/notifications" style={{ color: '#7C3AED' }}>Manage preferences</a>
    </p>
  </div>
);

export default BadgeEarnedEmail;
