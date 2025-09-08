import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth.jsx'
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

  if (user) {
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
          <RegisterForm onSuccess={() => {}} />
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