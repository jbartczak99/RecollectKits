import * as React from 'react';

export const WelcomeEmail = ({ username }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <img src="https://recollectkits.com/logo-horizontal.png" alt="RecollectKits" style={{ width: '240px', height: 'auto', marginBottom: '24px' }} />
      <h1 style={{ color: '#7C3AED', fontSize: '28px', margin: '0' }}>Welcome to RecollectKits!</h1>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {username},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Welcome to the community! RecollectKits is where collectors like you catalog, showcase, and celebrate your football shirt collection.
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
        Start Your Collection
      </a>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Here's what you can do:
    </p>
    <ul style={{ fontSize: '16px', lineHeight: '1.8', color: '#333' }}>
      <li>Add up to 15 kits on the free plan</li>
      <li>Upload 3 photos per kit</li>
      <li>Create custom collections</li>
      <li>Connect with other collectors</li>
    </ul>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Your kits. Your story. Recollected.
    </p>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      — The RecollectKits Team
    </p>
  </div>
);

export default WelcomeEmail;
