import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { Navigate } from 'react-router-dom'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'

export default function AuthLayout() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Don't redirect immediately to allow error messages to show
  if (user && !loading) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full p-4 shadow-lg">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
            </svg>
          </div>
        </div>
        <h1 className="text-center text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          RecollectKits
        </h1>
        <p className="mt-3 text-center text-base text-gray-600 font-medium">
          The ultimate jersey collection platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {isLogin ? (
          <LoginForm onSuccess={() => {}} />
        ) : (
          <div className="space-y-6">
            {/* Alpha Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">
                    Alpha Testing Stage
                  </h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>
                      We're currently in alpha testing. New accounts require manual approval before access is granted.
                      After signing up, please allow 24-48 hours for review.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <RegisterForm onSuccess={() => {}} />
          </div>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="group text-green-600 hover:text-green-500 text-sm font-medium transition-all duration-200 hover:scale-105"
          >
            <span className="border-b border-transparent group-hover:border-green-500 transition-all duration-200">
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"
              }
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}