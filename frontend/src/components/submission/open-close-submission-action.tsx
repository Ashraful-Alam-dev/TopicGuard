"use client"

import { Loader2, Lock, LockOpen } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import {
  useCloseSubmission,
  useOpenSubmission,
} from "@/lib/hooks/use-submissions"
import { getApiErrorMessage } from "@/lib/api/client"
import type { Submission } from "@/lib/types"

export function OpenCloseSubmissionAction({
  submission,
}: {
  submission: Submission
}) {
  const open = useOpenSubmission(submission.id, submission.classroomId)
  const close = useCloseSubmission(submission.id, submission.classroomId)

  if (!submission.isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={open.isPending}
        onClick={() =>
          open.mutate(undefined, {
            onSuccess: () => toast.success("Submission reopened"),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      >
        {open.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <LockOpen />
        )}
        Reopen
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Lock />
            Close
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Close this submission?</AlertDialogTitle>
          <AlertDialogDescription>
            Students will no longer be able to register, edit, or delete
            their topic for &quot;{submission.title}&quot;. You can reopen it
            at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={close.isPending}
            onClick={() =>
              close.mutate(undefined, {
                onSuccess: () => toast.success("Submission closed"),
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }
          >
            {close.isPending && <Loader2 className="size-4 animate-spin" />}
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
