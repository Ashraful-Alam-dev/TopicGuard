"use client"

import { Inbox, MessageSquare } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { MemberMessageCard } from "@/components/member-message/member-message-card"
import {
  useMemberInbox,
  useMyMemberMessages,
} from "@/lib/hooks/use-member-messages"

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-20 w-full" />
    </div>
  )
}

/** Member view: messages I sent to the CR, with their replies. */
export function MyMemberMessages({
  classroomId,
  readOnly,
}: {
  classroomId: string
  readOnly: boolean
}) {
  const { data: messages, isLoading } = useMyMemberMessages(classroomId)

  if (isLoading) return <ListSkeleton />

  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No messages yet"
        description="Have a question about a topic or deadline? Send a private message to your CR."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <MemberMessageCard
          key={message.id}
          message={message}
          viewer="member"
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}

/** Monitor view: everything members sent, with a one-time reply. */
export function MemberInbox({
  classroomId,
  readOnly,
}: {
  classroomId: string
  readOnly: boolean
}) {
  const { data: messages, isLoading } = useMemberInbox(classroomId)

  if (isLoading) return <ListSkeleton />

  if (!messages || messages.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Your inbox is empty"
        description="Private messages from members of this classroom will show up here."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <MemberMessageCard
          key={message.id}
          message={message}
          viewer="monitor"
          readOnly={readOnly}
        />
      ))}
    </div>
  )
}
