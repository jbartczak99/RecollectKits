import { Outlet } from 'react-router-dom'
import ProtectedRoute from '../auth/ProtectedRoute'

// Wrapper for authenticated app routes: container + auth guard.
// The manual ApprovalGate was removed June 13, 2026 — access is gated at
// signup by invite codes (see add_invite_codes.sql), not post-signup review.
export default function AppGateLayout() {
  return (
    <div className="container py-8">
      <ProtectedRoute>
        <Outlet />
      </ProtectedRoute>
    </div>
  )
}
