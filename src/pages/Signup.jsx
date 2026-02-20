import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Eye, EyeOff, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function Signup() {
  const navigate = useNavigate()
  const { signup, isLoading, error } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    try {
      await signup(formData.email, formData.password, formData.name)
      setRegisteredEmail(formData.email)
      setVerificationSent(true)
    } catch {
      // error handled by hook
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Email verification notice screen
  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-center mb-8">
            <MapPin className="h-10 w-10 text-[#7C3AED]" />
            <span className="ml-2 text-3xl font-bold text-[#7C3AED]">MapLeads</span>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-6 space-y-4">
                <div className="h-16 w-16 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-[#7C3AED]" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-bold">Verify your email</h2>
                  <p className="text-muted-foreground text-sm">
                    We sent a verification link to
                  </p>
                  <p className="font-semibold text-foreground">{registeredEmail}</p>
                  <p className="text-muted-foreground text-sm mt-2">
                    Click the link in the email to activate your account.
                    Check your spam folder if you don't see it.
                  </p>
                </div>

                <div className="w-full space-y-2 pt-2">
                  <Button
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                    onClick={() => navigate('/dashboard')}
                  >
                    Continue to Dashboard
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    You can verify your email later from your profile settings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <MapPin className="h-10 w-10 text-[#7C3AED]" />
          <span className="ml-2 text-3xl font-bold text-[#7C3AED]">MapLeads</span>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Start finding local business leads today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Error */}
              {(error || validationError) && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                  <p className="text-sm text-red-400">{validationError || error}</p>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">At least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>

              {/* Login link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-[#7C3AED] hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
