"use client"

import { Megaphone } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { MessageCard } from "@/components/message/message-card"
import { useMessages } from "@/lib/hooks/use-messages"

export function MessageList({
  classroomId,
  isMonitor,
}: {
  classroomId: string
  isMonitor: boolean
}) {
  const { data: messages, isLoading } = useMessages(classroomId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        icon={Megaphone}
        title="No announcements yet"
        description={
          isMonitor
            ? "Send an announcement to notify every member of this classroom."
            : "Your monitor hasn't posted any announcements yet."
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <MessageCard
          key={message.id}
          message={message}
          classroomId={classroomId}
          canDelete={isMonitor}
        />
      ))}
    </div>
  )
}
