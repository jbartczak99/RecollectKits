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
  ShieldCheckIcon,
  DocumentTextIcon,
  RectangleStackIcon,
  InformationCircleIcon,
  FolderIcon,
  ExclamationTriangleIcon,
  UserCircleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'
import './Navigation.css'

export default function Navigation() {
  const { user, profile, signOut } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [pendingDetailsCount, setPendingDetailsCount] = useState(0)

  // Fetch pending details count
  useEffect(() => {
    const fetchPendingCount = async () => {
      if (!user) {
        setPendingDetailsCount(0)
        return
      }

      try {
        const { count, error } = await supabase
          .from('user_jerseys')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('details_completed', false)

        if (!error) {
          setPendingDetailsCount(count || 0)
        }
      } catch (err) {
        console.error('Error fetching pending count:', err)
      }
    }

    fetchPendingCount()

    // Set up real-time subscription for user_jerseys changes
    if (user) {
      const channel = supabase
        .channel('user_jerseys_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_jerseys',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchPendingCount()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [user])

  
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Kits', href: '/jerseys', icon: RectangleStackIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
    { name: 'Collection', href: '/collection', icon: FolderIcon, protected: true },
    { name: 'Profile', href: profile?.username ? `/@${profile.username}` : '/collection', icon: UserCircleIcon, protected: true },
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
      if (userDropdownOpen && !event.target.closest('.user-dropdown') && !event.target.closest('.mobile-bottom-nav-item') && !event.target.closest('.mobile-account-popup-content')) {
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
            <img
              src="/logo.png"
              alt="RecollectKits"
              className="navbar-logo"
            />
          </Link>
          
          <div className="navbar-nav" style={{marginLeft: '2rem'}}>
            {navigation.map((item) => {
              if (item.protected && !user) return null
              const Icon = item.icon
              const showBadge = item.name === 'Collection' && pendingDetailsCount > 0
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`navbar-link ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                  {showBadge && (
                    <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full" style={{minWidth: '18px'}}>
                      {pendingDetailsCount}
                    </span>
                  )}
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
                    {profile?.is_public && (
                      <Link
                        to={`/@${profile.username}`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="user-dropdown-item"
                      >
                        <UserCircleIcon className="user-dropdown-icon" />
                        <span>View Public Profile</span>
                      </Link>
                    )}
                    <Link
                      to="/collection?settings=profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="user-dropdown-item"
                    >
                      <Cog6ToothIcon className="user-dropdown-icon" />
                      <span>Profile Settings</span>
                    </Link>
                    <Link
                      to="/my-submissions"
                      onClick={() => setUserDropdownOpen(false)}
                      className="user-dropdown-item"
                    >
                      <DocumentTextIcon className="user-dropdown-icon" />
                      <span>My Submissions</span>
                    </Link>
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

        {/* Mobile: Sign In button and Hamburger menu */}
        <div className="mobile-header-right">
          {!user && (
            <Link to="/auth" className="btn btn-primary btn-sm">
              Sign In
            </Link>
          )}
          <button
            className="mobile-menu-toggle-btn"
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

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="mobile-dropdown-menu">
          {navigation.map((item) => {
            if (item.protected && !user) return null
            const Icon = item.icon
            const showBadge = item.name === 'Collection' && pendingDetailsCount > 0
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-dropdown-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <Icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {showBadge && (
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium bg-amber-500 text-white rounded-full" style={{minWidth: '18px'}}>
                    {pendingDetailsCount}
                  </span>
                )}
              </Link>
            )
          })}

          {user && (
            <>
              <div className="mobile-dropdown-divider" />
              {profile?.is_public && (
                <Link
                  to={`/@${profile.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-dropdown-item"
                >
                  <UserCircleIcon className="h-5 w-5" />
                  View Public Profile
                </Link>
              )}
              <Link
                to="/collection?settings=profile"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-dropdown-item"
              >
                <Cog6ToothIcon className="h-5 w-5" />
                Profile Settings
              </Link>
              <Link
                to="/my-submissions"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-dropdown-item"
              >
                <DocumentTextIcon className="h-5 w-5" />
                My Submissions
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mobile-dropdown-item"
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="mobile-dropdown-item text-red-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  )
}