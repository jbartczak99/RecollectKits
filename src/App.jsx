import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import Navigation from './components/layout/Navigation'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AuthLayout from './components/auth/AuthLayout'
import Home from './pages/Home'
import Jerseys from './pages/Jerseys'
import Collection from './pages/Collection'
import JerseyDetails from './components/jerseys/JerseyDetails'
import AdminPanel from './components/admin/AdminPanel'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Navigation />
          
          <main className="container py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<AuthLayout />} />
              <Route path="/jerseys" element={<Jerseys />} />
              <Route path="/jerseys/:id" element={<JerseyDetails />} />
              <Route
                path="/collection"
                element={
                  <ProtectedRoute>
                    <Collection />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
