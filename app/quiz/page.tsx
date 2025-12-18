"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { databases, DATABASE_ID, VOCABULARY_COLLECTION_ID } from "@/lib/appwrite"
import type { VocabularyWord } from "@/lib/types"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Trophy, RotateCcw } from "lucide-react"
import { cn, getCookie, setCookie } from "@/lib/utils"
import { Query } from "appwrite"

interface QuizQuestion {
  word: VocabularyWord
  options: string[]
  correctAnswer: string
}

export default function QuizPage() {
  const { user } = useAuth()
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [loading, setLoading] = useState(true)
  const [quizStarted, setQuizStarted] = useState(false)

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
      setSelectedWordIds([])
      setLoading(false)
    } catch (error) {
      console.error("[v0] Failed to load quiz:", error)
      setLoading(false)
    }
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

  const buildQuestions = (pool: VocabularyWord[]): QuizQuestion[] => {
    if (pool.length === 0) return []
    return pool.map((word, index) => {
      const wrongAnswers = pool
        .filter((w, i) => i !== index)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((w) => w.definition)

      const options = [word.definition, ...wrongAnswers].sort(() => Math.random() - 0.5)

      return {
        word,
        options,
        correctAnswer: word.definition,
      }
    })
  }

  const startQuiz = () => {
    const chosen = words.filter((w) => selectedWordIds.includes(w.$id))
    if (chosen.length === 0) return
    setQuestions(buildQuestions(chosen))
    setQuizStarted(true)
    setShowResult(false)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
  }

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return // Already answered

    setSelectedAnswer(answer)

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        finishQuiz()
      }
    }, 1000)
  }

  const finishQuiz = async () => {
    const finalScore = score + (selectedAnswer === questions[currentQuestion].correctAnswer ? 1 : 0)
    setShowResult(true)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setQuizStarted(false)
    setQuestions([])
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

  if (!loading && words.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <NavBar />
          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <h2 className="mb-2 text-2xl font-bold text-balance">No quiz available</h2>
              <p className="text-muted-foreground text-pretty">Please add vocabulary words to the database first.</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <NavBar />

        <main className="container mx-auto px-4 py-8">
          {!quizStarted ? (
            <div className="mx-auto max-w-2xl">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-balance">Ready to Test Your Knowledge?</CardTitle>
                  <CardDescription className="text-pretty">
                    Choose which words you want to include, then start your quiz.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                    {words.map((word) => {
                      const checked = selectedWordIds.includes(word.$id)
                      return (
                        <label
                          key={word.$id}
                          className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) => {
                              if (val) {
                                setSelectedWordIds((prev) => [...prev, word.$id])
                              } else {
                                setSelectedWordIds((prev) => prev.filter((id) => id !== word.$id))
                              }
                            }}
                          />
                          <div>
                            <p className="font-semibold text-white">{word.word}</p>
                            <p className="text-sm text-gray-300">{word.definition}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-300">
                    <span>{selectedWordIds.length} selected</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/10"
                      onClick={() => setSelectedWordIds(words.map((w) => w.$id))}
                    >
                      Select All
                    </Button>
                  </div>

                  <Button
                    onClick={startQuiz}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                    size="lg"
                    disabled={selectedWordIds.length === 0}
                  >
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : showResult ? (
            <div className="mx-auto max-w-2xl">
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl text-balance">Quiz Complete!</CardTitle>
                  <CardDescription className="text-pretty">Here's how you performed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <div className="mb-2 text-5xl font-bold text-primary">
                      {Math.round((score / questions.length) * 100)}%
                    </div>
                    <p className="text-lg text-muted-foreground">
                      {score} out of {questions.length} correct
                    </p>
                  </div>

                  <Button onClick={restartQuiz} className="w-full" size="lg">
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Take Another Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mx-auto max-w-2xl">
              <div className="mb-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-balance">
                    What is the definition of "{questions[currentQuestion].word.word}"?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => {
                    const isSelected = selectedAnswer === option
                    const isCorrect = option === questions[currentQuestion].correctAnswer
                    const showCorrect = selectedAnswer && isCorrect
                    const showIncorrect = isSelected && !isCorrect

                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswer(option)}
                        disabled={!!selectedAnswer}
                        className={cn(
                          "w-full rounded-lg border-2 p-4 text-left transition-all",
                          "hover:border-primary hover:bg-primary/5",
                          !selectedAnswer && "border-border bg-card",
                          showCorrect && "border-green-500 bg-green-500/10",
                          showIncorrect && "border-destructive bg-destructive/10",
                        )}
                      >
                        <p className="leading-relaxed text-pretty">{option}</p>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
