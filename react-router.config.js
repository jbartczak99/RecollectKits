/** @type {import('@react-router/dev/config').Config} */
export default {
  // Our app code lives in src/, not the default app/ directory.
  appDirectory: 'src',

  // Static deploy: no server runtime. `ssr: false` + `prerender` emits static
  // HTML for the listed public paths plus a SPA fallback for everything else.
  // Vercel serves it exactly like the current dist/ build — no Node server.
  ssr: false,

  // Pre-render ONLY the public marketing routes. Everything else
  // (/collection, /admin/*, /auth, …) is served by the SPA fallback and
  // client-renders behind auth.
  async prerender() {
    return [
      '/',
      '/jerseys',
      '/about',
      '/partners',
      '/pricing',
      '/privacy',
      '/terms',
    ]
  },
}
