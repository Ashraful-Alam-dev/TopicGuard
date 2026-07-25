"use client"

import { AlertTriangle, Sparkles, XIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { ConsultAiResult } from "@/lib/types"

interface ConsultAiCardProps {
  result: ConsultAiResult | null
  errorMessage: string | null
  onUseTopic: (title: string) => void
  onDismiss: () => void
}

function scoreBadgeClassName(score: number): string {
  if (score >= 9.5) {
    return "bg-primary/10 text-primary dark:bg-primary/20"
  }
  if (score >= 7) {
    return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
  }
  if (score >= 4) {
    return cn(
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    )
  }
  return "bg-destructive/10 text-destructive dark:bg-destructive/20"
}

export function ConsultAiCard({
  result,
  errorMessage,
  onUseTopic,
  onDismiss,
}: ConsultAiCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="size-3.5 text-primary" />
          AI Feedback
        </div>

        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss AI feedback"
          className="rounded-md p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <XIcon className="size-3.5" />
        </button>
      </div>

      {errorMessage ? (
        <Alert className="mt-3">
          <AlertTriangle />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : result ? (
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Score</span>
            <Badge
              variant="secondary"
              className={scoreBadgeClassName(result.score)}
            >
              {result.score.toFixed(1)} / 10
            </Badge>
          </div>

          {(result.uniqueness || result.relevance) && (
            <div className="space-y-1 text-sm">
              {result.uniqueness && <p>{result.uniqueness}</p>}
              {result.relevance && <p>{result.relevance}</p>}
            </div>
          )}

          {result.suggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Focus areas
              </p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-sm">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}

          {result.recommendedTopics.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                Recommended topics
              </p>
              <ul className="mt-1.5 flex flex-col gap-1.5">
                {result.recommendedTopics.map((topic, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-2.5 py-1.5"
                  >
                    <span className="min-w-0 truncate text-sm">{topic}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => onUseTopic(topic)}
                    >
                      Use this
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : null}
    </Card>
  )
}
