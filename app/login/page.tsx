"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/firebase-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const { login, loginWithGoogle, user, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard")
    }
  }, [authLoading, user, router])

  const GoogleIcon = () => (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.44-1.62 4.2-5.4 4.2-3.24 0-5.88-2.67-5.88-6s2.64-6 5.88-6c1.85 0 3.09.78 3.8 1.44l2.59-2.5C16.66 3.56 14.5 2.7 12 2.7 6.84 2.7 2.7 6.84 2.7 12s4.14 9.3 9.3 9.3c5.37 0 8.93-3.78 8.93-9.12 0-.61-.07-1.07-.16-1.58H12Z" />
      <path fill="#4285F4" d="m12 10.2 8.93.02c.1.51.16.97.16 1.58 0 5.34-3.56 9.12-8.93 9.12-4.79 0-8.7-3.9-8.7-8.7S7.21 3.5 12 3.5c2.5 0 4.66.86 6.12 2.34l-2.59 2.5C14.29 7.6 13.05 6.9 12 6.9c-3.24 0-5.88 2.67-5.88 6s2.64 6 5.88 6c3.78 0 5.16-2.76 5.4-4.2H12Z" />
      <path fill="#FBBC05" d="M3.84 8.22 7.1 10.6C7.97 8.42 9.82 6.9 12 6.9c1.05 0 2.29.7 3.12 1.44l2.59-2.5C16.66 3.56 14.5 2.7 12 2.7 8.35 2.7 5.19 4.79 3.84 8.22Z" />
      <path fill="#34A853" d="M12 21.3c2.48 0 4.73-.84 6.35-2.28l-2.93-2.4c-.79.6-1.85.97-3.42.97-2.62 0-4.84-1.77-5.64-4.15l-3.26 2.4C4.11 18.95 7.78 21.3 12 21.3Z" />
    </svg>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      const errorCode = err.code
      let errorMessage = "Failed to log in"
      
      if (errorCode === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please check your credentials and try again."
      } else if (errorCode === "auth/user-not-found") {
        errorMessage = "No account found with this email. Please sign up first."
      } else if (errorCode === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again."
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address format."
      } else if (errorCode === "auth/user-disabled") {
        errorMessage = "This account has been disabled."
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage = "Too many failed login attempts. Please try again later."
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      const errorCode = err.code
      let errorMessage = "Failed to sign in with Google"

      if (errorCode === "auth/popup-blocked") {
        errorMessage = "Popup blocked. Please allow popups or use email/password."
      } else if (errorCode === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in popup closed before completing."
      } else if (errorCode === "auth/operation-not-allowed") {
        errorMessage = "Google sign-in is not enabled for this project."
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <Card className="w-full max-w-md glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
            <BookOpen className="h-6 w-6 text-blue-400" />
          </div>
          <CardTitle className="text-2xl text-balance text-white">Welcome Back</CardTitle>
          <CardDescription className="text-pretty text-gray-300">Sign in to continue your learning journey</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-300">{error}</div>}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-white">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs text-blue-400 hover:text-blue-300 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-white/20 bg-white/5 text-white hover:bg-white/10 flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
            >
              <GoogleIcon />
              {googleLoading ? "Redirecting..." : "Continue with Google"}
            </Button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link href="/signup" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
