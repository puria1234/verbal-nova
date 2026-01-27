"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { useVocabulary, VocabularyWord } from "@/hooks/use-vocabulary"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Clock, RotateCcw, Search, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuizQuestion {
  word: VocabularyWord
  options: string[]
  correctAnswer: string
}

export default function QuizPage() {
  const { user: _user } = useAuth()
  const { words, loading } = useVocabulary()
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timedMode, setTimedMode] = useState(false)
  const [timeLimitMinutesInput, setTimeLimitMinutesInput] = useState("5")
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(5)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const showResultRef = useRef(false)
  const timeRemainingRef = useRef<number | null>(null)

  // Filter words based on search query
  const filteredWords = useMemo(() => {
    if (!searchQuery.trim()) return words
    const query = searchQuery.toLowerCase()
    return words.filter(
      (word) =>
        word.word.toLowerCase().includes(query) ||
        word.definition.toLowerCase().includes(query)
    )
  }, [words, searchQuery])

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
    const chosen = words.filter((w) => selectedWordIds.includes(w.id))
    if (chosen.length === 0) return
    if (timedMode) {
      const parsed = Number.parseInt(timeLimitMinutesInput, 10)
      if (Number.isNaN(parsed) || parsed <= 0) {
        return
      }
      setTimeLimitMinutes(parsed)
    }
    setQuestions(buildQuestions(chosen))
    setQuizStarted(true)
    setShowResult(false)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    if (timedMode) {
      const parsed = Number.parseInt(timeLimitMinutesInput, 10)
      setTimeRemaining((Number.isNaN(parsed) || parsed <= 0 ? timeLimitMinutes : parsed) * 60)
    } else {
      setTimeRemaining(null)
    }
  }

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return // Already answered

    setSelectedAnswer(answer)

    if (answer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
    }

    // Move to next question after a delay
    setTimeout(() => {
      if (showResultRef.current || timeRemainingRef.current === 0) return
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
      } else {
        finishQuiz()
      }
    }, 1000)
  }

  const finishQuiz = async () => {
    setShowResult(true)
  }

  const restartQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setScore(0)
    setShowResult(false)
    setQuizStarted(false)
    setQuestions([])
    setTimeRemaining(null)
  }

  useEffect(() => {
    showResultRef.current = showResult
  }, [showResult])

  useEffect(() => {
    timeRemainingRef.current = timeRemaining
  }, [timeRemaining])

  useEffect(() => {
    if (!quizStarted || showResult || !timedMode || timeRemaining === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      return
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null) return prev
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
          }
          setShowResult(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [quizStarted, showResult, timedMode, timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
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
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search words..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2">
                    {filteredWords.map((word) => {
                      const checked = selectedWordIds.includes(word.id)
                      return (
                        <label
                          key={word.id}
                          className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 hover:border-white/20"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(val) => {
                              if (val) {
                                setSelectedWordIds((prev) => [...prev, word.id])
                              } else {
                                setSelectedWordIds((prev) => prev.filter((id) => id !== word.id))
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
                    <span>{selectedWordIds.length} selected {searchQuery && `(${filteredWords.length} shown)`}</span>
                    <div className="flex gap-2">
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/10"
                          onClick={() => {
                            setSearchQuery("")
                          }}
                        >
                          Clear Search
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/10"
                        onClick={() => setSelectedWordIds(filteredWords.map((w) => w.id))}
                      >
                        Select {searchQuery ? "Filtered" : "All"}
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Timed quiz</p>
                        <p className="text-xs text-gray-400">Add a countdown to complete the quiz.</p>
                      </div>
                      <Checkbox
                        checked={timedMode}
                        onCheckedChange={(val) => setTimedMode(!!val)}
                      />
                    </div>
                    {timedMode && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                        <label className="text-xs text-gray-400">Time limit (minutes)</label>
                        <Input
                          type="number"
                          min={1}
                          step={1}
                          inputMode="numeric"
                          value={timeLimitMinutesInput}
                          onChange={(e) => {
                            const next = e.target.value
                            if (next === "" || /^[0-9]+$/.test(next)) {
                              setTimeLimitMinutesInput(next)
                            }
                          }}
                          className="h-9 w-32 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="e.g. 7"
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={startQuiz}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0"
                    size="lg"
                    disabled={
                      selectedWordIds.length === 0 ||
                      (timedMode && (!timeLimitMinutesInput || Number.parseInt(timeLimitMinutesInput, 10) <= 0))
                    }
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
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                    />
                  </div>
                  {timedMode && timeRemaining !== null && (
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white">
                      <Clock className="h-4 w-4 text-blue-300" />
                      {formatTime(timeRemaining)}
                    </div>
                  )}
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
