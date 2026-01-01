"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export interface VocabularyWord {
  id: string
  word: string
  definition: string
}

export function useVocabulary() {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
  }, [])

  const loadWords = async () => {
    try {
      const snapshot = await getDocs(collection(db, "vocabulary"))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as VocabularyWord[]
      setWords(data)
    } catch (error) {
      console.error("Failed to load words:", error)
    } finally {
      setLoading(false)
    }
  }

  return { words, loading, refetch: loadWords }
}

export function useVocabularyMutations() {
  const createWord = async (word: string, definition: string) => {
    return await addDoc(collection(db, "vocabulary"), { word, definition })
  }

  const updateWord = async (id: string, data: { word?: string; definition?: string }) => {
    await updateDoc(doc(db, "vocabulary", id), data)
  }

  const deleteWord = async (id: string) => {
    await deleteDoc(doc(db, "vocabulary", id))
  }

  return { createWord, updateWord, deleteWord }
}
