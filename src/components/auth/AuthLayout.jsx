import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthLayout() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
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
              {isLogin
                ? 'Sign in to manage your collection and connect with collectors.'
                : 'Create an account to start cataloging your kit collection.'
              }
            </p>
          </div>

          {/* Alpha Notice for Sign Up */}
          {!isLogin && (
            <div style={{
              marginBottom: '24px',
              backgroundColor: '#fffbeb',
              border: '1px solid #fcd34d',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <svg style={{ width: '20px', height: '20px', color: '#f59e0b', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p style={{ marginLeft: '8px', fontSize: '12px', color: '#92400e' }}>
                  <span style={{ fontWeight: '600' }}>Alpha Testing:</span> New accounts require approval. Please allow 24-48 hours for review.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          {isLogin ? (
            <LoginForm onSuccess={() => {}} />
          ) : (
            <RegisterForm onSuccess={() => {}} />
          )}

          {/* Toggle Link */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={{
                fontSize: '14px',
                color: '#059669',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
