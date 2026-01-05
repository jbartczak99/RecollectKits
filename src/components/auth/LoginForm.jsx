import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'

export default function LoginForm({ onSuccess, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn } = useAuth()

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

    const result = await signIn(email, password)

    if (result.error) {
      if (result.error.message === 'Email not confirmed') {
        const customMessage = 'Your account is still under review. Please allow 24-48 hours for approval. You will receive an email notification once your account is approved.'
        alert(customMessage)
        setError(customMessage)
      } else {
        setError(result.error.message)
      }
      setLoading(false)
    } else {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div style={{ marginBottom: '8px' }}>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
          placeholder="Password"
        />
      </div>

      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <button
          type="button"
          onClick={onForgotPassword}
          style={{
            fontSize: '13px',
            color: '#059669',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Forgot Password?
        </button>
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
          gap: '8px'
        }}
      >
        {loading ? (
          <>
            <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24">
              <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </button>
    </form>
  )
}
