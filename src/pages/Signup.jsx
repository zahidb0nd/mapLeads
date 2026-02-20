import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signup(formData.email, formData.password, formData.name)
      navigate('/dashboard')
    } catch {
      // error handled by hook
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

        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ background: 'rgba(19,17,28,0.9)', borderColor: '#2E2A45' }}
        >
          <h2 className="text-xl font-bold text-text-primary mb-6">Create your account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl border border-danger/30 bg-danger-subtle">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Name */}
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                icon={User}
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                autoComplete="name"
              />
            </div>

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
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  icon={Lock}
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  autoComplete="new-password"
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

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </Button>

            <p className="text-center text-xs text-text-muted">
              By creating an account you agree to our{' '}
              <a href="#" className="text-purple hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-purple hover:underline">Privacy Policy</a>
            </p>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-purple hover:text-purple-light font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
