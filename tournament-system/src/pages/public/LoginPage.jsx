import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { user, signIn, signUp, isAdmin } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/'} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) {
        toast.error(error.message || 'Login failed')
      } else {
        toast.success('Welcome back!')
        navigate('/')
      }
    } else {
      const { error } = await signUp(email, password, name)
      if (error) {
        toast.error(error.message || 'Sign up failed')
      } else {
        toast.success('Account created! Check your email to verify.')
      }
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-2xl w-full max-w-sm p-8"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-neon-purple/20 border border-neon-purple/30 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <h1 className="font-[Orbitron] font-black text-sm uppercase tracking-widest text-white/90">
              TourneyOS
            </h1>
            <p className="text-xs text-white/30">
              {mode === 'login' ? 'Sign in to continue' : 'Create account'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-6">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1.5 rounded-md text-xs font-[Orbitron] uppercase tracking-wider transition-all
                ${
                  mode === m
                    ? 'bg-neon-purple/20 text-neon-purple border border-neon-purple/25'
                    : 'text-white/40 hover:text-white/60'
                }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                  text-white/90 placeholder:text-white/25 focus:outline-none
                  focus:border-neon-purple/50 transition-all font-[Rajdhani]"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                text-white/90 placeholder:text-white/25 focus:outline-none
                focus:border-neon-purple/50 transition-all font-[Rajdhani]"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-lg text-sm bg-white/5 border border-white/10
                text-white/90 placeholder:text-white/25 focus:outline-none
                focus:border-neon-purple/50 transition-all font-[Rajdhani]"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <Button type="submit" variant="purple" disabled={loading} className="w-full mt-2">
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <p className="text-xs text-white/25 text-center mt-6">
          Admin access is granted via Supabase user metadata.
        </p>
      </motion.div>
    </div>
  )
}
