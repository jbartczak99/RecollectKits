import { useState, useEffect } from 'react';
import { getEmailPreferences, updateEmailPreferences } from '../../../lib/emails/preferences';

const PREFERENCE_LABELS = {
  friend_requests: {
    label: 'Friend requests',
    description: 'When someone sends you a friend request',
  },
  featured_notifications: {
    label: 'Featured & badges',
    description: 'When you are featured on the homepage or earn a badge',
  },
  partner_updates: {
    label: 'Partner updates',
    description: 'Updates about your partner applications',
  },
  product_updates: {
    label: 'Product updates',
    description: 'New features and announcements',
  },
  newsletter: {
    label: 'Newsletter',
    description: 'Tips, collector stories, and community highlights',
  },
};

export default function EmailPreferences({ userId }) {
  const [preferences, setPreferences] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userId) loadPreferences();
  }, [userId]);

  const loadPreferences = async () => {
    const { data } = await getEmailPreferences(userId);
    if (data) setPreferences(data);
  };

  const handleToggle = async (key) => {
    const newValue = !preferences[key];
    setPreferences({ ...preferences, [key]: newValue });
    setSaving(true);

    await updateEmailPreferences(userId, { [key]: newValue });
    setSaving(false);
  };

  if (!preferences) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#6b7280' }}>
        Loading preferences...
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="text-xl font-semibold" style={{ marginBottom: '0.25rem' }}>Email Preferences</h2>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Choose which emails you'd like to receive
        </p>
      </div>

      <div>
        {Object.entries(PREFERENCE_LABELS).map(([key, { label, description }]) => (
          <div
            key={key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1rem 0',
              borderBottom: '1px solid var(--gray-200)',
            }}
          >
            <div>
              <p className="font-medium" style={{ margin: 0 }}>{label}</p>
              <p className="text-sm" style={{ margin: '0.25rem 0 0', color: '#6b7280' }}>{description}</p>
            </div>
            <button
              onClick={() => handleToggle(key)}
              aria-label={`Toggle ${label}`}
              aria-checked={preferences[key]}
              role="switch"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                height: '24px',
                width: '44px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                background: preferences[key] ? 'var(--primary-600)' : 'var(--gray-300)',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  height: '16px',
                  width: '16px',
                  borderRadius: '50%',
                  background: 'white',
                  transition: 'transform 0.2s',
                  transform: preferences[key] ? 'translateX(24px)' : 'translateX(4px)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }}
              />
            </button>
          </div>
        ))}
      </div>

      <p className="text-sm" style={{ color: '#9ca3af', marginTop: '1.5rem' }}>
        Note: Transactional emails (password reset, subscription confirmations) cannot be disabled.
      </p>
    </div>
  );
}
