import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const INTEREST_OPTIONS = [
  { value: 'collector', label: 'Collector' },
  { value: 'creator', label: 'Content Creator' },
  { value: 'shop', label: 'Shop / Retailer' },
  { value: 'club', label: 'Club / Organization' },
];

export default function WaitlistSignup() {
  const [stats, setStats] = useState([
    { number: '—', label: 'Kits Catalogued' },
    { number: '—', label: 'Leagues Covered' },
    { number: '—', label: 'Countries' },
  ]);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    interest: '',
  });
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [kitsResult, leaguesResult, countriesResult] = await Promise.all([
          supabase.from('public_jerseys').select('id', { count: 'exact', head: true }),
          supabase.from('public_jerseys').select('league').not('league', 'is', null),
          supabase.from('profiles').select('country').not('country', 'is', null),
        ]);

        const kitCount = kitsResult.count || 0;
        const uniqueLeagues = new Set((leaguesResult.data || []).map(j => j.league).filter(Boolean));
        const uniqueCountries = new Set((countriesResult.data || []).map(p => p.country).filter(Boolean));

        setStats([
          { number: kitCount.toLocaleString(), label: 'Kits Catalogued' },
          { number: uniqueLeagues.size.toLocaleString(), label: 'Leagues Covered' },
          { number: uniqueCountries.size.toLocaleString(), label: 'Countries' },
        ]);
      } catch (err) {
        console.error('Error fetching waitlist stats:', err);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server error. Please try again later.');
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setStatus('success');
      setFormData({ email: '', firstName: '', interest: '' });
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="card" style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 50%, #fffbeb 100%)',
        border: '2px solid #34d399',
        textAlign: 'center',
        padding: '3rem 2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, #34d399, #059669, #34d399)',
          backgroundSize: '200% 100%',
          animation: 'waitlistShimmer 2s linear infinite'
        }} />
        <div style={{ fontSize: '4rem', marginBottom: '1rem', animation: 'waitlistBounce 0.6s ease' }}>
          🎉
        </div>
        <h3 className="text-3xl font-bold" style={{ color: '#065f46', marginBottom: '0.75rem' }}>
          You're on the list!
        </h3>
        <p style={{ color: '#047857', fontSize: '1.125rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          Check your inbox for a confirmation email. We'll notify you the moment we launch!
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          background: '#d1fae5', padding: '0.5rem 1rem', borderRadius: '9999px',
          color: '#065f46', fontSize: '0.875rem', fontWeight: 600
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', animation: 'waitlistPulse 2s infinite' }} />
          Welcome aboard
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)',
      border: 'none',
      padding: 0,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background orbs */}
      <div style={{
        position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.3), transparent)',
        animation: 'waitlistFloat 6s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.2), transparent)',
        animation: 'waitlistFloat 8s ease-in-out infinite reverse'
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '60%', width: '120px', height: '120px',
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,211,153,0.15), transparent)',
        animation: 'waitlistFloat 7s ease-in-out infinite 1s'
      }} />

      {/* Top accent bar */}
      <div style={{
        height: '4px',
        background: 'linear-gradient(90deg, #fbbf24, #8b5cf6, #34d399, #fbbf24)',
        backgroundSize: '300% 100%',
        animation: 'waitlistShimmer 3s linear infinite'
      }} />

      <div style={{ padding: '3rem 2rem', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
            padding: '0.375rem 1rem', borderRadius: '9999px',
            color: '#fbbf24', fontSize: '0.8rem', fontWeight: 600,
            letterSpacing: '0.05em', textTransform: 'uppercase',
            marginBottom: '1.25rem'
          }}>
            <span style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#fbbf24', animation: 'waitlistPulse 2s infinite'
            }} />
            Now in Alpha
          </div>

          <h2 style={{
            fontSize: '2.25rem', fontWeight: 800, color: 'white',
            marginBottom: '0.75rem', lineHeight: 1.2
          }}>
            The Future of Kit Collecting<br />
            <span style={{
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Starts Here
            </span>
          </h2>

          <p style={{
            color: '#c4b5fd', fontSize: '1.1rem', maxWidth: '500px',
            margin: '0 auto', lineHeight: 1.6
          }}>
            Join thousands of collectors building the ultimate kit database.
            Be first in line when we officially launch.
          </p>
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: '2rem',
          marginBottom: '2.5rem', flexWrap: 'wrap'
        }}>
          {stats.map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24',
                lineHeight: 1
              }}>
                {stat.number}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#a5b4fc', marginTop: '0.25rem' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Form card */}
        <div style={{
          maxWidth: '440px', margin: '0 auto',
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '1rem', padding: '2rem'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="firstName" style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: '#e0e7ff', marginBottom: '0.375rem',
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Your first name"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.5rem', color: 'white',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="email" style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: '#e0e7ff', marginBottom: '0.375rem',
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.5rem', color: 'white',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="interest" style={{
                display: 'block', fontSize: '0.8rem', fontWeight: 600,
                color: '#e0e7ff', marginBottom: '0.375rem',
                textTransform: 'uppercase', letterSpacing: '0.04em'
              }}>
                I'm interested as a...
                <span style={{ color: '#818cf8', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}> (optional)</span>
              </label>
              <select
                id="interest"
                value={formData.interest}
                onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                style={{
                  width: '100%', padding: '0.75rem 1rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '0.5rem', color: formData.interest ? 'white' : '#9ca3af',
                  fontSize: '0.95rem', outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8b5cf6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255,255,255,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ background: '#1e1b4b' }}>Select an option</option>
                {INTEREST_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} style={{ background: '#1e1b4b', color: 'white' }}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {status === 'error' && (
              <div style={{
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', padding: '0.625rem 1rem', borderRadius: '0.5rem',
                fontSize: '0.875rem', marginBottom: '1rem'
              }}>
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: status === 'loading'
                  ? '#6b46c1'
                  : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: status === 'loading' ? '#e0e7ff' : '#1e1b4b',
                fontSize: '1.05rem',
                fontWeight: 700,
                border: 'none',
                borderRadius: '0.5rem',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: status === 'loading' ? 0.7 : 1,
                boxShadow: status === 'loading' ? 'none' : '0 4px 14px rgba(251,191,36,0.4)',
                letterSpacing: '0.01em'
              }}
              onMouseEnter={(e) => {
                if (status !== 'loading') {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(251,191,36,0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 14px rgba(251,191,36,0.4)';
              }}
            >
              {status === 'loading' ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white', borderRadius: '50%',
                    display: 'inline-block', animation: 'waitlistSpin 0.8s linear infinite'
                  }} />
                  Joining...
                </span>
              ) : (
                'Join the Waitlist'
              )}
            </button>
          </form>

          <p style={{
            textAlign: 'center', fontSize: '0.75rem', color: '#818cf8',
            marginTop: '1rem'
          }}>
            No spam, ever. Just launch updates.
          </p>
        </div>

        {/* Social links */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <p style={{ color: '#a5b4fc', fontSize: '0.85rem', marginBottom: '1rem' }}>
            Follow the journey
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
            <a
              href="https://www.instagram.com/recollectkits/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on Instagram"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img src="/instagram-logo.png" alt="Instagram" style={{ width: '22px', height: '22px' }} />
            </a>
            <a
              href="https://www.tiktok.com/@recollectkits"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow us on TikTok"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img src="/tiktok-logo.png" alt="TikTok" style={{ width: '24px', height: '24px' }} />
            </a>
            <a
              href="https://www.youtube.com/@recollectkits"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe on YouTube"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '44px', height: '44px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img src="/youtube-icon.png" alt="YouTube" style={{ width: '28px', height: '28px' }} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
