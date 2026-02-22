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
      console.error('Login error:', err)
      let msg = 'Something went wrong while processing your request.'
      
      if (err?.status === 400) {
        msg = 'Invalid email or password. Please check your credentials and try again.'
      } else if (err?.status === 429) {
        msg = 'Too many attempts. Please wait a moment and try again.'
      } else if (err?.response?.message) {
        msg = err.response.message
      } else if (err?.message && !err.message.includes('fetch')) {
        msg = err.message
      }
      
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
      try {
        await pb.collection('users').requestVerification(email)
      } catch (verifyErr) {
        console.warn('Email verification request failed:', verifyErr)
        // Continue even if verification email fails
      }

      // Auto login after signup
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record)

      return authData.record
    } catch (err) {
      console.error('Signup error:', err)
      let msg = 'Something went wrong while processing your request.'
      
      if (err?.status === 400) {
        if (err?.response?.data?.email) {
          msg = 'This email is already registered. Please sign in instead.'
        } else if (err?.response?.data?.password) {
          msg = 'Password does not meet requirements. Please use at least 8 characters.'
        } else {
          msg = err?.response?.message || 'Invalid signup information. Please check your details.'
        }
      } else if (err?.response?.message) {
        msg = err.response.message
      } else if (err?.message && !err.message.includes('fetch')) {
        msg = err.message
      }
      
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
      console.error('Password reset request error:', err)
      let msg = 'Something went wrong while processing your request.'
      
      if (err?.status === 404) {
        // Don't reveal if email exists for security
        msg = 'If an account exists with this email, you will receive a password reset link.'
      } else if (err?.response?.message) {
        msg = err.response.message
      } else if (err?.message && !err.message.includes('fetch')) {
        msg = err.message
      }
      
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
      console.error('Password reset confirmation error:', err)
      let msg = 'Something went wrong while processing your request.'
      
      if (err?.status === 400) {
        msg = 'Invalid or expired reset link. Please request a new password reset.'
      } else if (err?.response?.message) {
        msg = err.response.message
      } else if (err?.message && !err.message.includes('fetch')) {
        msg = err.message
      }
      
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
      console.error('Email verification error:', err)
      let msg = 'Something went wrong while processing your request.'
      
      if (err?.status === 400) {
        msg = 'Invalid or expired verification link. Please request a new verification email.'
      } else if (err?.response?.message) {
        msg = err.response.message
      } else if (err?.message && !err.message.includes('fetch')) {
        msg = err.message
      }
      
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
