"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, Trophy, Sparkles, TrendingUp, CheckCircle2, User, LogOut, Menu, Flame } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useAuth } from "@/contexts/firebase-auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [progressHeight, setProgressHeight] = useState("0%")
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
    const updateProgress = () => {
      const ref = timelineRef.current
      if (!ref) return
      const midpoint = window.scrollY + window.innerHeight / 2
      const percent = Math.min(100, Math.max(0, ((midpoint - ref.offsetTop) / ref.clientHeight) * 100))
      setProgressHeight(`${percent}%`)
    }

    const handleScroll = () => updateProgress()

    updateProgress()
    const refSnapshot = timelineRef.current
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
      if (refSnapshot) {
        observer.unobserve(refSnapshot)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/90">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-foreground">Verbal Nova</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border border-border bg-secondary/80 hover:bg-secondary">
                    <Menu className="h-5 w-5 text-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-card border-border bg-card min-w-[170px]">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  {user ? (
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
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
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full border border-border bg-secondary/80 hover:bg-secondary">
                        <User className="h-5 w-5 text-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-card border-border bg-card">
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Started</Button>
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
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium animate-fade-in text-muted-foreground"
              style={{ animationDelay: "0.1s" }}
            >
              <Sparkles className="h-4 w-4 text-primary" />
              Master SAT Vocabulary
            </div>

            <h1
              className="mb-6 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-balance animate-fade-in text-foreground"
              style={{ animationDelay: "0.2s" }}
            >
              Build exam-ready vocabulary with focused daily study
            </h1>

            <p
              className="mb-8 text-base sm:text-lg text-muted-foreground text-pretty md:text-xl max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.3s" }}
            >
              Master essential SAT vocabulary from official SAT question banks. Build your skills with authentic test material.
            </p>

            <div
              className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Start Learning Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Score Progression Timeline */}
        <div ref={timelineRef} className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
              Your Journey to Success
            </h2>
            <p className="text-center text-muted-foreground mb-20 text-lg">
              Watch your SAT Reading & Writing score grow as you master vocabulary
            </p>

            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

              {/* Animated Progress Line */}
              <div
                className="absolute left-1/2 top-0 w-0.5 bg-primary hidden md:block transition-all duration-300 ease-out"
                style={{ height: progressHeight }}
              />

              {/* Timeline Items */}
              <div className="space-y-16 md:space-y-24">
                {/* Step 1 */}
                <div className={`relative transition-all duration-1000 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="w-full md:w-1/2 md:text-right">
                      <div className="inline-block w-full md:w-auto p-6 glass-card rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-foreground">Week 1: Foundation</h3>
                        <p className="text-muted-foreground mb-4">Learn 50 essential words</p>
                        <div className="text-5xl font-bold text-foreground">400</div>
                        <p className="text-sm text-muted-foreground">SAT R&W Starting Score</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/10 transition-transform hover:scale-110 duration-300">
                      <CheckCircle2 className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                    </div>
                    <div className="w-full md:w-1/2" />
                  </div>
                </div>

                {/* Step 2 */}
                <div className={`relative transition-all duration-1000 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.2s' }}>
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="w-full md:w-1/2" />
                    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/10 transition-transform hover:scale-110 duration-300">
                      <Brain className="h-7 w-7 md:h-8 md:w-8 text-primary" />
                    </div>
                    <div className="w-full md:w-1/2">
                      <div className="inline-block w-full md:w-auto p-6 glass-card rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-foreground">Week 2-3: Practice</h3>
                        <p className="text-muted-foreground mb-4">Master 150+ words with quizzes</p>
                        <div className="text-5xl font-bold text-foreground">500</div>
                        <p className="text-sm text-muted-foreground">SAT R&W +100 Points</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className={`relative transition-all duration-1000 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`} style={{ transitionDelay: '0.4s' }}>
                  <div className="flex flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
                    <div className="w-full md:w-1/2 md:text-right">
                      <div className="inline-block w-full md:w-auto p-6 glass-card rounded-2xl">
                        <h3 className="text-2xl font-bold mb-2 text-foreground">Week 4: Mastery</h3>
                        <p className="text-muted-foreground mb-4">Complete vocabulary mastery</p>
                        <div className="text-5xl font-bold text-foreground">600+</div>
                        <p className="text-sm text-muted-foreground">SAT R&W +200 Points Total</p>
                      </div>
                    </div>
                    <div className="relative z-10 flex h-14 w-14 md:h-16 md:w-16 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/10 transition-transform hover:scale-110 duration-300">
                      <Trophy className="h-7 w-7 md:h-8 md:w-8 text-primary" />
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
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Powerful Learning Features
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">
            Everything you need to master SAT vocabulary
          </p>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl glass-card p-8 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-foreground">Interactive Flashcards</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Learn vocabulary with engaging flashcards that include clear definitions.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-4">
                <Brain className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-foreground">Practice Quizzes</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Test your knowledge with multiple-choice quizzes designed to reinforce learning.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-4">
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-foreground">Track Progress</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Monitor your learning journey with detailed statistics and progress tracking.
              </p>
            </div>

            <div className="rounded-2xl glass-card p-8 transition-all hover:shadow-md">
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-4">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-semibold text-balance text-foreground">Daily Challenge</h3>
              <p className="text-muted-foreground text-pretty leading-relaxed">
                Quick 5-word streak challenge perfect for busy students. Build your streak daily!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-xl py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-6">
            <Link href="/privacy" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-400 hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
