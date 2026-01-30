// Vercel Edge Middleware - detects social media crawlers for /@username routes
// and serves them OG-tagged HTML from the API endpoint

const BOT_USER_AGENTS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'LinkedInBot',
  'WhatsApp',
  'Slackbot',
  'TelegramBot',
  'Discordbot',
  'Pinterest',
  'Googlebot',
  'bingbot',
]

export const config = {
  matcher: '/@:username*',
}

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''

  // Check if the request is from a social media crawler
  const isBot = BOT_USER_AGENTS.some(bot =>
    userAgent.toLowerCase().includes(bot.toLowerCase())
  )

  if (isBot) {
    // Extract username from the path
    const url = new URL(request.url)
    const username = url.pathname.replace('/@', '')

    if (username) {
      // Rewrite to the OG API endpoint
      const ogUrl = new URL(`/api/og/${username}`, request.url)
      return Response.redirect(ogUrl.toString(), 302)
    }
  }

  // For regular users, let the SPA handle it
  return undefined
}
