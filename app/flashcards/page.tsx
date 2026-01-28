"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { useVocabulary } from "@/hooks/use-vocabulary"
import { useProgressMutations } from "@/hooks/use-progress"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Flashcard } from "@/components/flashcard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Check, X } from "lucide-react"

export default function FlashcardsPage() {
  const { user } = useAuth()
  const { words, loading } = useVocabulary()
  const { markWord } = useProgressMutations()
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleKnown = async (known: boolean) => {
    if (!user || words.length === 0) return

    const currentWord = words[currentIndex]

    try {
      await markWord(currentWord.id, known)
    } catch (error) {
      console.error("Failed to save progress:", error)
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
          <div className="mb-8 text-center space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Study deck</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-balance text-white">Flashcards</h1>
            <p className="text-sm sm:text-base text-slate-400">
              Card {currentIndex + 1} of {words.length}
            </p>
          </div>

          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <Flashcard word={currentWord} />

            <div className="flex flex-col items-center gap-4 w-full max-w-xl px-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">
                <Button variant="secondary" size="lg" onClick={() => handleKnown(false)} className="gap-2 w-full sm:w-auto">
                  <X className="h-5 w-5" />
                  Don't Know
                </Button>
                <Button size="lg" onClick={() => handleKnown(true)} className="gap-2 w-full sm:w-auto">
                  <Check className="h-5 w-5" />
                  Know It
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={goToPrevious} disabled={currentIndex === 0}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground">Navigate</span>
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
