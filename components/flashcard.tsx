"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FlashcardProps {
  word: { id: string; word: string; definition: string }
}

export function Flashcard({ word }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div
      className="perspective-1200 w-full max-w-xl h-[420px] sm:h-[460px] cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
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
            "border border-border bg-card text-foreground",
            "shadow-lg rounded-3xl",
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          <h2 className="text-5xl sm:text-6xl font-bold leading-tight text-center break-words px-4">
            {word.word}
          </h2>
        </Card>

        {/* Back */}
        <Card
          className={cn(
            "backface-hidden absolute inset-0 flex flex-col items-center justify-center p-8 gap-6",
            "border border-border bg-card text-foreground",
            "shadow-lg rounded-3xl",
            "[transform:rotateY(180deg)]",
          )}
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <h3 className="text-3xl sm:text-4xl font-semibold leading-tight break-words text-center">{word.word}</h3>
          <div className="rounded-2xl bg-secondary/50 border border-border p-6 max-h-[280px] overflow-auto">
            <p className="text-lg sm:text-xl leading-relaxed text-pretty break-words text-foreground/90">
              {word.definition}
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
