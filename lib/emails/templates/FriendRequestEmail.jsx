import * as React from 'react';

export const FriendRequestEmail = ({ recipientName, senderUsername, senderAvatarUrl, viewRequestUrl }) => (
  <div style={{ fontFamily: 'system-ui, sans-serif', padding: '40px 20px', maxWidth: '600px', margin: '0 auto' }}>
    <h1 style={{ color: '#7C3AED', fontSize: '24px', textAlign: 'center' }}>New Friend Request</h1>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      Hey {recipientName},
    </p>

    <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#333' }}>
      <strong>{senderUsername}</strong> wants to connect with you on RecollectKits!
    </p>

    <div style={{ margin: '32px 0', textAlign: 'center' }}>
      <a href={viewRequestUrl} style={{
        backgroundColor: '#7C3AED',
        color: 'white',
        padding: '14px 28px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'inline-block'
      }}>
        View Request
      </a>
    </div>

    <p style={{ fontSize: '14px', color: '#666', marginTop: '40px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
      You're receiving this because you have friend request emails enabled.
      {' '}<a href="https://recollectkits.com/settings/notifications" style={{ color: '#7C3AED' }}>Manage preferences</a>
    </p>
  </div>
);

export default FriendRequestEmail;
