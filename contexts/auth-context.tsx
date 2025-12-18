"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { account, ID, OAuthProvider } from "@/lib/appwrite"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshProfilePhoto: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  refreshProfilePhoto: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const currentUser = await account.get()
      setUser(currentUser as User)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password)
      await checkUser()
    } catch (error: any) {
      // If session already exists, just check user
      if (error.message?.includes('session is active')) {
        await checkUser()
      } else {
        throw error
      }
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    await account.create(ID.unique(), email, password, name)
    await login(email, password)
  }

  const loginWithGoogle = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : ""
    account.createOAuth2Token(OAuthProvider.Google, `${origin}/auth/callback`, `${origin}/login`)
  }

  const logout = async () => {
    await account.deleteSession("current")
    setUser(null)
  }

  const refreshProfilePhoto = async () => {
    try {
      const session = await account.getSession('current')
      
      // Check if access token is still valid (not expired or about to expire in next 5 minutes)
      const tokenExpiry = new Date(session.providerAccessTokenExpiry)
      const now = new Date()
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
      
      // If token is expired or about to expire, refresh the session
      if (tokenExpiry < fiveMinutesFromNow) {
        await account.updateSession('current')
        // Get updated session
        const updatedSession = await account.getSession('current')
        session.providerAccessToken = updatedSession.providerAccessToken
      }
      
      // If this is a Google OAuth session, fetch profile photo
      if (session.provider === 'google' && session.providerAccessToken) {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${session.providerAccessToken}`,
          },
        })
        
        if (response.ok) {
          const profile = await response.json()
          
          // Store profile photo in user preferences
          if (profile.picture) {
            await account.updatePrefs({
              picture: profile.picture,
              google_profile: profile,
            })
            // Refresh user state
            await checkUser()
          }
        }
      }
    } catch (error) {
      console.error('Failed to refresh profile photo:', error)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, refreshProfilePhoto }}>{children}</AuthContext.Provider>
}
