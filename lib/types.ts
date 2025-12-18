export interface VocabularyWord {
  $id: string
  word: string
  definition: string
}

export interface UserProgress {
  $id: string
  wordId: string
  mastered?: boolean
  known?: boolean
  lastReviewed?: string
  reviewCount?: number
}

export interface QuizResult {
  $id: string
  userId: string
  score: number
  totalQuestions: number
  completedAt: string
}

export interface User {
  $id: string
  email: string
  name: string
  prefs?: Record<string, any>
}
