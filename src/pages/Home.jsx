import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useJerseys } from '../hooks/useJerseys'
import { useBounties } from '../hooks/useBounties'
import { useSpots } from '../hooks/useSpots'
import JerseyCard from '../components/jerseys/JerseyCard'
import BountyCard from '../components/bounties/BountyCard'
import SpotCard from '../components/spots/SpotCard'

export default function Home() {
  const { jerseys, loading: jerseysLoading } = useJerseys()
  const { bounties, loading: bountiesLoading } = useBounties()
  const { spots, loading: spotsLoading } = useSpots()

  const featuredJerseys = jerseys.slice(0, 4)
  const activeBounties = bounties.slice(0, 3)
  const recentSpots = spots.slice(0, 3)

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="hero">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to RecollectKits
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
            to="/bounties"
            className="btn btn-primary btn-lg"
          >
            View Bounties
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">🚧 Coming Soon!</h2>
            <p className="text-lg text-gray-700 mb-4">
              RecollectKits is currently in development. We're building the ultimate platform for kit collectors.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="badge badge-amber">In Development</span>
              <span className="badge badge-green">Beta Testing</span>
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
                <button className="btn btn-secondary" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.042-3.441.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.888-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.357-.631-2.751-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                  </svg>
                  Instagram
                </button>
                <button className="btn btn-secondary" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  X (Twitter)
                </button>
                <button className="btn btn-secondary" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-4.59v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 112.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005.76 20.5a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-4.4a4.85 4.85 0 01-1.8-.5z"/>
                  </svg>
                  TikTok
                </button>
                <button className="btn btn-secondary" disabled>
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                  YouTube
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Social accounts coming soon!
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
            
            {jerseysLoading ? (
              <div className="card animate-pulse">
                <div className="skeleton" style={{width: '100%', height: '12rem'}}></div>
                <div className="card-body space-y-3">
                  <div className="skeleton" style={{height: '1rem', width: '75%'}}></div>
                  <div className="skeleton" style={{height: '0.75rem', width: '50%'}}></div>
                </div>
              </div>
            ) : (
              <div className="card card-equal-height border-2 border-red-200 flex flex-col">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-xl">
                    Manchester United
                  </div>
                  <div className="absolute top-2 left-2 bg-amber-500 text-white px-2 py-1 rounded text-xs font-medium">
                    ⭐ Pick
                  </div>
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-800">
                    2023/24
                  </div>
                </div>
                <div className="card-body flex-1 flex flex-col">
                  <h4 className="font-semibold text-gray-900 mb-1">Home Kit</h4>
                  <p className="text-sm text-gray-600 mb-2">Classic red with devil details</p>
                  <div className="flex items-center gap-2 mb-3" style={{minHeight: '24px'}}>
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm text-gray-600">Editor's Choice</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-1">
                      <span className="badge badge-red">Premier League</span>
                    </div>
                    <button className="btn btn-sm btn-primary">View Details</button>
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
              <span className="badge badge-green">Randomly Selected</span>
            </div>
            
            {jerseysLoading ? (
              <div className="card animate-pulse">
                <div className="skeleton" style={{width: '100%', height: '12rem'}}></div>
                <div className="card-body space-y-3">
                  <div className="skeleton" style={{height: '1rem', width: '75%'}}></div>
                  <div className="skeleton" style={{height: '0.75rem', width: '50%'}}></div>
                </div>
              </div>
            ) : (
              <div className="card card-equal-height border-2 border-green-200 flex flex-col">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-green-600 to-yellow-400 flex items-center justify-center text-white font-bold text-xl">
                    Brazil
                  </div>
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                    🎲 Random
                  </div>
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-800">
                    2024
                  </div>
                </div>
                <div className="card-body flex-1 flex flex-col">
                  <h4 className="font-semibold text-gray-900 mb-1">Home Kit</h4>
                  <p className="text-sm text-gray-600 mb-2">Iconic yellow with green accents</p>
                  <div className="flex items-center gap-2 mb-3" style={{minHeight: '24px'}}>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="text-sm text-gray-600">Weekly Selection</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-1">
                      <span className="badge badge-green">Copa America</span>
                    </div>
                    <button className="btn btn-sm btn-primary">View Details</button>
                  </div>
                </div>
              </div>
            )}
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
              <span className="badge badge-purple">Most Votes</span>
            </div>
            
            {jerseysLoading ? (
              <div className="card animate-pulse">
                <div className="skeleton" style={{width: '100%', height: '12rem'}}></div>
                <div className="card-body space-y-3">
                  <div className="skeleton" style={{height: '1rem', width: '75%'}}></div>
                  <div className="skeleton" style={{height: '0.75rem', width: '50%'}}></div>
                </div>
              </div>
            ) : (
              <div className="card card-equal-height border-2 border-primary-200 flex flex-col">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-blue-600 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                    FC Barcelona
                  </div>
                  <div className="absolute top-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs font-medium">
                    🏆 Winner
                  </div>
                  <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium text-gray-800">
                    2023/24
                  </div>
                </div>
                <div className="card-body flex-1 flex flex-col">
                  <h4 className="font-semibold text-gray-900 mb-1">Home Kit</h4>
                  <p className="text-sm text-gray-600 mb-2">Classic blaugrana stripes</p>
                  <div className="flex items-center gap-2 mb-3" style={{minHeight: '24px'}}>
                    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span className="text-sm text-gray-600">1,247 votes</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex gap-1">
                      <span className="badge badge-blue">La Liga</span>
                    </div>
                    <button className="btn btn-sm btn-primary">View Details</button>
                  </div>
                </div>
              </div>
            )}
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

      {/* Active Bounties */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Active Bounties</h2>
          <Link
            to="/bounties"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        </div>
        
        {bountiesLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : activeBounties.length > 0 ? (
          <div className="space-y-4">
            {activeBounties.map((bounty) => (
              <BountyCard key={bounty.id} bounty={bounty} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No active bounties at the moment.
          </div>
        )}
      </section>

      {/* Recent Spots */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Spots</h2>
          <Link
            to="/spots"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        </div>
        
        {spotsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="p-4 space-y-4">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentSpots.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentSpots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No kit spots reported yet.
          </div>
        )}
      </section>
    </div>
  )
}