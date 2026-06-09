import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

// Global uncaught-error overlay. Ported from the old main.jsx. This file is the
// CLIENT entry only — it never runs during the Node prerender, so touching
// window/document at module scope here is safe.
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
  const reason = e.reason?.message || e.reason || 'Unknown promise rejection'
  appendErrorLine('Promise Error:', reason)
}

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  )
})
