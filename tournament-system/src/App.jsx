import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AnimatePresence } from 'framer-motion'

import { AuthProvider } from '@/hooks/useAuth'
import PublicLayout from '@/layouts/PublicLayout'
import AdminLayout from '@/layouts/AdminLayout'

import HomePage from '@/pages/public/HomePage'
import TournamentPage from '@/pages/public/TournamentPage'
import LoginPage from '@/pages/public/LoginPage'
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminTournamentManage from '@/pages/admin/AdminTournamentManage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/tournament/:id" element={<TournamentPage />} />
          </Route>

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes - protected inside AdminLayout */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/tournament/:id" element={<AdminTournamentManage />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 12, 28, 0.95)',
            border: '1px solid rgba(184, 69, 245, 0.2)',
            color: '#e8d8ff',
            backdropFilter: 'blur(12px)',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '14px',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: '#06d6f5', secondary: '#060611' },
          },
          error: {
            iconTheme: { primary: '#f87171', secondary: '#060611' },
          },
        }}
      />
    </AuthProvider>
  )
}
