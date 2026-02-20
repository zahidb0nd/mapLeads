import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { confirmPasswordReset, isLoading, error } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters')
      return
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }

    try {
      await confirmPasswordReset(token, password)
      setSuccess(true)
    } catch {
      // error shown via hook
    }
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
            <CardTitle className="text-xl">Set new password</CardTitle>
            <CardDescription>
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-green-500" />
                  </div>
                  <p className="text-center font-medium">Password reset!</p>
                  <p className="text-center text-sm text-muted-foreground">
                    Your password has been updated successfully.
                  </p>
                </div>
                <Button
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {(error || validationError) && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                    <p className="text-sm text-red-400">{validationError || error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-[#7C3AED] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
