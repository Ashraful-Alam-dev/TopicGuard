"use client"

import { Loader2, Sparkles, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { SimilarTopic } from "@/lib/types"

function similarityTone(score: number) {
  if (score >= 0.8) {
    return {
      badge: "destructive" as const,
      badgeClassName: "",
      bar: "bg-destructive",
    }
  }

  if (score >= 0.6) {
    return {
      badge: "outline" as const,
      badgeClassName: "border-yellow-500/50 text-yellow-600",
      bar: "bg-yellow-500",
    }
  }

  return {
    badge: "secondary" as const,
    badgeClassName: "border-blue-500/40 text-blue-600",
    bar: "bg-blue-500",
  }
}

function similarityLabel(score: number) {
  if (score >= 0.8) return "Very High Similarity"
  if (score >= 0.6) return "High Similarity"
  return "Moderate Similarity"
}

function SimilarTopicRow({ topic }: { topic: SimilarTopic }) {
  const percent = Math.round(topic.similarityScore * 100)
  const tone = similarityTone(topic.similarityScore)

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {topic.title}
          </p>

          {topic.studentName && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <User className="size-3" />
              Registered by{" "}
              <span className="font-medium">
                {topic.studentName}
              </span>
            </div>
          )}
        </div>

        <Badge
          variant={tone.badge}
          className={cn("shrink-0", tone.badgeClassName)}
        >
          {percent}% • {similarityLabel(topic.similarityScore)}
        </Badge>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", tone.bar)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export function SimilarityConfirmDialog({
  open,
  onOpenChange,
  similarTopics,
  onConfirm,
  onGoBack,
  isSubmitting,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  similarTopics: SimilarTopic[]
  onConfirm: () => void
  onGoBack: () => void
  isSubmitting: boolean
}) {
  const highestSimilarity =
    similarTopics.length > 0
      ? Math.max(...similarTopics.map((topic) => topic.similarityScore))
      : 0

  const highestPercent = Math.round(highestSimilarity * 100)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/10">
            <Sparkles className="size-5 text-amber-600" />
          </div>

          <DialogTitle>
            Similar topics detected ({highestPercent}%)
          </DialogTitle>

          <DialogDescription>
            Your topic appears to be semantically similar to one or more
            previously registered topics in this submission.
            <br />
            <br />
            You can still submit it, but consider revising the title if your
            project represents the same idea.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-72 flex-col gap-3 overflow-y-auto">
          {similarTopics.map((topic, index) => (
            <SimilarTopicRow
              key={`${topic.title}-${index}`}
              topic={topic}
            />
          ))}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onGoBack}
            disabled={isSubmitting}
          >
            Go Back & Revise
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Submit Anyway
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}