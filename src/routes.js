import { index, layout, route } from '@react-router/dev/routes'

// Route config for React Router framework mode. Paths are relative to the
// app directory (src/, set in react-router.config.js).
//
// Structure mirrors the old App.jsx <Routes>: the root shell (Navigation,
// Footer, providers) lives in root.jsx; per-route container/gate wrappers are
// the layout() routes below. Only the routes listed in
// react-router.config.js's prerender() are emitted as static HTML; everything
// else is served by the SPA fallback and client-renders.
export default [
  // Public, crawlable pages — wrapped in the container layout.
  layout('components/layout/ContainerLayout.jsx', [
    index('pages/Home.jsx'),
    route('jerseys', 'pages/Jerseys.jsx'),
    route('jerseys/:id', 'components/jerseys/JerseyDetails.jsx'),
    route('players/:id', 'pages/PlayerProfile.jsx'),
    route('about', 'pages/About.jsx'),
    route('partners', 'pages/Partners.jsx'),
    route('pricing', 'pages/Pricing.jsx'),
    route('privacy', 'pages/Privacy.jsx'),
    route('terms', 'pages/Terms.jsx'),
    // Public collection detail view (container, CollectionLayout, no gate).
    route('collection/:collectionId', 'components/collections/CollectionDetailRoute.jsx'),
    // Public profile by username. Dynamic — not prerendered. Kept last so the
    // static siblings above win on exact matches.
    route(':username', 'pages/PublicProfile.jsx'),
  ]),

  // Auth pages render their own full-screen layout (no container wrapper).
  route('auth', 'components/auth/AuthLayout.jsx'),
  route('reset-password', 'pages/ResetPassword.jsx'),

  // Legacy redirect (no wrapper).
  route('admin/teams', 'components/layout/AdminTeamsRedirect.jsx'),

  // Authenticated app routes: container + approval gate + auth guard.
  layout('components/layout/AppGateLayout.jsx', [
    route('collection', 'components/collections/CollectionListRoute.jsx'),
    route('collection/bulk-upload', 'pages/BulkUpload.jsx'),
    route('admin', 'components/admin/AdminPanel.jsx'),
    route('admin/partner-applications', 'components/admin/PartnerApplications.jsx'),
    route('admin/clubs', 'components/admin/AdminClubs.jsx'),
    route('admin/kits', 'components/admin/AdminKits.jsx'),
    route('admin/players', 'components/admin/AdminPlayers.jsx'),
    route('admin/users', 'components/admin/AdminUsers.jsx'),
    route('my-submissions', 'pages/MySubmissions.jsx'),
  ]),

  // Auth required, approval NOT required.
  layout('components/layout/ProtectedLayout.jsx', [
    route('notifications', 'pages/Notifications.jsx'),
  ]),
]
