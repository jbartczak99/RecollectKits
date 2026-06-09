import { Outlet } from 'react-router-dom'
import ApprovalGate from '../auth/ApprovalGate'
import ProtectedRoute from '../auth/ProtectedRoute'

// Wrapper for authenticated app routes: container + approval gate + auth guard.
// Mirrors the old App.jsx pattern:
//   <div className="container py-8"><ApprovalGate><ProtectedRoute>…
export default function AppGateLayout() {
  return (
    <div className="container py-8">
      <ApprovalGate>
        <ProtectedRoute>
          <Outlet />
        </ProtectedRoute>
      </ApprovalGate>
    </div>
  )
}
