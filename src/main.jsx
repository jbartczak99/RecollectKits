import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Catch any uncaught JS errors and show them visibly
window.onerror = (msg, src, line, col, err) => {
  const el = document.getElementById('startup-error')
  if (el) el.innerHTML = `<strong>JS Error:</strong> ${msg}<br><small>${src}:${line}:${col}</small>`
  else document.body.insertAdjacentHTML('afterbegin',
    `<div style="background:#fee2e2;color:#991b1b;padding:16px;font-family:monospace;font-size:13px;position:fixed;top:0;left:0;right:0;z-index:99999" id="startup-error"><strong>JS Error:</strong> ${msg}<br><small>${src}:${line}:${col}</small></div>`)
}
window.onunhandledrejection = (e) => {
  const msg = e.reason?.message || e.reason || 'Unknown promise rejection'
  const el = document.getElementById('startup-error')
  if (el) el.innerHTML += `<br><strong>Promise Error:</strong> ${msg}`
  else document.body.insertAdjacentHTML('afterbegin',
    `<div style="background:#fee2e2;color:#991b1b;padding:16px;font-family:monospace;font-size:13px;position:fixed;top:0;left:0;right:0;z-index:99999" id="startup-error"><strong>Promise Error:</strong> ${msg}</div>`)
}

// React error boundary to catch render crashes
class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '24px', margin: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '14px' }}>
          <h2 style={{ margin: '0 0 8px' }}>App crashed</h2>
          <p>{this.state.error.message}</p>
          <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '8px' }}>{this.state.error.stack}</pre>
          <button onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{ marginTop: '12px', padding: '8px 16px', background: '#991b1b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Clear Storage & Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
