"use client"

import { Loader2, Megaphone, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { useDeleteMessage } from "@/lib/hooks/use-messages"
import { getApiErrorMessage } from "@/lib/api/client"
import { formatDateTime } from "@/lib/utils-format"
import type { Message } from "@/lib/types"

export function MessageCard({
  message,
  classroomId,
  canDelete,
}: {
  message: Message
  classroomId: string
  canDelete: boolean
}) {
  const deleteMessage = useDeleteMessage(classroomId)

  return (
    <Card className="px-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <Megaphone className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {message.title}
            </p>
            <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">
              {message.content}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {formatDateTime(message.createdAt)}
            </p>
          </div>
        </div>

        {canDelete && (
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
                <AlertDialogTitle>Delete this announcement?</AlertDialogTitle>
                <AlertDialogDescription>
                  Students will no longer be able to see &quot;{message.title}
                  &quot;. This can&apos;t be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
                            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deleteMessage.isPending}
                  onClick={() =>
                    deleteMessage.mutate(message.id, {
                      onSuccess: () => toast.success("Announcement deleted"),
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
    </Card>
  )
}
