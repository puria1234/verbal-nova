"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { useVocabulary } from "@/hooks/use-vocabulary"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Swords, Trophy, Clock, Zap, Users, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { doc, setDoc, onSnapshot, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

type BattleMode = "menu" | "ai-battle" | "create-room" | "join-room" | "waiting" | "friend-battle"
type AIDifficulty = "easy" | "medium" | "hard"

interface BattleRoom {
  hostId: string
  hostName: string
  guestId?: string
  guestName?: string
  status: "waiting" | "ready" | "playing" | "finished"
  words?: any[]
  hostScore: number
  guestScore: number
  currentIndex: number
  hostAnswer?: string
  guestAnswer?: string
}

export default function BattlePage() {
  const { user } = useAuth()
  const { words, loading } = useVocabulary()
  const [mode, setMode] = useState<BattleMode>("menu")
  const [battleWords, setBattleWords] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [playerScore, setPlayerScore] = useState(0)
  const [opponentScore, setOpponentScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameOver, setGameOver] = useState(false)
  const [aiDifficulty, setAIDifficulty] = useState<AIDifficulty>("medium")
  
  // Refs to track current values in callbacks
  const currentIndexRef = useRef(currentIndex)
  const battleWordsRef = useRef(battleWords)
  
  useEffect(() => {
    currentIndexRef.current = currentIndex
  }, [currentIndex])
  
  useEffect(() => {
    battleWordsRef.current = battleWords
  }, [battleWords])
  
  // Friend battle state
  const [roomCode, setRoomCode] = useState("")
  const [joinCode, setJoinCode] = useState("")
  const [copied, setCopied] = useState(false)
  const [room, setRoom] = useState<BattleRoom | null>(null)
  const [isHost, setIsHost] = useState(false)
  const [opponentName, setOpponentName] = useState("AI")

  // Listen to room updates
  useEffect(() => {
    if (!roomCode || mode === "menu" || mode === "ai-battle") return

    const unsubscribe = onSnapshot(doc(db, "battleRooms", roomCode), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as BattleRoom
        setRoom(data)

        if (data.status === "ready" && mode === "waiting") {
          setBattleWords(data.words || [])
          setMode("friend-battle")
          setOpponentName(isHost ? data.guestName || "Friend" : data.hostName)
        }

        if (data.status === "playing") {
          setCurrentIndex(data.currentIndex)
          if (isHost) {
            setPlayerScore(data.hostScore)
            setOpponentScore(data.guestScore)
          } else {
            setPlayerScore(data.guestScore)
            setOpponentScore(data.hostScore)
          }
        }

        if (data.status === "finished") {
          setGameOver(true)
        }
      }
    })

    return () => unsubscribe()
  }, [roomCode, mode, isHost])

  // Timer for AI battle
  useEffect(() => {
    if (mode === "ai-battle" && timeLeft > 0 && !selectedAnswer && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (mode === "ai-battle" && timeLeft === 0 && !selectedAnswer) {
      handleAITimeout()
    }
  }, [timeLeft, mode, selectedAnswer, gameOver])

  // Timer for friend battle
  useEffect(() => {
    if (mode === "friend-battle" && timeLeft > 0 && !selectedAnswer && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (mode === "friend-battle" && timeLeft === 0 && !selectedAnswer) {
      handleFriendTimeout()
    }
  }, [timeLeft, mode, selectedAnswer, gameOver])

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const createRoom = async () => {
    if (!user) return
    
    const code = generateRoomCode()
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10)
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

    await setDoc(doc(db, "battleRooms", code), {
      hostId: user.uid,
      hostName: user.displayName || user.email?.split("@")[0] || "Host",
      status: "waiting",
      words: questionsWithOptions,
      hostScore: 0,
      guestScore: 0,
      currentIndex: 0,
    })

    setRoomCode(code)
    setIsHost(true)
    setMode("waiting")
  }

  const joinRoom = async () => {
    if (!user || !joinCode) return

    const roomRef = doc(db, "battleRooms", joinCode.toUpperCase())
    const roomSnap = await getDoc(roomRef)

    if (!roomSnap.exists()) {
      alert("Room not found!")
      return
    }

    const roomData = roomSnap.data() as BattleRoom
    if (roomData.status !== "waiting") {
      alert("Room is no longer available!")
      return
    }

    await updateDoc(roomRef, {
      guestId: user.uid,
      guestName: user.displayName || user.email?.split("@")[0] || "Guest",
      status: "ready",
    })

    setRoomCode(joinCode.toUpperCase())
    setIsHost(false)
    setBattleWords(roomData.words || [])
    setOpponentName(roomData.hostName)
    setMode("friend-battle")
    setTimeLeft(10)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const startAIBattle = (difficulty: AIDifficulty) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5).slice(0, 10)
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

    setBattleWords(questionsWithOptions)
    setMode("ai-battle")
    setCurrentIndex(0)
    setPlayerScore(0)
    setOpponentScore(0)
    setTimeLeft(10)
    setGameOver(false)
    setAIDifficulty(difficulty)
    setOpponentName(`AI (${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)})`)
  }

  const getAIAccuracy = () => {
    switch (aiDifficulty) {
      case "easy":
        return 0.3 // AI gets 30% correct (3/10)
      case "medium":
        return 0.6 // AI gets 60% correct (6/10)
      case "hard":
        return 0.9 // AI gets 90% correct (9/10)
      default:
        return 0.6
    }
  }

  const handleAIAnswer = (answer: string) => {
    if (selectedAnswer || gameOver) return

    setSelectedAnswer(answer)
    const idx = currentIndexRef.current
    const words = battleWordsRef.current
    const isCorrect = answer === words[idx].definition

    if (isCorrect) {
      setPlayerScore(prev => prev + 1)
    }
    if (Math.random() < getAIAccuracy()) {
      setOpponentScore(prev => prev + 1)
    }

    setTimeout(() => {
      if (idx < words.length - 1) {
        setCurrentIndex(idx + 1)
        setSelectedAnswer(null)
        setTimeLeft(10)
      } else {
        setGameOver(true)
      }
    }, 1500)
  }

  const handleAITimeout = () => {
    const idx = currentIndexRef.current
    const words = battleWordsRef.current
    
    if (Math.random() < getAIAccuracy()) {
      setOpponentScore(prev => prev + 1)
    }
    if (idx < words.length - 1) {
      setCurrentIndex(idx + 1)
      setTimeLeft(10)
    } else {
      setGameOver(true)
    }
  }

  const handleFriendAnswer = async (answer: string) => {
    if (selectedAnswer || gameOver || !roomCode) return

    setSelectedAnswer(answer)
    const isCorrect = answer === battleWords[currentIndex].definition
    const newScore = isCorrect ? playerScore + 1 : playerScore

    if (isCorrect) setPlayerScore(newScore)

    const roomRef = doc(db, "battleRooms", roomCode)
    const updateData = isHost
      ? { hostScore: newScore, hostAnswer: answer }
      : { guestScore: newScore, guestAnswer: answer }

    await updateDoc(roomRef, updateData)

    setTimeout(async () => {
      if (currentIndex < battleWords.length - 1) {
        if (isHost) {
          await updateDoc(roomRef, {
            currentIndex: currentIndex + 1,
            hostAnswer: null,
            guestAnswer: null,
          })
        }
        setSelectedAnswer(null)
        setTimeLeft(10)
      } else {
        await updateDoc(roomRef, { status: "finished" })
        setGameOver(true)
      }
    }, 1500)
  }

  const handleFriendTimeout = async () => {
    if (!roomCode) return
    
    setTimeout(async () => {
      if (currentIndex < battleWords.length - 1) {
        if (isHost) {
          const roomRef = doc(db, "battleRooms", roomCode)
          await updateDoc(roomRef, {
            currentIndex: currentIndex + 1,
            hostAnswer: null,
            guestAnswer: null,
          })
        }
        setTimeLeft(10)
      } else {
        const roomRef = doc(db, "battleRooms", roomCode)
        await updateDoc(roomRef, { status: "finished" })
        setGameOver(true)
      }
    }, 1000)
  }

  const backToMenu = async () => {
    if (roomCode) {
      try {
        await deleteDoc(doc(db, "battleRooms", roomCode))
      } catch (e) {}
    }
    setMode("menu")
    setRoomCode("")
    setJoinCode("")
    setRoom(null)
    setGameOver(false)
    setSelectedAnswer(null)
    setPlayerScore(0)
    setOpponentScore(0)
    setCurrentIndex(0)
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

  // Menu
  if (mode === "menu") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2">
                  <Swords className="h-8 w-8 sm:h-10 sm:w-10 text-red-500" />
                  <span>SAT Battle Mode</span>
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">Test your vocabulary skills!</p>
              </div>

              <div className="grid gap-4">
                <Card className="cursor-pointer hover:border-green-500 transition-colors" onClick={() => startAIBattle("easy")}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-green-500" />
                      Easy Mode
                    </CardTitle>
                    <CardDescription>Perfect for beginners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-green-500 hover:bg-green-600">Start Easy Battle</Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-yellow-500 transition-colors" onClick={() => startAIBattle("medium")}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Medium Mode
                    </CardTitle>
                    <CardDescription>Balanced challenge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600">Start Medium Battle</Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:border-red-500 transition-colors" onClick={() => startAIBattle("hard")}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-red-500" />
                      Hard Mode
                    </CardTitle>
                    <CardDescription>Expert challenge</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-red-500 hover:bg-red-600">Start Hard Battle</Button>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">Or battle with friends</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:border-primary transition-colors" onClick={createRoom}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="h-5 w-5 text-green-500" />
                        Create Room
                      </CardTitle>
                      <CardDescription>Share a code with friends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full" variant="outline">Create Room</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Join Room</CardTitle>
                      <CardDescription>Enter a friend's code</CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Input
                        placeholder="CODE"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        className="uppercase"
                      />
                      <Button onClick={joinRoom} disabled={joinCode.length !== 6}>Join</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Waiting for friend
  if (mode === "waiting") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Waiting for Friend</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                <p className="text-muted-foreground text-sm sm:text-base">Share this code with your friend:</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl sm:text-4xl font-mono font-bold tracking-widest">{roomCode}</span>
                  <Button variant="ghost" size="icon" onClick={copyCode}>
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                  </Button>
                </div>
                <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <Button variant="outline" onClick={backToMenu}>Cancel</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Game over
  if (gameOver) {
    const won = playerScore > opponentScore
    return (
      <ProtectedRoute>
        <div className="min-h-screen">
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <div className="flex items-center justify-center mb-4">
                  <Trophy className={cn("h-16 w-16", won ? "text-yellow-500" : "text-gray-500")} />
                </div>
                <CardTitle className="text-center text-2xl">
                  {won ? "Victory!" : playerScore === opponentScore ? "Draw!" : "Defeat"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">You</p>
                    <p className="text-3xl font-bold">{playerScore}</p>
                  </div>
                  <div className="text-2xl font-bold text-muted-foreground">-</div>
                  <div>
                    <p className="text-sm text-muted-foreground">{opponentName}</p>
                    <p className="text-3xl font-bold">{opponentScore}</p>
                  </div>
                </div>
                <Button onClick={backToMenu} className="w-full">Back to Menu</Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  // Battle screen (AI or Friend)
  const currentWord = battleWords[currentIndex]
  const handleAnswer = mode === "ai-battle" ? handleAIAnswer : handleFriendAnswer

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground">You</p>
                  <p className="text-xl sm:text-2xl font-bold">{playerScore}</p>
                </div>
                <Swords className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                <div className="text-center">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[80px] sm:max-w-none">{opponentName}</p>
                  <p className="text-xl sm:text-2xl font-bold">{opponentScore}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className={cn("text-xl sm:text-2xl font-bold", timeLeft <= 3 && "text-red-500")}>{timeLeft}s</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-xl break-words">
                  Question {currentIndex + 1}/10: "{currentWord?.word}"
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentWord?.options.map((option: string, index: number) => {
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
                        "w-full rounded-lg border-2 p-3 sm:p-4 text-left transition-all text-sm sm:text-base break-words",
                        "hover:border-primary hover:bg-primary/5",
                        !selectedAnswer && "border-border bg-card",
                        showCorrect && "border-green-500 bg-green-500/10",
                        showIncorrect && "border-red-500 bg-red-500/10"
                      )}
                    >
                      {option}
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
