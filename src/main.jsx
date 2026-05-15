import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Catch any uncaught JS errors and show them visibly. Use DOM APIs so error
// content (which may contain HTML from page state) cannot inject markup.
function ensureErrorOverlay() {
  let el = document.getElementById('startup-error')
  if (el) return el
  el = document.createElement('div')
  el.id = 'startup-error'
  el.setAttribute(
    'style',
    'background:#fee2e2;color:#991b1b;padding:16px;font-family:monospace;font-size:13px;position:fixed;top:0;left:0;right:0;z-index:99999'
  )
  document.body.insertAdjacentElement('afterbegin', el)
  return el
}

function appendErrorLine(label, body) {
  const el = ensureErrorOverlay()
  if (el.childNodes.length > 0) el.appendChild(document.createElement('br'))
  const strong = document.createElement('strong')
  strong.textContent = `${label} `
  el.appendChild(strong)
  el.appendChild(document.createTextNode(String(body)))
}

window.onerror = (msg, src, line, col) => {
  appendErrorLine('JS Error:', msg)
  const small = document.createElement('small')
  small.textContent = `\n${src}:${line}:${col}`
  small.style.display = 'block'
  ensureErrorOverlay().appendChild(small)
}

window.onunhandledrejection = (e) => {
  const msg = e.reason?.message || e.reason || 'Unknown promise rejection'
  appendErrorLine('Promise Error:', msg)
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
