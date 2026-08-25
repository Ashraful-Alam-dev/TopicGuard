"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Crown, User } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { TopicMember } from "@/lib/types"

export function TeamMembersList({
  leader,
  members,
}: {
  leader: TopicMember
  members: TopicMember[]
}) {
  const [expanded, setExpanded] = React.useState(false)

  return (
    <div className="space-y-2">
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

        View team members ({members.length + 1})
      </Button>

      {expanded && (
        <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs">
            <Crown className="size-3 text-muted-foreground" />
            <span className="font-medium text-foreground">
              {leader.name}
            </span>
            <span className="text-muted-foreground">(Leader)</span>
          </div>

          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-1.5 text-xs"
            >
              <User className="size-3 text-muted-foreground" />
              <span className="font-medium text-foreground">
                {member.name}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
