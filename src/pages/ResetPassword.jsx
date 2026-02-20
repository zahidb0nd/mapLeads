import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { confirmPasswordReset, isLoading, error } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const token = searchParams.get('token')

  useEffect(() => { if (!token) navigate('/login') }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    if (password.length < 8) { setValidationError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setValidationError('Passwords do not match'); return }
    try {
      await confirmPasswordReset(token, password)
      setSuccess(true)
    } catch { /* hook handles error */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md animate-slideUp">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center rounded-2xl mb-4"
            style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
            M
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">MapLeads</h1>
        </div>

        <div className="rounded-2xl border p-6 md:p-8" style={{ background: 'rgba(19,17,28,0.9)', borderColor: '#2E2A45' }}>
          {success ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#10B98115' }}>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <p className="font-bold text-text-primary text-lg">Password reset!</p>
                <p className="text-text-muted text-sm mt-1">Your password has been updated successfully.</p>
              </div>
              <Button fullWidth onClick={() => navigate('/login')}>Go to Login</Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">Set new password</h2>
              <p className="text-text-muted text-sm mb-6">Enter your new password below.</p>

              {(error || validationError) && (
                <div className="mb-4 p-3 rounded-xl border border-danger/30 bg-danger-subtle">
                  <p className="text-sm text-danger">{validationError || error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Input id="password" type={showPw ? 'text' : 'password'} icon={Lock}
                      placeholder="Min. 8 characters" value={password}
                      onChange={e => setPassword(e.target.value)} required className="pr-12" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary min-h-0 w-8 h-8">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <div className="relative">
                    <Input id="confirm" type={showConfirm ? 'text' : 'password'} icon={Lock}
                      placeholder="Confirm password" value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)} required className="pr-12" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary min-h-0 w-8 h-8">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" fullWidth disabled={isLoading}>
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Resetting...</>
                  ) : 'Reset Password'}
                </Button>
                <div className="text-center">
                  <Link to="/login" className="text-sm text-purple hover:text-purple-light transition-colors inline-flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />Back to login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
