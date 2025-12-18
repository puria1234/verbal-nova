"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { databases, DATABASE_ID, USER_PROGRESS_COLLECTION_ID } from "@/lib/appwrite"
import { ProtectedRoute } from "@/components/protected-route"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Brain, TrendingUp } from "lucide-react"
import { Query } from "appwrite"

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalStudied: 0,
    knownWords: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    }
  }, [user])

  const loadStats = async () => {
    try {
      // Fetch user progress from Appwrite
      const progressResponse = await databases.listDocuments(DATABASE_ID, USER_PROGRESS_COLLECTION_ID, [
        Query.equal("userId", user!.$id),
      ])

      const totalStudied = progressResponse.documents.length
      const knownWords = progressResponse.documents.filter((doc: any) => doc.known).length

      setStats({
        totalStudied,
        knownWords,
      })
    } catch (error) {
      console.error("[v0] Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <NavBar />

        <main className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold text-balance">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground text-pretty">Track your progress and continue learning.</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Words Studied</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalStudied}</div>
                    <p className="text-xs text-muted-foreground">{stats.knownWords} marked as known</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Known Words</CardTitle>
                    <Brain className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.knownWords}</div>
                    <p className="text-xs text-muted-foreground">Marked as known</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Progress Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalStudied > 0 ? Math.round((stats.knownWords / stats.totalStudied) * 100) : 0}%
                    </div>
                    <p className="text-xs text-muted-foreground">Words mastered</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-balance">Continue Learning</CardTitle>
                    <CardDescription className="text-pretty">
                      Practice with flashcards to expand your vocabulary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/flashcards">
                      <Button className="w-full">
                        <BookOpen className="mr-2 h-4 w-4" />
                        Study Flashcards
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-balance">Test Your Knowledge</CardTitle>
                    <CardDescription className="text-pretty">Take a quiz to assess your understanding</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href="/quiz">
                      <Button className="w-full bg-transparent" variant="outline">
                        <Brain className="mr-2 h-4 w-4" />
                        Take a Quiz
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
