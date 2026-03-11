// Common team primary colors + text colors
// Fallback generates a color from team name hash
const TEAM_COLORS = {
  // Premier League
  'arsenal': { bg: '#EF0107', text: '#FFF' },
  'aston villa': { bg: '#670E36', text: '#FFF' },
  'chelsea': { bg: '#034694', text: '#FFF' },
  'everton': { bg: '#003399', text: '#FFF' },
  'liverpool': { bg: '#C8102E', text: '#FFF' },
  'manchester city': { bg: '#6CABDD', text: '#1C2C5B' },
  'manchester united': { bg: '#DA291C', text: '#FFF' },
  'newcastle united': { bg: '#241F20', text: '#FFF' },
  'tottenham hotspur': { bg: '#132257', text: '#FFF' },
  'west ham united': { bg: '#7A263A', text: '#FFF' },
  'wolverhampton wanderers': { bg: '#FDB913', text: '#231F20' },
  'brighton': { bg: '#0057B8', text: '#FFF' },
  'crystal palace': { bg: '#1B458F', text: '#FFF' },
  'fulham': { bg: '#000000', text: '#FFF' },
  'bournemouth': { bg: '#DA291C', text: '#FFF' },
  'nottingham forest': { bg: '#DD0000', text: '#FFF' },
  'brentford': { bg: '#E30613', text: '#FFF' },
  'ipswich town': { bg: '#0033A0', text: '#FFF' },
  'leicester city': { bg: '#003090', text: '#FFF' },
  'southampton': { bg: '#D71920', text: '#FFF' },

  // La Liga
  'fc barcelona': { bg: '#A50044', text: '#FFF' },
  'futbol club barcelona': { bg: '#A50044', text: '#FFF' },
  'real madrid': { bg: '#FEBE10', text: '#00529F' },
  'atletico madrid': { bg: '#CB3524', text: '#FFF' },
  'athletic bilbao': { bg: '#EE2523', text: '#FFF' },
  'real sociedad': { bg: '#143C8B', text: '#FFF' },
  'villarreal': { bg: '#005DAA', text: '#FDE100' },
  'real betis': { bg: '#00954C', text: '#FFF' },
  'sevilla': { bg: '#D4002A', text: '#FFF' },
  'valencia': { bg: '#EE3524', text: '#FFF' },

  // Bundesliga
  'fc bayern munich': { bg: '#DC052D', text: '#FFF' },
  'fc bayern münchen': { bg: '#DC052D', text: '#FFF' },
  'bayern munich': { bg: '#DC052D', text: '#FFF' },
  'borussia dortmund': { bg: '#FDE100', text: '#000' },
  'bayer leverkusen': { bg: '#E32221', text: '#FFF' },
  'rb leipzig': { bg: '#DD0741', text: '#FFF' },
  'vfb stuttgart': { bg: '#E32219', text: '#FFF' },
  'eintracht frankfurt': { bg: '#000000', text: '#FFF' },
  'vfl wolfsburg': { bg: '#65B32E', text: '#FFF' },
  'borussia mönchengladbach': { bg: '#000000', text: '#FFF' },
  'sc freiburg': { bg: '#000000', text: '#FFF' },

  // Serie A
  'juventus': { bg: '#000000', text: '#FFF' },
  'ac milan': { bg: '#FB090B', text: '#000' },
  'inter milan': { bg: '#010E80', text: '#FFF' },
  'as roma': { bg: '#8E1F2F', text: '#F0BC42' },
  'ssc napoli': { bg: '#12A0D7', text: '#FFF' },
  'lazio': { bg: '#87D8F7', text: '#15366E' },
  'atalanta': { bg: '#1E71B8', text: '#000' },
  'fiorentina': { bg: '#482B85', text: '#FFF' },

  // Ligue 1
  'paris saint-germain': { bg: '#004170', text: '#FFF' },
  'olympique marseille': { bg: '#2FAEE0', text: '#FFF' },
  'olympique lyonnais': { bg: '#0044A9', text: '#FFF' },
  'as monaco': { bg: '#E7192A', text: '#FFF' },
  'losc lille': { bg: '#E31E24', text: '#FFF' },

  // Eredivisie
  'ajax': { bg: '#D2122E', text: '#FFF' },
  'psv': { bg: '#ED1C24', text: '#FFF' },
  'feyenoord': { bg: '#EE1C25', text: '#FFF' },

  // Liga Portugal
  'fc porto': { bg: '#003893', text: '#FFF' },
  'sl benfica': { bg: '#FF0000', text: '#FFF' },
  'sporting cp': { bg: '#008C45', text: '#FFF' },

  // Polish Ekstraklasa
  'lech poznań': { bg: '#0055A5', text: '#FFF' },
  'lech poznan': { bg: '#0055A5', text: '#FFF' },
  'legia warsaw': { bg: '#006A44', text: '#FFF' },
  'znicz pruszków': { bg: '#003DA5', text: '#FFF' },
  'znicz pruszkow': { bg: '#003DA5', text: '#FFF' },

  // National teams
  'poland': { bg: '#DC143C', text: '#FFF' },
  'poland men\'s national football team': { bg: '#DC143C', text: '#FFF' },
  'poland national under-21 football team': { bg: '#DC143C', text: '#FFF' },
  'england': { bg: '#FFFFFF', text: '#002366' },
  'england men\'s national football team': { bg: '#FFFFFF', text: '#002366' },
  'france': { bg: '#002395', text: '#FFF' },
  'france men\'s national football team': { bg: '#002395', text: '#FFF' },
  'germany': { bg: '#000000', text: '#FFF' },
  'germany men\'s national football team': { bg: '#000000', text: '#FFF' },
  'spain': { bg: '#AA151B', text: '#F1BF00' },
  'spain men\'s national football team': { bg: '#AA151B', text: '#F1BF00' },
  'brazil': { bg: '#009739', text: '#FEDD00' },
  'brazil men\'s national football team': { bg: '#009739', text: '#FEDD00' },
  'argentina': { bg: '#74ACDF', text: '#FFF' },
  'argentina men\'s national football team': { bg: '#74ACDF', text: '#FFF' },
  'italy': { bg: '#0066B3', text: '#FFF' },
  'italy men\'s national football team': { bg: '#0066B3', text: '#FFF' },
  'netherlands': { bg: '#FF6600', text: '#FFF' },
  'netherlands men\'s national football team': { bg: '#FF6600', text: '#FFF' },
  'portugal': { bg: '#006847', text: '#FFF' },
  'portugal men\'s national football team': { bg: '#006847', text: '#FFF' },
  'belgium': { bg: '#ED2939', text: '#FFF' },
  'croatia': { bg: '#FF0000', text: '#FFF' },
  'usa': { bg: '#002868', text: '#FFF' },
  'united states men\'s national soccer team': { bg: '#002868', text: '#FFF' },
  'mexico': { bg: '#006847', text: '#FFF' },
  'japan': { bg: '#002395', text: '#FFF' },
}

// Generate a deterministic color from a string
function hashColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const h = Math.abs(hash) % 360
  return { bg: `hsl(${h}, 55%, 45%)`, text: '#FFF' }
}

export function getTeamColor(teamName) {
  if (!teamName) return { bg: '#6B7280', text: '#FFF' }
  const key = teamName.toLowerCase().trim()
  return TEAM_COLORS[key] || hashColor(key)
}
