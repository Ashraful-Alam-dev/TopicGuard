"use client"

import Link from "next/link"
import { ChevronRight, Inbox, MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MemberMessageStatus } from "@/components/member-message/member-message-status"
import {
  useDashboardMyMessages,
  useDashboardPendingMessages,
} from "@/lib/hooks/use-member-messages"
import { formatDateTime } from "@/lib/utils-format"
import type { MemberMessage } from "@/lib/types"

function MessageRow({
  message,
  audience,
}: {
  message: MemberMessage
  audience: "member" | "monitor"
}) {
  return (
    <Link href={`/classrooms/${message.classroomId}`} className="block">
      <Card className="group px-4 transition-all duration-200 hover:shadow-md hover:ring-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {audience === "monitor"
                ? (message.sender?.name ?? "Member")
                : (message.classroom?.name ?? "Classroom")}
            </p>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {audience === "monitor" && message.classroom
                ? `${message.classroom.name} · `
                : ""}
              {message.content}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>
        <div className="flex items-center gap-2">
          <MemberMessageStatus
            replied={!!message.replyContent}
            audience={audience}
          />
          <span className="text-xs text-muted-foreground">
            {formatDateTime(message.createdAt)}
          </span>
        </div>
      </Card>
    </Link>
  )
}

/** Dashboard summaries: messages awaiting my reply (as CR) and messages I sent. */
export function DashboardMemberMessages() {
  const { data: pending } = useDashboardPendingMessages()
  const { data: mine } = useDashboardMyMessages()

  const hasPending = !!pending && pending.total > 0
  const hasMine = !!mine && mine.length > 0

  if (!hasPending && !hasMine) return null

  return (
    <div className="flex flex-col gap-6">
      {hasPending && pending && (
        <div>
          <div className="flex items-center gap-1.5">
            <Inbox className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              Awaiting your reply
            </h2>
            <Badge variant="secondary">{pending.total}</Badge>
          </div>
          <Separator className="my-3" />
          <div className="grid gap-3 sm:grid-cols-2">
            {pending.messages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                audience="monitor"
              />
            ))}
          </div>
        </div>
      )}

      {hasMine && mine && (
        <div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-foreground">
              My messages to CR
            </h2>
          </div>
          <Separator className="my-3" />
          <div className="grid gap-3 sm:grid-cols-2">
            {mine.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                audience="member"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
