import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { confirmVerification } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token found.')
      return
    }

    confirmVerification(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error')
        setErrorMsg(err?.response?.message || err.message || 'Verification failed.')
      })
  }, [token])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <MapPin className="h-10 w-10 text-[#7C3AED]" />
          <span className="ml-2 text-3xl font-bold text-[#7C3AED]">MapLeads</span>
        </div>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-xl">Email Verification</CardTitle>
            <CardDescription>Verifying your email address...</CardDescription>
          </CardHeader>
          <CardContent>
            {status === 'verifying' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <Loader2 className="h-10 w-10 text-[#7C3AED] animate-spin" />
                <p className="text-muted-foreground">Verifying your email...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-7 w-7 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">Email Verified! 🎉</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your account is now verified. You can start using MapLeads.
                  </p>
                </div>
                <Button
                  className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
                  onClick={() => navigate('/dashboard')}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="h-7 w-7 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-lg">Verification Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{errorMsg}</p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Go to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
