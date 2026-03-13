import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import ScrollToTop from './components/ScrollToTop'
import Navigation from './components/layout/Navigation'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/auth/ProtectedRoute'
import ApprovalGate from './components/auth/ApprovalGate'
import AuthLayout from './components/auth/AuthLayout'
import Home from './pages/Home'
import Jerseys from './pages/Jerseys'
import Collection from './pages/Collection'
import CollectionDetail from './pages/CollectionDetail'
import JerseyDetails from './components/jerseys/JerseyDetails'
import AdminPanel from './components/admin/AdminPanel'
import PartnerApplications from './components/admin/PartnerApplications'
import AdminTeams from './components/admin/AdminTeams'
import AdminKits from './components/admin/AdminKits'
import AdminPlayers from './components/admin/AdminPlayers'
import AdminUsers from './components/admin/AdminUsers'
import MySubmissions from './pages/MySubmissions'
import PublicProfile from './pages/PublicProfile'
import About from './pages/About'
import Partners from './pages/Partners'
import Pricing from './pages/Pricing'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import ResetPassword from './pages/ResetPassword'
import PlayerProfile from './pages/PlayerProfile'
import BulkUpload from './pages/BulkUpload'
import Notifications from './pages/Notifications'

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navigation />

          <main className="flex-1" style={{ backgroundColor: '#f5f5f5' }}>
            <Routes>
              <Route path="/" element={<div className="container py-8"><Home /></div>} />
              <Route path="/auth" element={<AuthLayout />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/jerseys" element={<div className="container py-8"><Jerseys /></div>} />
              <Route path="/jerseys/:id" element={<div className="container py-8"><JerseyDetails /></div>} />
              <Route path="/players/:id" element={<div className="container py-8"><PlayerProfile /></div>} />
              <Route path="/about" element={<div className="container py-8"><About /></div>} />
              <Route path="/partners" element={<div className="container py-8"><Partners /></div>} />
              <Route path="/pricing" element={<div className="container py-8"><Pricing /></div>} />
              <Route path="/privacy" element={<div className="container py-8"><Privacy /></div>} />
              <Route path="/terms" element={<div className="container py-8"><Terms /></div>} />
              <Route
                path="/collection"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <Collection />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/collection/:collectionId"
                element={
                  <div className="container py-8">
                    <CollectionDetail />
                  </div>
                }
              />
              <Route
                path="/admin"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <AdminPanel />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/admin/partner-applications"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <PartnerApplications />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/admin/teams"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <AdminTeams />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/admin/kits"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <AdminKits />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/admin/players"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <AdminPlayers />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <AdminUsers />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/my-submissions"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <MySubmissions />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/collection/bulk-upload"
                element={
                  <div className="container py-8">
                    <ApprovalGate>
                      <ProtectedRoute>
                        <BulkUpload />
                      </ProtectedRoute>
                    </ApprovalGate>
                  </div>
                }
              />
              <Route
                path="/notifications"
                element={
                  <div className="container py-8">
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  </div>
                }
              />
              <Route path="/:username" element={<div className="container py-8"><PublicProfile /></div>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
