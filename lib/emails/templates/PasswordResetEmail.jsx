import * as React from 'react';

export const PasswordResetEmail = ({ resetLink }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <img src="https://recollectkits.com/logo-horizontal.png" alt="RecollectKits" style={{ width: '240px', height: 'auto' }} />
    </div>
    <h1 style={{ color: '#7C3AED', fontSize: '24px', textAlign: 'center' }}>Reset Your Password</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      We received a request to reset your password. Click the button below to choose a new one:
    </p>

    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <a href={resetLink} style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        Reset Password
      </a>
    </div>

    <p style={{ fontSize: '14px', color: '#666' }}>
      This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
    </p>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Team
    </p>
  </div>
);

export default PasswordResetEmail;
