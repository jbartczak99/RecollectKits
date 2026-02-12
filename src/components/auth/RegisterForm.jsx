import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import countries from '../../data/countries.js'

export default function RegisterForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [fullName, setFullName] = useState('')
  const [country, setCountry] = useState('')
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth()

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
    e.stopPropagation()

    setError('')

    if (!agreeToTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy to create an account')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const result = await signUp({ email, password, username, fullName, country })

      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess(true)
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
          Welcome to RecollectKits!
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
          Please check your email for the confirmation link.
        </p>
        <div style={{
          backgroundColor: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '6px',
          padding: '12px',
          textAlign: 'left'
        }}>
          <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
            <span style={{ fontWeight: '600' }}>Note:</span> Your account is now under review. Please allow 24-48 hours for approval.
          </p>
        </div>
      </div>
    )
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
          type="text"
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={inputStyle}
          placeholder="Full Name"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
          placeholder="Username"
        />
      </div>

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

      <div style={{ marginBottom: '16px' }}>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          style={inputStyle}
          placeholder="Password (min 6 characters)"
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <select
          id="country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          required
          style={{ ...inputStyle, color: country ? '#111827' : '#9ca3af', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%236b7280\' d=\'M6 8L1 3h10z\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          <option value="" disabled>Country</option>
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Terms Agreement Checkbox */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={agreeToTerms}
            onChange={(e) => setAgreeToTerms(e.target.checked)}
            required
            aria-required="true"
            style={{ marginTop: '2px', width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '12px', color: '#4b5563' }}>
            I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#059669', textDecoration: 'underline' }}
            >
              Terms of Service
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#059669', textDecoration: 'underline' }}
            >
              Privacy Policy
            </a>
          </span>
        </label>
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
            Creating account...
          </>
        ) : (
          'Sign Up'
        )}
      </button>
    </form>
  )
}
