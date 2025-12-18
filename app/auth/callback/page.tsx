"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { account } from "@/lib/appwrite"

// Separate component to handle the search params logic
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const processingRef = useRef(false)

  useEffect(() => {
    const createSession = async () => {
      // Prevent double execution in strict mode
      if (processingRef.current) return

      const userId = searchParams.get("userId")
      const secret = searchParams.get("secret")

      if (!userId || !secret) {
        setError("Missing authentication parameters")
        setTimeout(() => router.replace("/login"), 2000)
        return
      }

      processingRef.current = true

      try {
        await account.createSession(userId, secret)
        
        // Fetch OAuth session to get provider access token
        try {
          const session = await account.getSession('current')
          
          // If this is a Google OAuth session, fetch profile photo
          if (session.provider === 'google' && session.providerAccessToken) {
            try {
              // Fetch user profile from Google
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
                }
              }
            } catch (profileError) {
              console.error('Failed to fetch Google profile:', profileError)
              // Continue anyway - profile photo is optional
            }
          }
        } catch (sessionError) {
          console.error('Failed to fetch session info:', sessionError)
          // Continue anyway - session info is optional
        }
        
        // Force a hard navigation to ensure auth state is picked up
        window.location.href = "/dashboard"
      } catch (err: any) {
        console.error("Failed to create session:", err)
        if (err.message?.includes('session is active')) {
          window.location.href = "/dashboard";
          return;
        }
        setError(err.message || "Failed to complete authentication")
        processingRef.current = false
        setTimeout(() => router.replace("/login"), 2000)
      }
    }

    createSession()
  }, [searchParams, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <div className="text-center">
        {error ? (
          <>
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-gray-400 text-sm">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="text-white">Completing sign in...</p>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
