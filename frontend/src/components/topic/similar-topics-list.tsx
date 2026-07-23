"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { TopicSimilarityBadge } from "./topic-similarity-badge"

import type { SimilarTopic } from "@/lib/types"

export function SimilarTopicsList({
  topics,
}: {
  topics: SimilarTopic[]
}) {
  const [expanded, setExpanded] = React.useState(false)

  if (topics.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No similar topics found.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto p-0 font-medium"
        onClick={() => setExpanded((v) => !v)}
      >
        {expanded ? (
          <ChevronDown className="mr-1 size-4" />
        ) : (
          <ChevronRight className="mr-1 size-4" />
        )}

        View Similar Topics ({topics.length})
      </Button>

      {expanded && (
        <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
          {topics.map((topic, index) => (
            <div
              key={`${topic.title}-${index}`}
              className="rounded-md border bg-background p-3"
            >
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {topic.title}
                </div>

                <TopicSimilarityBadge
                  similarity={topic.similarityScore}
                />
              </div>

              {topic.studentName && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <User className="size-3" />
                  {topic.studentName}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}