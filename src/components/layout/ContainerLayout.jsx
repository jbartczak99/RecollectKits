import { Outlet } from 'react-router-dom'

// Public-page wrapper. Mirrors the old App.jsx per-route
// <div className="container py-8"> wrapper.
export default function ContainerLayout() {
  return (
    <div className="container py-8">
      <Outlet />
    </div>
  )
}
