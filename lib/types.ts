export interface VocabularyWord {
  _id: string
  word: string
  definition: string
}

export interface UserProgress {
  _id: string
  userId: string
  wordId: string
  mastered?: boolean
  known?: boolean
  lastReviewed?: string
  reviewCount?: number
}

export interface QuizResult {
  _id: string
  userId: string
  score: number
  totalQuestions: number
  completedAt: string
}

export interface User {
  _id: string
  email?: string
  name?: string
  image?: string
}
