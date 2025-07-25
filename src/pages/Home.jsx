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
      <div className="text-center py-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to RecollectKits
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          The ultimate platform for jersey collectors. Discover, collect, and connect with fellow enthusiasts.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to="/jerseys"
            className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors font-medium"
          >
            Browse Jerseys
          </Link>
          <Link
            to="/bounties"
            className="bg-yellow-500 text-white px-6 py-3 rounded-md hover:bg-yellow-600 transition-colors font-medium"
          >
            View Bounties
          </Link>
        </div>
      </div>

      {/* Featured Jerseys */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Jerseys</h2>
          <Link
            to="/jerseys"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            View all →
          </Link>
        </div>
        
        {jerseysLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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