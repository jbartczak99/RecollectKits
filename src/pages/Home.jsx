import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useJerseys, useRandomJersey } from '../hooks/useJerseys'
import JerseyCard from '../components/jerseys/JerseyCard'

export default function Home() {
  const { jerseys, loading: jerseysLoading } = useJerseys()
  const { jersey: randomJersey, loading: randomLoading } = useRandomJersey()
  const [imageState, setImageState] = useState(false) // false = front, true = back

  const featuredJerseys = jerseys.slice(0, 4)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="hero">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to RecollectKits™
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The ultimate platform for kit collectors. Discover, collect, and connect with fellow enthusiasts.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/jerseys"
            className="btn btn-amber btn-lg"
          >
            Browse Kits
          </Link>
          <Link
            to="/collection"
            className="btn btn-green btn-lg"
          >
            My Collection
          </Link>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <section>
        <div className="card" style={{background: 'linear-gradient(135deg, var(--accent-amber-50), var(--accent-green-50))', border: '2px solid var(--accent-amber-200)'}}>
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🚀 Alpha Stage!</h2>
            <p className="text-lg text-gray-700 mb-4">
              RecollectKits is now in alpha testing! Experience early features and help shape the ultimate platform for kit collectors.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="badge badge-green">Alpha Testing</span>
              <span className="badge badge-amber">Early Access</span>
              <span className="badge badge-purple">Coming 2025</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Stay tuned for features like kit tracking, community bounties, and collector spotting!
            </p>
            <div className="border-t border-gray-200 pt-6">
              <p className="text-base font-medium text-gray-800 mb-4">
                Follow us for updates and behind-the-scenes development:
              </p>
              <div className="flex justify-center gap-4">
                <a href="https://www.instagram.com/recollectkits/" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram">
                  <img src="/instagram-logo.png" alt="Instagram" style={{ width: '32px', height: '32px' }} />
                </a>
                <a href="https://www.tiktok.com/@recollectkits" target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok">
                  <img src="/tiktok-logo.png" alt="TikTok" style={{ width: '38px', height: '38px' }} />
                </a>
                <button className="btn btn-secondary" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </button>
                <button className="btn btn-secondary" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                X and YouTube coming soon!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Featured Kits */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">This Week's Featured Kits</h2>
          <p className="text-gray-600">Discover our weekly selection of standout kits from around the world</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Club Kit of the Week */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Club Kit</h3>
              </div>
              <span className="badge badge-amber">Weekly Pick</span>
            </div>
            
            {randomLoading ? (
              <div className="card animate-pulse">
                <div className="skeleton" style={{width: '100%', height: '12rem'}}></div>
                <div className="card-body space-y-3">
                  <div className="skeleton" style={{height: '1rem', width: '75%'}}></div>
                  <div className="skeleton" style={{height: '0.75rem', width: '50%'}}></div>
                </div>
              </div>
            ) : randomJersey ? (
              <div className="card card-equal-height border-2 border-red-200 flex flex-col">
                {/* Jersey Image */}
                {randomJersey.front_image_url || randomJersey.back_image_url ? (
                  <div className="h-40 overflow-hidden flex items-center justify-center bg-gray-50 relative mt-3">
                    <img
                      src={(
                        randomJersey.front_image_url && randomJersey.back_image_url
                          ? (imageState ? randomJersey.back_image_url : randomJersey.front_image_url)
                          : (randomJersey.front_image_url || randomJersey.back_image_url)
                      )}
                      alt={`${randomJersey.team_name} ${randomJersey.jersey_type} kit`}
                      className="max-w-full max-h-full object-contain transition-opacity duration-300"
                      style={{maxWidth: '200px', maxHeight: '200px'}}
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white relative mt-3">
                    <div className="text-lg font-bold">{randomJersey.team_name}</div>
                  </div>
                )}
                
                {/* Front | Back toggle - only show for jerseys with both images */}
                {randomJersey.front_image_url && randomJersey.back_image_url && (
                  <div className="px-4 py-0.5 text-center border-b border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <button
                        onClick={() => setImageState(false)}
                        className={`font-medium transition-colors duration-200 ${
                          !imageState 
                            ? 'text-blue-600' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Front
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => setImageState(true)}
                        className={`font-medium transition-colors duration-200 ${
                          imageState 
                            ? 'text-blue-600' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="card-body flex-1 flex flex-col pt-2 pb-3">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {randomJersey.team_name || 'Unknown Team'}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {randomJersey.player_name && (
                      <span className="font-medium">{randomJersey.player_name} • </span>
                    )}
                    {randomJersey.jersey_type || 'Jersey'}{randomJersey.season ? ` • ${randomJersey.season}` : ''}
                  </p>
                  <div className="mb-2">
                    <span className="badge badge-amber text-xs">⭐ Weekly</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {randomJersey.jersey_type && (
                        <span className="badge badge-blue text-xs">
                          {randomJersey.jersey_type}
                        </span>
                      )}
                      {randomJersey.manufacturer && (
                        <span className="badge badge-gray text-xs">
                          {randomJersey.manufacturer}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/jerseys"
                      className="btn btn-sm btn-primary"
                    >
                      View All Kits
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card card-equal-height border-2 border-red-200 flex flex-col">
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6" />
                    </svg>
                    <div className="text-sm">No kits available</div>
                  </div>
                </div>
                <div className="card-body flex-1 flex flex-col">
                  <h4 className="font-semibold text-gray-900 mb-1">No Kits Found</h4>
                  <p className="text-sm text-gray-600 mb-2">Add some jerseys to see them featured here!</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div></div>
                    <Link
                      to="/jerseys"
                      className="btn btn-sm btn-primary"
                    >
                      Add Kits
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* International Kit of the Week */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">International Kit</h3>
              </div>
              <span className="badge badge-blue">Coming Soon</span>
            </div>
            
            <div className="card card-equal-height border-2 border-blue-200 flex flex-col">
              <div className="h-32 bg-gradient-to-br from-blue-100 to-green-200 flex items-center justify-center text-blue-600 relative mt-3">
                <div className="text-center">
                  <svg className="mx-auto h-6 w-6 text-blue-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-semibold text-blue-700">Feature Coming Soon</div>
                </div>
              </div>
              
              <div className="card-body flex-1 flex flex-col pt-1 pb-4">
                <h4 className="font-semibold text-gray-900 mb-1">International Selection</h4>
                <p className="text-xs text-gray-600 mb-1">International jersey curation</p>
                <div className="mb-1">
                  <span className="badge badge-blue text-xs">🌍 In Development</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-1">
                    <span className="badge badge-gray text-xs">International</span>
                    <span className="badge badge-gray text-xs">Global</span>
                  </div>
                  <button className="btn btn-sm btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* User Voted Kit of the Week */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-md flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 11H7v8h2v-8zm8-2h-2v10h2V9zm-4-4h-2v14h2V5z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">User Voted</h3>
              </div>
              <span className="badge badge-purple">Coming Soon</span>
            </div>
            
            <div className="card card-equal-height border-2 border-purple-200 flex flex-col">
              <div className="h-32 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-purple-600 relative mt-3">
                <div className="text-center">
                  <svg className="mx-auto h-6 w-6 text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm font-semibold text-purple-700">Feature Coming Soon</div>
                </div>
              </div>
              
              <div className="card-body flex-1 flex flex-col pt-1 pb-4">
                <h4 className="font-semibold text-gray-900 mb-1">Community Voting</h4>
                <p className="text-xs text-gray-600 mb-1">Community-driven kit selection</p>
                <div className="mb-1">
                  <span className="badge badge-purple text-xs">🚧 In Development</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-wrap gap-1">
                    <span className="badge badge-gray text-xs">Voting</span>
                    <span className="badge badge-gray text-xs">Community</span>
                  </div>
                  <button className="btn btn-sm btn-secondary" disabled>
                    Coming Soon
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            to="/jerseys"
            className="btn btn-secondary btn-lg"
          >
            Browse All Kits
          </Link>
        </div>
      </section>

      {/* Featured Collections */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Collections</h2>
          <Link
            to="/collection"
            className="text-primary-600 font-medium"
            style={{textDecoration: 'none'}}
          >
            View all →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Mock Featured Collection 1 */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  MJ
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">Manchester Collection</h3>
                  <p className="text-sm text-gray-500">by @mikejones</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="aspect-square bg-gradient-to-br from-red-500 to-red-600 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  Man Utd
                </div>
                <div className="aspect-square bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  Man City
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-gray-500 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  +12
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="badge badge-green">15 Kits</span>
                  <span className="badge badge-purple">Vintage</span>
                </div>
                <button className="btn btn-sm btn-secondary">View Collection</button>
              </div>
            </div>
          </div>

          {/* Mock Featured Collection 2 */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-amber-500 to-accent-amber-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  SL
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">La Liga Legends</h3>
                  <p className="text-sm text-gray-500">by @soccerlover</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="aspect-square bg-gradient-to-br from-blue-600 to-red-500 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  Barcelona
                </div>
                <div className="aspect-square bg-gradient-to-br from-white to-gray-100 border-2 border-gray-300 rounded-md flex items-center justify-center text-gray-800 text-xs font-medium">
                  Real Madrid
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-gray-500 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  +8
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="badge badge-amber">11 Kits</span>
                  <span className="badge badge-blue">Classic</span>
                </div>
                <button className="btn btn-sm btn-secondary">View Collection</button>
              </div>
            </div>
          </div>

          {/* Mock Featured Collection 3 */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-accent-green-500 to-accent-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  KF
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">World Cup Heroes</h3>
                  <p className="text-sm text-gray-500">by @kitfanatic</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="aspect-square bg-gradient-to-br from-green-600 to-yellow-400 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  Brazil
                </div>
                <div className="aspect-square bg-gradient-to-br from-blue-600 to-white rounded-md flex items-center justify-center text-blue-800 text-xs font-medium">
                  Argentina
                </div>
                <div className="aspect-square bg-gradient-to-br from-gray-400 to-gray-500 rounded-md flex items-center justify-center text-white text-xs font-medium">
                  +20
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="badge badge-green">23 Kits</span>
                  <span className="badge badge-purple">International</span>
                </div>
                <button className="btn btn-sm btn-secondary">View Collection</button>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}