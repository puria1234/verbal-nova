"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs, setDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/contexts/firebase-auth-context"

export interface UserProgress {
  id: string
  userId: string
  wordId: string
  known: boolean
  lastReviewed: string
  reviewCount: number
}

export function useProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadProgress()
    } else {
      setProgress([])
      setLoading(false)
    }
  }, [user])

  const loadProgress = async () => {
    if (!user) return
    try {
      const q = query(collection(db, "userProgress"), where("userId", "==", user.uid))
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as UserProgress[]
      setProgress(data)
    } catch (error) {
      console.error("Failed to load progress:", error)
    } finally {
      setLoading(false)
    }
  }

  return { progress, loading, refetch: loadProgress }
}

export function useProgressStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalStudied: 0, knownWords: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadStats()
    } else {
      setStats({ totalStudied: 0, knownWords: 0 })
      setLoading(false)
    }
  }, [user])

  const loadStats = async () => {
    if (!user) return
    try {
      const q = query(collection(db, "userProgress"), where("userId", "==", user.uid))
      const snapshot = await getDocs(q)
      const docs = snapshot.docs.map((doc) => doc.data())
      setStats({
        totalStudied: docs.length,
        knownWords: docs.filter((d) => d.known).length,
      })
    } catch (error) {
      console.error("Failed to load stats:", error)
    } finally {
      setLoading(false)
    }
  }

  return { stats, loading }
}

export function useProgressMutations() {
  const { user } = useAuth()

  const markWord = async (wordId: string, known: boolean) => {
    if (!user) throw new Error("Not authenticated")

    const progressId = `${user.uid}_${wordId}`
    await setDoc(doc(db, "userProgress", progressId), {
      userId: user.uid,
      wordId,
      known,
      lastReviewed: new Date().toISOString(),
      reviewCount: 1, // Could increment if exists
    }, { merge: true })
  }

  return { markWord }
}
