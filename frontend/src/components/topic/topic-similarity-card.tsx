"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"

import { TopicSimilarityBadge } from "./topic-similarity-badge"
import { SimilarTopicsList } from "./similar-topics-list"

import { getInitials } from "@/lib/utils-format"
import type { TopicWithStudent } from "@/lib/types"

interface TopicSimilarityCardProps {
  topic: TopicWithStudent
  showStudent?: boolean
}

export function TopicSimilarityCard({
  topic,
  showStudent = true,
}: TopicSimilarityCardProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        {showStudent && (
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback>
                {getInitials(topic.student.name)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {topic.student.name}
              </p>

              <p className="truncate text-xs text-muted-foreground">
                {topic.student.email}
              </p>
            </div>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground">
            Topic
          </p>

          <p className="mt-1 font-medium">
            {topic.originalTitle}
          </p>
        </div>

        {topic.isTeamTopic && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Team leader
              </p>
              <p className="mt-1 text-sm font-medium">
                {topic.leader.name}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Team members
              </p>
              <div className="mt-1 flex flex-col gap-0.5">
                {topic.members.map((member) => (
                  <p key={member.id} className="text-sm font-medium">
                    {member.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Highest similarity
          </span>

          <TopicSimilarityBadge
            similarity={topic.highestSimilarity}
          />
        </div>

        <SimilarTopicsList
          topics={topic.similarTopics}
        />
      </div>
    </Card>
  )
}