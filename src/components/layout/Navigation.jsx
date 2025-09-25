import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'
import {
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  UserIcon,
  ChevronDownIcon,
  CogIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import './Navigation.css'

export default function Navigation() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Kits', href: '/jerseys', icon: HomeIcon },
    { name: 'Collection', href: '/collection', icon: HomeIcon, protected: true },
  ]

  // Get admin status from profile
  const isAdmin = profile?.is_admin || false

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
    setUserDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest('.user-dropdown')) {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userDropdownOpen])

  const isActive = (href) => {
    return location.pathname === href
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="flex items-center">
          <Link to="/" className="navbar-brand">
            RecollectKits
          </Link>
          
          <div className="navbar-nav" style={{marginLeft: '2rem'}}>
            {navigation.map((item) => {
              if (item.protected && !user) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`navbar-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="navbar-user">
          {user ? (
            <div className="user-dropdown">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="dropdown-trigger"
              >
                <div className="user-avatar user-avatar-small">
                  {(user.user_metadata?.display_name || user.user_metadata?.username || user.email)?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm">
                  {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0]}
                </span>
                <ChevronDownIcon className={`dropdown-chevron ${userDropdownOpen ? 'open' : ''}`} />
              </button>

              {userDropdownOpen && (
                <div className="user-dropdown-menu">
                  {/* Profile Header */}
                  <div className="user-dropdown-header">
                    <div className="flex items-center gap-3">
                      <div className="user-avatar">
                        {(user.user_metadata?.display_name || user.user_metadata?.username || user.email)?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {user.user_metadata?.display_name || user.user_metadata?.username || user.email?.split('@')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="user-dropdown-item"
                      >
                        <ShieldCheckIcon className="user-dropdown-icon" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="user-dropdown-item"
                    >
                      <svg className="user-dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/auth"
              className="btn btn-primary"
            >
              Sign In
            </Link>
          )}
        </div>

        <div className="mobile-menu-toggle">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="space-y-1">
            {navigation.map((item) => {
              if (item.protected && !user) return null
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          
          <div className="p-4" style={{borderTop: '1px solid var(--gray-200)'}}>
            {user ? (
              <div>
                <div className="flex items-center mb-3">
                  <UserIcon className="h-8 w-8 text-gray-400" />
                  <div className="ml-3">
                    <div className="text-gray-800 font-medium">
                      {user.user_metadata?.display_name || user.user_metadata?.username || user.email}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ShieldCheckIcon className="h-4 w-4" />
                      Admin Portal
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="btn btn-secondary"
                    style={{width: '100%'}}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="btn btn-primary"
                style={{width: '100%'}}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}