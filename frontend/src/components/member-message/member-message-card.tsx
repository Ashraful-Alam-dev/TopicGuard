"use client"

import * as React from "react"
import { Loader2, MessageSquare, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MemberMessageStatus } from "@/components/member-message/member-message-status"
import {
  useDeleteMemberMessage,
  useReplyMemberMessage,
} from "@/lib/hooks/use-member-messages"
import { getApiErrorMessage } from "@/lib/api/client"
import { memberReplySchema } from "@/lib/validation/member-message"
import { formatDateTime } from "@/lib/utils-format"
import type { MemberMessage } from "@/lib/types"

export function MemberMessageCard({
  message,
  viewer,
  readOnly = false,
}: {
  message: MemberMessage
  /** "member" = the sender viewing their own message; "monitor" = the CR inbox. */
  viewer: "member" | "monitor"
  /** Archived classrooms are read-only. */
  readOnly?: boolean
}) {
  const deleteMessage = useDeleteMemberMessage()
  const replyMessage = useReplyMemberMessage()

  const [replying, setReplying] = React.useState(false)
  const [replyText, setReplyText] = React.useState("")
  const [replyError, setReplyError] = React.useState<string | null>(null)

  const isMonitor = viewer === "monitor"
  const hasReply = !!message.replyContent

  function submitReply() {
    const parsed = memberReplySchema.safeParse({ content: replyText })
    if (!parsed.success) {
      setReplyError(parsed.error.issues[0]?.message ?? "Enter a reply")
      return
    }
    setReplyError(null)
    replyMessage.mutate(
      { id: message.id, content: parsed.data.content },
      {
        onSuccess: () => {
          toast.success("Reply sent")
          setReplying(false)
          setReplyText("")
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      },
    )
  }

  return (
    <Card className="px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <MessageSquare className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {isMonitor ? (message.sender?.name ?? "Member") : "You"}
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
              {message.content}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDateTime(message.createdAt)}
            </p>
          </div>
        </div>

        {!readOnly && (
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                <AlertDialogDescription>
                  {isMonitor
                    ? `This removes the message from ${message.sender?.name ?? "the member"}'s list and your inbox, along with your reply. This can't be undone.`
                    : "This removes your message and any reply from your CR. This can't be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteMessage.isPending}
                  onClick={() =>
                    deleteMessage.mutate(message.id, {
                      onSuccess: () => toast.success("Message deleted"),
                      onError: (error) =>
                        toast.error(getApiErrorMessage(error)),
                    })
                  }
                >
                  {deleteMessage.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="flex items-center gap-2">
        <MemberMessageStatus
          replied={hasReply}
          audience={isMonitor ? "monitor" : "member"}
        />
      </div>

      {hasReply && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs font-medium text-foreground">
            {isMonitor ? "Your reply" : "Reply from your CR"}
            {message.repliedAt && (
              <span className="font-normal text-muted-foreground">
                {" "}
                · {formatDateTime(message.repliedAt)}
              </span>
            )}
          </p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
            {message.replyContent}
          </p>
        </div>
      )}

      {isMonitor && !hasReply && !readOnly && (
        <div>
          {replying ? (
            <div className="flex flex-col gap-2">
              <Textarea
                rows={3}
                placeholder="Write your reply..."
                value={replyText}
                aria-invalid={!!replyError}
                onChange={(e) => setReplyText(e.target.value)}
              />
              {replyError && (
                <p className="text-xs text-destructive">{replyError}</p>
              )}
              <p className="text-xs text-muted-foreground">
                You can reply once, and a reply can&apos;t be edited.
              </p>
              <div className="flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setReplying(false)
                    setReplyText("")
                    setReplyError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={replyMessage.isPending}
                  onClick={submitReply}
                >
                  {replyMessage.isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  Send reply
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setReplying(true)}
            >
              Reply
            </Button>
          )}
        </div>
      )}
    </Card>
  )
}
