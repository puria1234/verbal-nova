"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Convex Auth handles OAuth callbacks automatically via middleware
// This page just redirects to dashboard
export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}
