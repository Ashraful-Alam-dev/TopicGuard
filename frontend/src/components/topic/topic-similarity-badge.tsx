"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function TopicSimilarityBadge({
  similarity,
}: {
  similarity: number | null
}) {
  if (similarity === null) {
    return (
      <Badge variant="secondary">
        No similar topics
      </Badge>
    )
  }

  const percent = Math.round(similarity * 100)

  if (percent >= 75) {
    return (
      <Badge variant="destructive">
        🔴 {percent}%
      </Badge>
    )
  }

  if (percent >= 50) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "border-amber-500/40",
          "bg-amber-500/10",
          "text-amber-700 dark:text-amber-400",
        )}
      >
        🟡 {percent}%
      </Badge>
    )
  }

  return (
    <Badge
      variant="secondary"
      className={cn(
        "bg-emerald-500/10",
        "text-emerald-700 dark:text-emerald-400",
      )}
    >
      🟢 {percent}%
    </Badge>
  )
}