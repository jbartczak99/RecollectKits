import { Navigate } from 'react-router-dom'

// Legacy redirect: /admin/teams -> /admin/clubs (preserves old App.jsx route).
export default function AdminTeamsRedirect() {
  return <Navigate to="/admin/clubs" replace />
}
