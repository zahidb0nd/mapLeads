import { useState } from 'react'
import pb from '@/lib/pocketbase'
import useStore from '@/stores/useStore'

export function useAuth() {
  const { user, isAuthenticated, setUser } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (email, password) => {
    setIsLoading(true)
    setError(null)
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record)
      return authData.record
    } catch (err) {
      const msg = err?.response?.message || err.message || 'Invalid email or password'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email, password, name) => {
    setIsLoading(true)
    setError(null)
    try {
      // Create user account
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
        emailVisibility: true
      })

      // Send email verification
      await pb.collection('users').requestVerification(email)

      // Auto login after signup
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record)

      return authData.record
    } catch (err) {
      const msg = err?.response?.message || err.message || 'Failed to create account'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const requestPasswordReset = async (email) => {
    setIsLoading(true)
    setError(null)
    try {
      await pb.collection('users').requestPasswordReset(email)
    } catch (err) {
      const msg = err?.response?.message || err.message || 'Failed to send reset email'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const confirmPasswordReset = async (token, password) => {
    setIsLoading(true)
    setError(null)
    try {
      await pb.collection('users').confirmPasswordReset(token, password, password)
    } catch (err) {
      const msg = err?.response?.message || err.message || 'Failed to reset password'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const confirmVerification = async (token) => {
    setIsLoading(true)
    setError(null)
    try {
      await pb.collection('users').confirmVerification(token)
    } catch (err) {
      const msg = err?.response?.message || err.message || 'Failed to verify email'
      setError(msg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    signup,
    logout,
    requestPasswordReset,
    confirmPasswordReset,
    confirmVerification,
  }
}
