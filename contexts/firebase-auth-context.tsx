"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { doc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  deleteAccount: () => Promise<void>
  updateProfilePicture: (photoURL: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
  deleteAccount: async () => {},
  updateProfilePicture: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result?.user && isMounted) {
          setUser(result.user)
        }
      } catch (error) {
        console.error("Google sign-in redirect failed:", error)
      }
    }

    handleRedirectResult()

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) return
      setUser(user)
      setLoading(false)
    })
    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signup = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(result.user, { displayName: name })
  }

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error: any) {
      // Fall back to redirect flow when popups are blocked or unsupported (e.g., mobile browsers)
      if (
        error?.code === "auth/popup-blocked" ||
        error?.code === "auth/popup-closed-by-user" ||
        error?.code === "auth/operation-not-supported-in-this-environment"
      ) {
        await signInWithRedirect(auth, googleProvider)
        return
      }
      throw error
    }
  }

  const logout = async () => {
    await firebaseSignOut(auth)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const deleteAccount = async () => {
    if (!user) throw new Error("No user logged in")
    
    try {
      // Delete user data from Firestore
      const userId = user.uid
      
      // Delete progress data
      const progressRef = doc(db, "progress", userId)
      await deleteDoc(progressRef)
      
      // Delete any quiz results
      const quizResultsQuery = query(collection(db, "quizResults"), where("userId", "==", userId))
      const quizResultsSnapshot = await getDocs(quizResultsQuery)
      const deletePromises = quizResultsSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
      
      // Delete the user account
      await deleteUser(user)
    } catch (error) {
      console.error("Error deleting account:", error)
      throw error
    }
  }

  const updateProfilePicture = async (photoURL: string) => {
    if (!user) throw new Error("No user logged in")
    await updateProfile(user, { photoURL })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, resetPassword, deleteAccount, updateProfilePicture }}>
      {children}
    </AuthContext.Provider>
  )
}
