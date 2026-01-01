"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Trophy, Sparkles, TrendingUp, CheckCircle2, Target, User, LogOut, Menu, Flame, Swords, Users } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [timelineVisible, setTimelineVisible] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimelineVisible(true)
          }
        })
      },
      { threshold: 0.2 }
    )

    if (timelineRef.current) {
      observer.observe(timelineRef.current)
    }

    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (timelineRef.current) {
        observer.unobserve(timelineRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 glass">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Verbal Nova</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full bg-blue-500/20 hover:bg-blue-500/30">
                    <Menu className="h-5 w-5 text-blue-300" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-white/20 min-w-[170px]">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {user ? (
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:bg-white/10">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login">Log in</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/signup">Get Started</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="hover:bg-white/10 hover:text-white text-white">Dashboard</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full bg-blue-500/20 hover:bg-blue-500/30">
                        <User className="h-5 w-5 text-blue-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-white/20">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-white hover:bg-white/10">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="hover:bg-white/10 hover:text-white text-white">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium animate-fade-in"
              style={{ animationDelay: "0.1s" }}
            >
              <Sparkles className="h-4 w-4" />
              Master SAT Vocabulary
            </div>

            <h1
              className="mb-6 text-4xl sm:text-5xl md:text-7xl font-bold leading-tight text-balance animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Boost Your SAT Score by
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text text-transparent">
                200+ Points
              </span>
            </h1>

            <p
              className="mb-8 text-base sm:text-lg text-gray-400 text-pretty md:text-xl max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Master essential SAT vocabulary from official SAT question banks. Build your skills with authentic test material.
            </p>

            <div
              className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white border-0 text-lg px-8">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-blue-500/50 hover:bg-blue-500/10 text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Score Progression Timeline */}
        <div ref={timelineRef} className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Your Journey to Success
            </h2>
            <p className="text-center text-gray-400 mb-20 text-lg">
              Watch your SAT Reading & Writing score grow as you master vocabulary
            </p>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-white/20 via-white/40 to-white/20 hidden md:block" />

              {/* Animated Progress Line */}
              <div
                className="absolute left-1/2 top-0 w-0.5 bg-gradient-to-b from-blue-400 to-cyan-400 hidden md:block transition-all duration-300 ease-out"
                style={{
                  height: timelineRef.current ?
                    `${Math.min(100, Math.max(0, ((scrollY + window.innerHeight / 2) - timelineRef.current.offsetTop) / (timelineRef.current.clientHeight) * 100))}%`
                    : '0%'
                }}
              />

              {/* Timeline Items */}
              <div className="space-y-16 md:space-y-24">
                {/* Step 1 */}
                <div className={`relative transition-all duration-1000 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="w-full md:w-1/2 md:text-right">
                      <div className="inline-block w-full md:w-auto p-6 glass-card rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-white">Week 1: Foundation</h3>
                        <p className="text-gray-300 mb-4">Learn 50 essential words</p>
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">400</div>
                        <p className="text-sm text-gray-300">SAT R&W Starting Score</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-blue-400 bg-gradient-to-br from-slate-950 to-blue-950 transition-transform hover:scale-110 duration-300">
                      <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8 text-blue-400" />
                    </div>
                    <div className="w-full md:w-1/2" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`relative transition-all duration-1000 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.2s' }}>
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="w-full md:w-1/2" />
                    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-cyan-400 bg-gradient-to-br from-slate-950 to-cyan-950 transition-transform hover:scale-110 duration-300">
                      <Brain className="h-7 w-7 md:h-8 md:w-8 text-cyan-400" />
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="inline-block w-full md:w-auto p-6 glass-card rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-white">Week 2-3: Practice</h3>
                        <p className="text-gray-300 mb-4">Master 150+ words with quizzes</p>
                        <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">500</div>
                        <p className="text-sm text-gray-300">SAT R&W +100 Points</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`relative transition-all duration-1000 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.4s' }}>
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="w-full md:w-1/2 md:text-right">
                      <div className="inline-block w-full md:w-auto p-6 glass-card rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-white">Week 4: Mastery</h3>
                        <p className="text-gray-300 mb-4">Complete vocabulary mastery</p>
                        <div className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent">600+</div>
                        <p className="text-sm text-gray-300">SAT R&W +200 Points Total</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-cyan-400 bg-gradient-to-br from-slate-950 to-cyan-950 transition-transform hover:scale-110 duration-300">
                      <Trophy className="h-7 w-7 md:h-8 md:w-8 text-cyan-400" />
                    </div>
                    <div className="w-full md:w-1/2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="container mx-auto px-4 py-20">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Powerful Learning Features
          </h2>
          <p className="text-center text-gray-400 mb-16 text-lg">
            Everything you need to master SAT vocabulary
          </p>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl glass-card p-8 transition-all hover:scale-105">
              <div className="mb-4 inline-flex rounded-xl bg-blue-500/20 p-4">
                <BookOpen className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-white">Interactive Flashcards</h3>
              <p className="text-gray-300 text-pretty leading-relaxed">
                Learn vocabulary with engaging flashcards that include clear definitions.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:scale-105">
              <div className="mb-4 inline-flex rounded-xl bg-cyan-500/20 p-4">
                <Brain className="h-8 w-8 text-cyan-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-white">Practice Quizzes</h3>
              <p className="text-gray-300 text-pretty leading-relaxed">
                Test your knowledge with multiple-choice quizzes designed to reinforce learning.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:scale-105">
              <div className="mb-4 inline-flex rounded-xl bg-blue-400/20 p-4">
                <TrendingUp className="h-8 w-8 text-blue-300" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-white">Track Progress</h3>
              <p className="text-gray-300 text-pretty leading-relaxed">
                Monitor your learning journey with detailed statistics and progress tracking.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:scale-105">
              <div className="mb-4 inline-flex rounded-xl bg-orange-500/20 p-4">
                <Flame className="h-8 w-8 text-orange-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-white">Daily Challenge</h3>
              <p className="text-gray-300 text-pretty leading-relaxed">
                Quick 5-word streak challenge perfect for busy students. Build your streak daily!
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:scale-105">
              <div className="mb-4 inline-flex rounded-xl bg-red-500/20 p-4">
                <Swords className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-white">Battle Mode</h3>
              <p className="text-gray-300 text-pretty leading-relaxed">
                Compete in timed vocab rounds against AI or challenge friends with join codes.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:scale-105">
              <div className="mb-4 inline-flex rounded-xl bg-green-500/20 p-4">
                <Users className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-white">Friend Battles</h3>
              <p className="text-gray-300 text-pretty leading-relaxed">
                Create a room, share the code, and battle your friends in real-time vocabulary duels.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">© 2024 Verbal Nova. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
