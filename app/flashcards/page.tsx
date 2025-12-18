"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { databases, DATABASE_ID, VOCABULARY_COLLECTION_ID, USER_PROGRESS_COLLECTION_ID, ID } from "@/lib/appwrite"
import type { VocabularyWord } from "@/lib/types"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Flashcard } from "@/components/flashcard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { Query } from "appwrite"

export default function FlashcardsPage() {
  const { user } = useAuth()
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const makeProgressId = (userId: string, wordId: string) => {
    const input = `${userId}:${wordId}`
    let hash = 0x811c9dc5
    for (let i = 0; i < input.length; i++) {
      hash ^= input.charCodeAt(i)
      hash = Math.imul(hash, 0x01000193) >>> 0
    }
    const hex = hash.toString(16).padStart(8, "0")
    const userPrefix = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12) || "u"
    return `u${userPrefix}_${hex}`
  }

  useEffect(() => {
    let isMounted = true
    const fetchWords = async () => {
      if (isMounted) {
        await loadWords()
      }
    }
    fetchWords()
    return () => {
      isMounted = false
    }
  }, [])

  const loadWords = async () => {
    try {
      const limit = 100
      let offset = 0
      const allWords: VocabularyWord[] = []

      // Fetch all words in batches
      while (true) {
        const response = await databases.listDocuments(DATABASE_ID, VOCABULARY_COLLECTION_ID, [
          Query.limit(limit),
          Query.offset(offset),
        ])

        const batch = response.documents as unknown as VocabularyWord[]
        if (batch.length === 0) break

        allWords.push(...batch)

        if (batch.length < limit) break
        offset += limit
      }

      // Set all words at once to avoid duplicates
      setWords(allWords)
      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to load words:", error)
      setLoading(false)
    }
  }

  const handleKnown = async (known: boolean) => {
    if (!user || words.length === 0) return

    const currentWord = words[currentIndex]
    const progressId = makeProgressId(user.$id, currentWord.$id)
    const now = new Date().toISOString()

    try {
      // Check if progress already exists
      try {
        const existing = await databases.getDocument(DATABASE_ID, USER_PROGRESS_COLLECTION_ID, progressId)
        // Update existing progress
        await databases.updateDocument(DATABASE_ID, USER_PROGRESS_COLLECTION_ID, progressId, {
          known,
          lastReviewed: now,
          reviewCount: (existing.reviewCount || 0) + 1,
        })
      } catch (error) {
        // Create new progress entry
        await databases.createDocument(DATABASE_ID, USER_PROGRESS_COLLECTION_ID, progressId, {
          userId: user.$id,
          wordId: currentWord.$id,
          known,
          lastReviewed: now,
          reviewCount: 1,
        })
      }
    } catch (error) {
      console.error("[v0] Failed to save progress:", error)
    }

    // Move to next word
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </ProtectedRoute>
    )
  }

  if (words.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <NavBar />
          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-balance">No words available</h2>
              <p className="text-muted-foreground text-pretty">Please add vocabulary words to the database first.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const currentWord = words[currentIndex]

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <NavBar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-balance bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Flashcards
            </h1>
            <p className="text-muted-foreground">
              Card {currentIndex + 1} of {words.length}
            </p>
          </div>

          <div className="flex flex-col items-center gap-8">
            <Flashcard word={currentWord} />

            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="lg" onClick={() => handleKnown(false)} className="gap-2">
                  <X className="h-5 w-5" />
                  Don't Know
                </Button>
                <Button size="lg" onClick={() => handleKnown(true)} className="gap-2">
                  <Check className="h-5 w-5" />
                  Know It
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPrevious} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-sm text-muted-foreground">Navigate</span>
                <Button variant="ghost" size="icon" onClick={goToNext} disabled={currentIndex === words.length - 1}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
