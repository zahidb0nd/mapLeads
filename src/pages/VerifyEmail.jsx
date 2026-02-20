import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import AnimatedBackground from '@/components/ui/AnimatedBackground'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { confirmVerification } = useAuth()
  const [status, setStatus] = useState('verifying') // verifying | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('No verification token found.'); return }
    confirmVerification(token)
      .then(() => setStatus('success'))
      .catch(err => { setStatus('error'); setErrorMsg(err?.response?.message || err.message || 'Verification failed.') })
  }, [token])

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

        <div className="rounded-2xl border p-8 flex flex-col items-center text-center gap-5"
          style={{ background: 'rgba(19,17,28,0.9)', borderColor: '#2E2A45' }}>
          {status === 'verifying' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#7C3AED15' }}>
                <Loader2 className="h-8 w-8 text-purple animate-spin" />
              </div>
              <div>
                <p className="font-bold text-text-primary text-lg">Verifying your email...</p>
                <p className="text-text-muted text-sm mt-1">Please wait a moment.</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#10B98115' }}>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <p className="font-bold text-text-primary text-lg">Email verified! 🎉</p>
                <p className="text-text-muted text-sm mt-1">Your account is now verified. You can start using MapLeads.</p>
              </div>
              <Button fullWidth onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#F43F5E15' }}>
                <XCircle className="h-8 w-8 text-danger" />
              </div>
              <div>
                <p className="font-bold text-text-primary text-lg">Verification Failed</p>
                <p className="text-text-muted text-sm mt-1">{errorMsg}</p>
              </div>
              <Button variant="secondary" fullWidth onClick={() => navigate('/login')}>Go to Login</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
