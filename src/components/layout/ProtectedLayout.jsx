import { Outlet } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'

// Wrapper for routes that require auth but NOT approval (e.g. /notifications).
// Mirrors the old App.jsx <div className="container py-8"><ProtectedRoute>…
export default function ProtectedLayout() {
  return (
    <div className="container py-8">
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    </div>
  )
}
