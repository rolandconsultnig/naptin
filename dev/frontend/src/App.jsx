import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SocketProvider } from './contexts/SocketContext'
import { CallProvider } from './contexts/CallContext'
import { CallUI } from './components/CallUI'
import { LoginPage } from './pages/LoginPage'
import { ChatPage } from './pages/ChatPage'
import { AdminDashboard } from './pages/AdminDashboard'
import { MeetingRoom } from './pages/MeetingRoom'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/meeting/:code" element={<ProtectedRoute><MeetingRoom /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
            <Route path="/*" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
          </Routes>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#25d366',
                color: '#fff',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 9999,
              },
              success: {
                style: {
                  background: '#25d366',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#25d366',
                },
              },
              error: {
                style: {
                  background: '#dc2626',
                },
              },
            }}
            containerStyle={{
              zIndex: 9999,
            }}
          />
          <CallUI />
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-whatsapp-green">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

function AdminProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.is_admin) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Access Denied</p>
          <p className="text-gray-400">You don't have permission to access this page.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="mt-4 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
          >
            Go Back to Chat
          </button>
        </div>
      </div>
    )
  }

  return children
}

export default App
