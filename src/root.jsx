import { useEffect } from 'react'
import { Links, Meta, Outlet, Scripts, isRouteErrorResponse, useRouteError } from 'react-router'
import { captureError } from './lib/sentry'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ScrollToTop from './components/ScrollToTop'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import { pageMeta } from './lib/seo'
import './index.css'

// Site-wide Organization structured data. Kept as a static <script> in <head>
// (not via a route meta export) so it survives React Router's "deepest route's
// meta replaces parent meta" behavior and appears on every prerendered page.
const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'RecollectKits',
  url: 'https://www.recollectkits.com/',
  logo: 'https://www.recollectkits.com/favicon.png',
  description: 'Catalog, organize, and showcase your football shirt collection.',
}

// Default meta for the SPA fallback and any route that doesn't export its own
// (the authenticated routes, which are noindex'd via robots.txt anyway).
export const meta = () =>
  pageMeta({
    title: 'RecollectKits — Catalog & Showcase Your Football Shirt Collection',
  })

// The HTML document. Static <head> tags migrated here from the old index.html.
export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.png" />
        <meta name="theme-color" content="#7C3AED" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RecollectKits" />
        <Meta />
        <Links />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }} />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

// Root route component: the app shell. Renders for every route (prerendered and
// SPA-fallback alike). Nothing here touches window/document during render —
// AuthProvider/Navigation/ScrollToTop only reach browser APIs inside effects.
export default function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1" style={{ backgroundColor: '#f5f5f5' }}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

// Shown while the client bundle hydrates a non-prerendered (SPA-fallback) route.
// Required by SPA mode (ssr: false) so the fallback HTML has a loading state.
export function HydrateFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  )
}

// Root error boundary. Rendered inside <Layout>, so it returns inner content
// only (no <html>). window/localStorage are only touched in the click handler.
export function ErrorBoundary() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error?.message || 'Unknown error'
  const stack = error?.stack

  useEffect(() => {
    if (error && !isRouteErrorResponse(error)) captureError(error)
  }, [error])

  return (
    <div
      style={{
        background: '#fee2e2',
        color: '#991b1b',
        padding: '24px',
        margin: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace',
        fontSize: '14px',
      }}
    >
      <h2 style={{ margin: '0 0 8px' }}>App crashed</h2>
      <p>{message}</p>
      {stack && (
        <pre style={{ fontSize: '12px', overflow: 'auto', marginTop: '8px' }}>{stack}</pre>
      )}
      <button
        onClick={() => {
          localStorage.clear()
          window.location.reload()
        }}
        style={{
          marginTop: '12px',
          padding: '8px 16px',
          background: '#991b1b',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Clear Storage &amp; Reload
      </button>
    </div>
  )
}
