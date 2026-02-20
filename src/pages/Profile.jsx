import { useState } from 'react'
import { User, Lock, Save } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/toast'
import useStore from '@/stores/useStore'
import pb from '@/lib/pocketbase'

export default function Profile() {
  const { user, setUser } = useStore()
  const { success, error } = useToast()

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', password: '', passwordConfirm: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const handleProfileSave = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const updated = await pb.collection('users').update(user.id, {
        name: profileForm.name,
      })
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
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold">{user?.name || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Personal Info</CardTitle>
          <CardDescription>Update your display name</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profileForm.name}
                onChange={(e) => setProfileForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profileForm.email} disabled className="opacity-60" />
              <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <Button type="submit" disabled={savingProfile} className="w-full md:w-auto">
              <Save className="h-4 w-4 mr-2" />
              {savingProfile ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5" /> Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Current Password</Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(f => ({ ...f, oldPassword: e.target.value }))}
                placeholder="Current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm(f => ({ ...f, password: e.target.value }))}
                placeholder="New password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.passwordConfirm}
                onChange={(e) => setPasswordForm(f => ({ ...f, passwordConfirm: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
            <Button type="submit" disabled={savingPassword} className="w-full md:w-auto">
              <Lock className="h-4 w-4 mr-2" />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
