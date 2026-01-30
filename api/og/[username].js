import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const { username } = req.query

  if (!username) {
    return res.status(404).send('Not found')
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.redirect(302, `/@${username}`)
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    // Fetch public profile
    const { data: profileData } = await supabase
      .rpc('get_public_profile', { profile_username: username })

    if (!profileData || profileData.length === 0) {
      return res.redirect(302, `/@${username}`)
    }

    const profile = profileData[0]

    // Fetch stats
    const { data: statsData } = await supabase
      .rpc('get_public_profile_stats', { profile_user_id: profile.id })

    const stats = statsData?.[0] || { total_jerseys: 0, public_collections: 0, liked_jerseys: 0 }

    const title = `${profile.full_name || profile.username} (@${profile.username}) - RecollectKits`
    const description = profile.bio
      || `Check out ${profile.full_name || profile.username}'s football kit collection: ${stats.total_jerseys} kits, ${stats.public_collections} collections on RecollectKits.`
    const url = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/@${username}`

    // Return minimal HTML with OG tags that redirects to the SPA
    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="profile" />
  <meta property="og:site_name" content="RecollectKits" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta http-equiv="refresh" content="0;url=/@${escapeHtml(username)}" />
</head>
<body>
  <p>Redirecting to <a href="/@${escapeHtml(username)}">${escapeHtml(title)}</a></p>
</body>
</html>`)
  } catch (error) {
    console.error('OG tag generation error:', error)
    return res.redirect(302, `/@${username}`)
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
