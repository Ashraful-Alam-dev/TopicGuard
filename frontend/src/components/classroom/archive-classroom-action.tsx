"use client"

import { Archive, ArchiveRestore, Loader2 } from "lucide-react"
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
  useArchiveClassroom,
  useUnarchiveClassroom,
} from "@/lib/hooks/use-classrooms"
import { getApiErrorMessage } from "@/lib/api/client"
import type { Classroom } from "@/lib/types"

export function ArchiveClassroomAction({ classroom }: { classroom: Classroom }) {
  const archive = useArchiveClassroom(classroom.id)
  const unarchive = useUnarchiveClassroom(classroom.id)

  if (classroom.isArchived) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={unarchive.isPending}
        onClick={() =>
          unarchive.mutate(undefined, {
            onSuccess: () => toast.success("Classroom unarchived"),
            onError: (error) => toast.error(getApiErrorMessage(error)),
          })
        }
      >
        {unarchive.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <ArchiveRestore />
        )}
        Unarchive
      </Button>
    )
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Archive />
            Archive
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive this classroom?</AlertDialogTitle>
          <AlertDialogDescription>
            {classroom.name} becomes read-only — no edits, joins, or monitor
            changes — until you unarchive it. You can unarchive it at any time.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={archive.isPending}
            onClick={() =>
              archive.mutate(undefined, {
                onSuccess: () => toast.success("Classroom archived"),
                onError: (error) => toast.error(getApiErrorMessage(error)),
              })
            }
          >
            {archive.isPending && <Loader2 className="size-4 animate-spin" />}
            Archive
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
