import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import ForgotPasswordForm from './ForgotPasswordForm'

export default function AuthLayout() {
  const [view, setView] = useState('login') // 'login' | 'register' | 'forgotPassword'
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #e5e7eb', borderTopColor: '#16a34a',
          animation: 'spin 0.8s linear infinite'
        }} />
      </div>
    )
  }

  if (user && !loading) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex items-center justify-center py-12 px-4" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="w-full" style={{ maxWidth: '420px' }}>
        {/* Card */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            padding: '32px'
          }}
        >
          {/* Brand */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              RecollectKits
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {view === 'login' && 'Sign in to manage your collection and connect with collectors.'}
              {view === 'register' && 'Create an account to start cataloging your kit collection.'}
              {view === 'forgotPassword' && 'Reset your password to regain access to your account.'}
            </p>
          </div>

          {/* Form */}
          {view === 'login' && (
            <LoginForm
              onSuccess={() => {}}
              onForgotPassword={() => setView('forgotPassword')}
            />
          )}
          {view === 'register' && (
            <RegisterForm onSuccess={() => {}} />
          )}
          {view === 'forgotPassword' && (
            <ForgotPasswordForm onBack={() => setView('login')} />
          )}

          {/* Toggle Link */}
          {view !== 'forgotPassword' && (
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <button
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                style={{
                  fontSize: '14px',
                  color: '#059669',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                {view === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
