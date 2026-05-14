import { useState } from 'react'
import { LightBulbIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { supabase } from '../../lib/supabase'

const MAX_LEN = 2000

export default function DashboardFeedbackBox() {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)

  if (!user) return null

  const trimmed = content.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < 3
  const canSubmit = trimmed.length >= 3 && !submitting

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const { error: insertError } = await supabase
        .from('dashboard_insight_requests')
        .insert({ user_id: user.id, content: trimmed })
      if (insertError) throw insertError
      setSubmitted(true)
      setContent('')
    } catch (err) {
      console.error('Insight submit failed', err)
      setError(err.message || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="dashboard-feedback dashboard-feedback--success">
        <CheckCircleIcon className="dashboard-feedback__success-icon" />
        <p className="dashboard-feedback__success-title">Thanks for the idea</p>
        <p className="dashboard-feedback__success-text">
          We'll factor it in as we expand the dashboard.
        </p>
        <button
          type="button"
          className="dashboard-feedback__again"
          onClick={() => setSubmitted(false)}
        >
          Submit another
        </button>
      </div>
    )
  }

  return (
    <form className="dashboard-feedback" onSubmit={handleSubmit}>
      <div className="dashboard-feedback__header">
        <LightBulbIcon className="dashboard-feedback__icon" />
        <h3 className="dashboard-feedback__title">Shape the dashboard</h3>
      </div>
      <p className="dashboard-feedback__hint">
        What insights would you want to see from your collection?
      </p>
      <textarea
        className="dashboard-feedback__textarea"
        value={content}
        onChange={(e) => setContent(e.target.value.slice(0, MAX_LEN))}
        placeholder="e.g. average kit age, brand timeline, kits worn vs unworn…"
        rows={3}
        disabled={submitting}
      />
      <div className="dashboard-feedback__footer">
        <span className="dashboard-feedback__count">
          {trimmed.length} / {MAX_LEN}
        </span>
        <button
          type="submit"
          className="dashboard-feedback__submit"
          disabled={!canSubmit}
        >
          {submitting ? 'Sending…' : 'Send idea'}
        </button>
      </div>
      {tooShort && (
        <p className="dashboard-feedback__error">A few more words, please.</p>
      )}
      {error && <p className="dashboard-feedback__error">{error}</p>}
    </form>
  )
}
