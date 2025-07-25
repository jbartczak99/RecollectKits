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
          The ultimate platform for jersey collectors. Discover, collect, and connect with fellow enthusiasts.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/jerseys"
            className="btn btn-amber btn-lg"
          >
            Browse Jerseys
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
              RecollectKits is currently in development. We're building the ultimate platform for jersey collectors.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <span className="badge badge-amber">In Development</span>
              <span className="badge badge-green">Beta Testing</span>
              <span className="badge badge-purple">Coming 2025</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Stay tuned for features like jersey tracking, community bounties, and collector spotting!
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
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Social accounts coming soon!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jerseys */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Jerseys</h2>
          <Link
            to="/jerseys"
            className="text-primary-600 font-medium"
            style={{textDecoration: 'none'}}
          >
            View all →
          </Link>
        </div>
        
        {jerseysLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="skeleton" style={{width: '100%', height: '12rem'}}></div>
                <div className="card-body space-y-3">
                  <div className="skeleton" style={{height: '1rem', width: '75%'}}></div>
                  <div className="skeleton" style={{height: '0.75rem', width: '50%'}}></div>
                </div>
              </div>
            ))}
          </div>
        ) : featuredJerseys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredJerseys.map((jersey) => (
              <JerseyCard key={jersey.id} jersey={jersey} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No jerseys available yet.
          </div>
        )}
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
            No jersey spots reported yet.
          </div>
        )}
      </section>
    </div>
  )
}