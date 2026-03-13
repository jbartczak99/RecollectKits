import { supabase } from './supabase'

/**
 * Create a single notification
 */
export async function createNotification({ userId, type, category, title, message, linkUrl = null, actorId = null }) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        category,
        title,
        message,
        link_url: linkUrl,
        actor_id: actorId
      })

    if (error) throw error
  } catch (err) {
    console.error('Error creating notification:', err)
  }
}

/**
 * Notify user of incoming friend request
 */
export async function notifyFriendRequest(recipientId, senderId, senderUsername) {
  await createNotification({
    userId: recipientId,
    type: 'friend_request_received',
    category: 'social',
    title: 'New friend request',
    message: `${senderUsername} wants to be your friend`,
    linkUrl: `/@${senderUsername}`,
    actorId: senderId
  })
}

/**
 * Notify user their friend request was accepted
 */
export async function notifyFriendRequestAccepted(originalSenderId, accepterId, accepterUsername) {
  await createNotification({
    userId: originalSenderId,
    type: 'friend_request_accepted',
    category: 'social',
    title: 'Friend request accepted',
    message: `${accepterUsername} accepted your friend request`,
    linkUrl: `/@${accepterUsername}`,
    actorId: accepterId
  })
}

/**
 * Notify user they earned a badge
 */
export async function notifyBadgeEarned(userId, badgeName) {
  await createNotification({
    userId,
    type: 'badge_earned',
    category: 'community',
    title: 'Badge earned',
    message: `You earned the ${badgeName} badge!`
  })
}

/**
 * Notify user they hit a kit milestone
 */
export async function notifyMilestoneReached(userId, milestoneCount) {
  await createNotification({
    userId,
    type: 'milestone_reached',
    category: 'community',
    title: 'Milestone reached',
    message: `Congratulations! You've added ${milestoneCount} kits to your collection`
  })
}

/**
 * Send welcome notification on signup
 */
export async function notifyWelcome(userId) {
  await createNotification({
    userId,
    type: 'welcome',
    category: 'system',
    title: 'Welcome to RecollectKits',
    message: 'Start building your kit collection today'
  })
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (error) throw error
  } catch (err) {
    console.error('Error marking notification as read:', err)
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(userId) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw error
  } catch (err) {
    console.error('Error marking all notifications as read:', err)
  }
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(userId) {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .is('read_at', null)

    if (error) throw error
    return count || 0
  } catch (err) {
    console.error('Error getting unread count:', err)
    return 0
  }
}

/**
 * Check if user qualifies for the "The First 100" badge and award it
 * Called after signup - checks total profile count
 */
export async function checkAndAwardFirst100Badge(userId) {
  try {
    // Count total profiles to see if this user is within the first 100
    const { count, error: countError } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    if (countError) throw countError
    if (count > 100) return // Not in the first 100

    // Find the "The First 100" badge
    const { data: badge, error: badgeError } = await supabase
      .from('badges')
      .select('id')
      .eq('name', 'The First 100')
      .single()

    if (badgeError || !badge) {
      // Badge doesn't exist in DB yet, skip silently
      console.log('First 100 badge not found in DB, skipping auto-award')
      return
    }

    // Check if already awarded
    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badge.id)
      .single()

    if (existing) return // Already has it

    // Award the badge
    const { error: insertError } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badge.id
      })

    if (insertError) throw insertError

    // Send notification
    await notifyBadgeEarned(userId, 'The First 100')
  } catch (err) {
    console.error('Error checking/awarding First 100 badge:', err)
  }
}

/**
 * Check kit count and send milestone notification if applicable
 */
const MILESTONES = [10, 25, 50, 100, 250, 500, 1000]

export async function checkAndNotifyMilestone(userId) {
  try {
    const { count, error } = await supabase
      .from('user_jerseys')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (error) throw error

    if (MILESTONES.includes(count)) {
      await notifyMilestoneReached(userId, count)
    }
  } catch (err) {
    console.error('Error checking milestone:', err)
  }
}
