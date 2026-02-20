import { useState } from 'react'
import { User, Lock, Save, Shield, Trash2, Eye, EyeOff, AlertTriangle, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import useStore from '@/stores/useStore'
import pb from '@/lib/pocketbase'
import { usePageTitle } from '@/hooks/usePageTitle'

function getInitials(name, email) {
  if (name) return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  if (email) return email[0].toUpperCase()
  return 'U'
}

function getPasswordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

const strengthLabels = ['', 'Weak', 'Fair', 'Strong', 'Very strong']
const strengthColors = ['', '#F43F5E', '#F59E0B', '#10B981', '#10B981']

function PasswordStrengthMeter({ password }) {
  const strength = getPasswordStrength(password)
  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{
              background: i < strength ? strengthColors[strength] : '#2E2A45',
            }}
          />
        ))}
      </div>
      {strength > 0 && (
        <p className="text-xs font-medium" style={{ color: strengthColors[strength] }}>
          {strengthLabels[strength]}
        </p>
      )}
    </div>
  )
}

export default function Profile() {
  const { user, setUser, stats, searchHistory, savedSearches } = useStore()
  const { success, error } = useToast()
  usePageTitle('Profile')

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', password: '', passwordConfirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDangerZone, setShowDangerZone] = useState(false)

  const searchesUsed = searchHistory.length
  const searchLimit = 5
  const usagePercent = Math.min((searchesUsed / searchLimit) * 100, 100)
  const isNearLimit = usagePercent >= 60
  const isAtLimit = usagePercent >= 100

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await pb.collection('users').update(user.id, { name: profileForm.name })
      setUser(updated)
      success('Profile updated', 'Your name has been saved.')
    } catch (err) {
      error('Update failed', err?.message || 'Could not update profile.')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (e) => {
    e.preventDefault()
    if (passwordForm.password !== passwordForm.passwordConfirm) {
      error('Passwords do not match', 'Please make sure both passwords are the same.')
      return
    }
    setSavingPassword(true)
    try {
      await pb.collection('users').update(user.id, {
        oldPassword: passwordForm.oldPassword,
        password: passwordForm.password,
        passwordConfirm: passwordForm.passwordConfirm,
      })
      setPasswordForm({ oldPassword: '', password: '', passwordConfirm: '' })
      success('Password changed', 'Your password has been updated.')
    } catch (err) {
      error('Password change failed', err?.message || 'Could not change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-slideUp">
      {/* Account Information */}
      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div
            className="rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #7C3AED, #5B21B6)' }}
          >
            {getInitials(user?.name, user?.email)}
          </div>
          <div>
            <p className="text-xl font-bold text-text-primary">{user?.name || 'No name set'}</p>
            <p className="text-text-muted text-sm">{user?.email}</p>
            <Badge variant="purple" className="mt-1">Free Plan</Badge>
          </div>
        </div>

        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-purple" />Account Information
        </h3>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Input
                id="email"
                value={profileForm.email}
                disabled
                className="opacity-60 pr-10"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" aria-hidden="true" />
            </div>
            <p className="text-xs text-text-muted mt-1">Email cannot be changed here.</p>
          </div>
          <Button type="submit" disabled={savingProfile}>
            <Save className="h-4 w-4" />
            {savingProfile ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-purple" />Change Password
        </h3>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <Label htmlFor="oldPassword">Current password</Label>
            <div className="relative">
              <Input
                id="oldPassword"
                type={showOld ? 'text' : 'password'}
                value={passwordForm.oldPassword}
                onChange={e => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                placeholder="Current password"
                className="pr-12"
              />
              <button type="button" onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary min-h-0 w-8 h-8">
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNew ? 'text' : 'password'}
                value={passwordForm.password}
                onChange={e => setPasswordForm(f => ({ ...f, password: e.target.value }))}
                placeholder="New password"
                className="pr-12"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary min-h-0 w-8 h-8">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrengthMeter password={passwordForm.password} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={passwordForm.passwordConfirm}
                onChange={e => setPasswordForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                placeholder="Confirm new password"
                className="pr-12"
                error={passwordForm.passwordConfirm && passwordForm.password !== passwordForm.passwordConfirm ? 'Passwords do not match' : undefined}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary min-h-0 w-8 h-8">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={savingPassword}>
            <Shield className="h-4 w-4" />
            {savingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>

      {/* Plan & Usage */}
      <Card>
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />Plan &amp; Usage
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-text-secondary text-sm">Current plan</span>
            <Badge variant="purple">Free</Badge>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-text-secondary text-sm">Searches this month</span>
              <span className={`text-sm font-semibold ${isAtLimit ? 'text-danger' : isNearLimit ? 'text-warning' : 'text-text-primary'}`}>
                {searchesUsed} of {searchLimit}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#2E2A45' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${usagePercent}%`,
                  background: isAtLimit ? '#F43F5E' : isNearLimit ? '#F59E0B' : '#7C3AED',
                }}
              />
            </div>
          </div>
          <Button fullWidth className="mt-2">
            <Zap className="h-4 w-4" />Upgrade to Pro — Unlimited Searches
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <div className="rounded-2xl border p-5 space-y-4" style={{ borderColor: '#F43F5E4D', background: '#F43F5E08' }}>
        <div>
          <h3 className="text-base font-semibold text-danger flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />Danger Zone
          </h3>
          <p className="text-xs text-text-muted mt-1">These actions are permanent and cannot be undone.</p>
        </div>

        {!showDangerZone ? (
          <Button variant="danger" onClick={() => setShowDangerZone(true)}>
            <Trash2 className="h-4 w-4" />Delete my account
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-text-secondary">
              Type <strong className="text-danger">DELETE</strong> to confirm account deletion.
            </p>
            <Input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="border-danger/50 focus:border-danger"
            />
            <div className="flex gap-3">
              <Button
                variant="danger"
                disabled={deleteConfirm !== 'DELETE'}
                onClick={() => alert('Account deletion not implemented in demo.')}
              >
                <Trash2 className="h-4 w-4" />Delete Account
              </Button>
              <Button variant="ghost" onClick={() => { setShowDangerZone(false); setDeleteConfirm('') }}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
