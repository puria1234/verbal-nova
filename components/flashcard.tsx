"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import type { VocabularyWord } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FlashcardProps {
  word: VocabularyWord
}

export function Flashcard({ word }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div className="perspective-1000 h-[400px] w-full max-w-md cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
      <div
        className={cn(
          "relative h-full w-full transition-transform duration-500",
          "transform-style-3d",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <Card
          className={cn(
            "backface-hidden absolute inset-0 flex items-center justify-center p-8",
            "border border-white/20 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10",
            "backdrop-blur-xl shadow-2xl",
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center space-y-4">
            <p className="text-sm font-medium text-cyan-300/70 uppercase tracking-widest">Tap to reveal</p>
            <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-balance">{word.word}</h2>
          </div>
        </Card>

        {/* Back */}
        <Card
          className={cn(
            "backface-hidden absolute inset-0 flex flex-col justify-center p-8",
            "border border-white/20 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-cyan-500/10",
            "backdrop-blur-xl shadow-2xl",
            "[transform:rotateY(180deg)]",
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 text-balance">{word.word}</h3>
            <div>
              <p className="mb-2 text-sm font-semibold text-purple-300/80 uppercase tracking-wider">Definition</p>
              <p className="text-lg leading-relaxed text-gray-100 text-pretty">{word.definition}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
