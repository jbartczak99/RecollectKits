import { supabase } from './../../src/lib/supabase';

const DEFAULT_PREFERENCES = {
  transactional: true,
  friend_requests: true,
  featured_notifications: true,
  partner_updates: true,
  product_updates: false,
  newsletter: false,
};

/**
 * Check if a specific email type can be sent to a user.
 * Transactional emails always send. Others check user preferences.
 */
export async function canSendEmail(userId, preferenceKey) {
  // Transactional emails always send
  if (preferenceKey === 'transactional') return true;

  const { data } = await getEmailPreferences(userId);

  if (!data) return true; // Default to sending if error

  return data[preferenceKey] === true;
}

/**
 * Get email preferences for a user from the profiles JSONB column.
 */
export async function getEmailPreferences(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('email_preferences')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Merge with defaults so any missing keys get a value
    const prefs = { ...DEFAULT_PREFERENCES, ...(data.email_preferences || {}) };
    return { data: prefs, error: null };
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    return { data: DEFAULT_PREFERENCES, error };
  }
}

/**
 * Update one or more email preference fields in the JSONB column.
 * Merges updates into the existing object.
 * @param {string} userId
 * @param {Object} updates - e.g. { friend_requests: false }
 */
export async function updateEmailPreferences(userId, updates) {
  try {
    // Fetch current preferences first to merge
    const { data: current } = await supabase
      .from('profiles')
      .select('email_preferences')
      .eq('id', userId)
      .single();

    const merged = {
      ...DEFAULT_PREFERENCES,
      ...(current?.email_preferences || {}),
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({ email_preferences: merged })
      .eq('id', userId)
      .select('email_preferences')
      .single();

    if (error) throw error;
    return { data: data.email_preferences, error: null };
  } catch (error) {
    console.error('Error updating email preferences:', error);
    return { data: null, error };
  }
}
