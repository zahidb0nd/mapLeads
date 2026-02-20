import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [shaking, setShaking] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch {
      setShaking(true)
      setTimeout(() => setShaking(false), 400)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep p-4 md:p-6">
      <AnimatedBackground />

      <div className="w-full max-w-md animate-slideUp">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div
            className="flex items-center justify-center rounded-2xl mb-4"
            style={{
              width: 56, height: 56,
              background: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
              fontSize: 24, fontWeight: 800, color: '#fff',
            }}
          >
            M
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">MapLeads</h1>
          <p className="text-text-secondary text-sm mt-1">
            Find businesses with no website. Turn them into clients.
          </p>
        </div>

        {/* Card — full screen mobile, card on desktop */}
        <div
          className="md:rounded-2xl md:border md:shadow-card p-0 md:p-8"
          style={{ background: 'transparent' }}
        >
          <div
            className="rounded-2xl border md:border-0 md:rounded-none p-6 md:p-0"
            style={{ background: 'rgba(19,17,28,0.9)', borderColor: '#2E2A45' }}
          >
            <h2 className="text-xl font-bold text-text-primary mb-6">Welcome back</h2>

            {/* Error */}
            {error && (
              <div
                className={`mb-4 p-3 rounded-xl border border-danger/30 bg-danger-subtle ${shaking ? 'animate-shake' : ''}`}
              >
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password" className="mb-0">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-purple hover:text-purple-light transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors min-h-0 w-8 h-8"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
                className="mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Sign up link */}
              <p className="text-center text-sm text-text-secondary">
                Don't have an account?{' '}
                <Link to="/signup" className="text-purple hover:text-purple-light font-semibold transition-colors">
                  Sign up free
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
