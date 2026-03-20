import * as React from 'react';

export const FeaturedOnHomepageEmail = ({ username }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: '8px' }}>
      <img src="https://recollectkits.com/logo-horizontal.png" alt="RecollectKits" style={{ width: '240px', height: 'auto' }} />
    </div>
    <h1 style={{ color: '#7C3AED', fontSize: '28px', textAlign: 'center' }}>You're Featured!</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {username},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Great news — your collection has been featured on the RecollectKits homepage! Collectors across the community can now see your kits front and center.
    </p>

    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <a href="https://recollectkits.com" style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        See It Live
      </a>
    </div>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Keep building your collection — you never know when you'll be featured again!
    </p>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      You're receiving this because you have featured notifications enabled.
      {' '}<a href="https://recollectkits.com/settings/notifications" style={{ color: '#7C3AED' }}>Manage preferences</a>
    </p>
  </div>
);

export default FeaturedOnHomepageEmail;
