import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function ForgotPassword() {
  const { requestPasswordReset, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await requestPasswordReset(email)
      setSent(true)
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
            <CardTitle className="text-xl">Forgot your password?</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <div className="h-14 w-14 rounded-full bg-[#7C3AED]/10 flex items-center justify-center">
                    <Mail className="h-7 w-7 text-[#7C3AED]" />
                  </div>
                  <p className="text-center font-medium">Check your inbox!</p>
                  <p className="text-center text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>.
                    Check your spam folder if you don't see it.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setSent(false)}
                >
                  Send again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
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
