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
      setError(err.message || 'Failed to login')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email, password, name) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Create user
      const user = await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        name,
        emailVisibility: true
      })

      // Auto login after signup
      const authData = await pb.collection('users').authWithPassword(email, password)
      setUser(authData.record)
      
      return authData.record
    } catch (err) {
      setError(err.message || 'Failed to sign up')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      pb.authStore.clear()
      setUser(null)
    } catch (err) {
      setError(err.message || 'Failed to logout')
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
    logout
  }
}
