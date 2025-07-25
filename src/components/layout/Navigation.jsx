import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { 
  Bars3Icon, 
  XMarkIcon,
  HomeIcon,
  UserIcon
} from '@heroicons/react/24/outline'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Jerseys', href: '/jerseys', icon: HomeIcon },
    { name: 'Collection', href: '/collection', icon: HomeIcon, protected: true },
    { name: 'Bounties', href: '/bounties', icon: HomeIcon },
    { name: 'Spots', href: '/spots', icon: HomeIcon },
  ]

  const handleSignOut = async () => {
    await signOut()
    setMobileMenuOpen(false)
  }

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
          
          <div className="navbar-nav">
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
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.user_metadata?.username || user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
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
                      {user.user_metadata?.username || user.email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="btn btn-secondary"
                  style={{width: '100%'}}
                >
                  Sign Out
                </button>
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