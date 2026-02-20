import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function ForgotPassword() {
  const { requestPasswordReset, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch { /* error shown via hook */ }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-deep p-4">
      <AnimatedBackground />
      <div className="w-full max-w-md animate-slideUp">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center rounded-2xl mb-4"
            style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', fontSize: 24, fontWeight: 800, color: '#fff' }}>
            M
          </div>
          <h1 className="text-2xl font-extrabold text-text-primary">MapLeads</h1>
        </div>

        <div className="rounded-2xl border p-6 md:p-8" style={{ background: 'rgba(19,17,28,0.9)', borderColor: '#2E2A45' }}>
          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#7C3AED15' }}>
                <Mail className="h-8 w-8 text-purple" />
              </div>
              <div>
                <p className="font-bold text-text-primary text-lg">Check your inbox!</p>
                <p className="text-text-muted text-sm mt-1">
                  We've sent a reset link to <strong className="text-text-secondary">{email}</strong>.
                  Check your spam folder if you don't see it.
                </p>
              </div>
              <Button variant="secondary" fullWidth onClick={() => setSent(false)}>Send again</Button>
              <Link to="/login" className="text-sm text-purple hover:text-purple-light transition-colors flex items-center gap-1">
                <ArrowLeft className="h-4 w-4" />Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-text-primary mb-1">Forgot your password?</h2>
              <p className="text-text-muted text-sm mb-6">Enter your email and we'll send you a reset link.</p>

              {error && (
                <div className="mb-4 p-3 rounded-xl border border-danger/30 bg-danger-subtle">
                  <p className="text-sm text-danger">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" icon={Mail} placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
                </div>
                <Button type="submit" fullWidth disabled={isLoading}>
                  {isLoading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                  ) : 'Send Reset Link'}
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
