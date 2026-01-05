import { useAuth } from '../../contexts/AuthContext.jsx'

export default function ApprovalGate({ children }) {
  const { user, profile, loading, signOut } = useAuth()

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signOut()
      window.location.href = '/auth'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking account status...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return children
  }

  // Allow admins through regardless of approval status
  if (profile?.is_admin) {
    return children
  }

  // Check approval status
  if (profile?.approval_status === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full p-4 shadow-lg">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Under Review</h2>
              <div className="mb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full">
                  <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Thanks for signing up! We're currently in alpha testing and all new accounts require manual approval.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">What happens next?</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>Our team will review your account within 24-48 hours</li>
                        <li>You'll receive an email notification once approved</li>
                        <li>After approval, you can access all platform features</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <p><strong>Account:</strong> {user.email}</p>
                  <p><strong>Status:</strong> <span className="text-amber-600 font-medium">Pending Review</span></p>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Check Status Again
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (profile?.approval_status === 'rejected') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full p-4 shadow-lg">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Not Approved</h2>
              <div className="mb-6">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Unfortunately, your account request was not approved for alpha access at this time.
                </p>

                {profile?.admin_notes && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-left">
                    <h4 className="font-medium text-red-800 mb-2">Admin Feedback:</h4>
                    <p className="text-red-700 text-sm">{profile.admin_notes}</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-sm text-gray-500">
                  <p><strong>Account:</strong> {user.email}</p>
                  <p><strong>Status:</strong> <span className="text-red-600 font-medium">Not Approved</span></p>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // User is approved or approval status is unknown (legacy users) - allow access
  return children
}