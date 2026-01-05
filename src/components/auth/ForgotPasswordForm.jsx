import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { resetPassword } = useAuth()

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
    }

    setLoading(false)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#d1fae5',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <svg style={{ width: '24px', height: '24px', color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          Check Your Email
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '24px' }}>
          Didn't receive the email? Check your spam folder or try again.
        </p>
        <button
          onClick={onBack}
          style={{
            fontSize: '14px',
            color: '#059669',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Back to Sign In
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          <p style={{ fontSize: '14px', color: '#dc2626', margin: 0 }}>{error}</p>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
          placeholder="Email"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: loading ? '#9ca3af' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        {loading ? (
          <>
            <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Reset Link'
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{
          width: '100%',
          fontSize: '14px',
          color: '#059669',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        Back to Sign In
      </button>
    </form>
  )
}
