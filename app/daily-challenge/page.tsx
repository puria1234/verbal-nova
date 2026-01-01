"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { useVocabulary } from "@/hooks/use-vocabulary"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Flame, Check, X, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DailyChallengePage() {
  const { user } = useAuth()
  const { words, loading } = useVocabulary()
  const [dailyWords, setDailyWords] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [challengeLoading, setChallengeLoading] = useState(true)

  useEffect(() => {
    if (user && words.length > 0) {
      loadDailyChallenge()
    }
  }, [user, words])

  const loadDailyChallenge = async () => {
    if (!user) return

    const today = new Date().toDateString()
    const challengeRef = doc(db, "dailyChallenges", user.uid)

    try {
      const challengeDoc = await getDoc(challengeRef)
      
      if (challengeDoc.exists()) {
        const data = challengeDoc.data()
        
        if (data.lastCompleted === today) {
          setCompleted(true)
          setStreak(data.streak || 0)
          setChallengeLoading(false)
          return
        }
        
        setStreak(data.streak || 0)
      }

      const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 5)
      const questionsWithOptions = shuffled.map((word) => {
        const wrongAnswers = words
          .filter((w) => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((w) => w.definition)

        return {
          ...word,
          options: [word.definition, ...wrongAnswers].sort(() => Math.random() - 0.5),
        }
      })

      setDailyWords(questionsWithOptions)
      setChallengeLoading(false)
    } catch (error) {
      console.error("Failed to load daily challenge:", error)
      setChallengeLoading(false)
    }
  }

  const handleAnswer = async (answer: string) => {
    if (selectedAnswer) return

    setSelectedAnswer(answer)
    const isCorrect = answer === dailyWords[currentIndex].definition
    const newScore = isCorrect ? score + 1 : score

    if (isCorrect) {
      setScore(newScore)
    }

    setTimeout(async () => {
      if (currentIndex < dailyWords.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedAnswer(null)
      } else {
        await completeChallenge(newScore)
      }
    }, 1000)
  }

  const completeChallenge = async (finalScore: number) => {
    if (!user) return

    const today = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()
    const challengeRef = doc(db, "dailyChallenges", user.uid)

    try {
      const challengeDoc = await getDoc(challengeRef)
      let newStreak = 1
      
      if (challengeDoc.exists()) {
        const data = challengeDoc.data()
        // Continue streak if completed yesterday, otherwise start fresh
        if (data.lastCompleted === yesterday) {
          newStreak = (data.streak || 0) + 1
        }
        
        await updateDoc(challengeRef, {
          lastCompleted: today,
          streak: newStreak,
          lastScore: finalScore,
          totalCompleted: (data.totalCompleted || 0) + 1,
        })
      } else {
        await setDoc(challengeRef, {
          lastCompleted: today,
          streak: newStreak,
          lastScore: finalScore,
          totalCompleted: 1,
        })
      }

      setStreak(newStreak)
      setCompleted(true)
    } catch (error) {
      console.error("Failed to save challenge:", error)
    }
  }

  if (loading || challengeLoading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </ProtectedRoute>
    )
  }

  if (completed) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Trophy className="h-16 w-16 text-yellow-500" />
                </div>
                <CardTitle className="text-center text-2xl">Challenge Complete!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-6 w-6 text-orange-500" />
                  <span className="text-3xl font-bold">{streak}</span>
                  <span className="text-muted-foreground">day streak</span>
                </div>
                <p className="text-muted-foreground">Come back tomorrow for your next challenge!</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const currentWord = dailyWords[currentIndex]

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Daily 5-Word Challenge</h1>
                <p className="text-muted-foreground text-sm sm:text-base">Question {currentIndex + 1} of 5</p>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                <span className="text-xl sm:text-2xl font-bold">{streak}</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-2xl break-words">What is the definition of "{currentWord.word}"?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentWord.options.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === option
                  const isCorrect = option === currentWord.definition
                  const showCorrect = selectedAnswer && isCorrect
                  const showIncorrect = isSelected && !isCorrect

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(option)}
                      disabled={!!selectedAnswer}
                      className={cn(
                        "w-full rounded-lg border-2 p-3 sm:p-4 text-left transition-all text-sm sm:text-base",
                        "hover:border-primary hover:bg-primary/5",
                        !selectedAnswer && "border-border bg-card",
                        showCorrect && "border-green-500 bg-green-500/10",
                        showIncorrect && "border-red-500 bg-red-500/10"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="break-words pr-2">{option}</p>
                        {showCorrect && <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-500 flex-shrink-0" />}
                        {showIncorrect && <X className="h-4 w-4 sm:h-5 sm:w-5 text-red-500 flex-shrink-0" />}
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            <div className="flex justify-center gap-1.5 sm:gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 w-10 sm:w-12 rounded-full",
                    i < currentIndex ? "bg-green-500" : i === currentIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
