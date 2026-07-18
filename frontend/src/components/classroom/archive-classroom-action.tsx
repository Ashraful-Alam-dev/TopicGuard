"use client";

import * as React from "react";
import { ArchiveIcon, ArchiveRestoreIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/alert-dialog";
import { useArchiveClassroom, useUnarchiveClassroom } from "@/hooks/use-classrooms";
import { ApiError } from "@/lib/api-client";
import { Classroom } from "@/types/classroom";

export function ArchiveClassroomAction({ classroom }: { classroom: Classroom }) {
  const archiveClassroom = useArchiveClassroom(classroom.id);
  const unarchiveClassroom = useUnarchiveClassroom(classroom.id);

  if (classroom.isArchived) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          unarchiveClassroom.mutate(undefined, {
            onSuccess: () => toast.success("Classroom unarchived"),
            onError: (error) =>
              toast.error(
                error instanceof ApiError ? error.message : "Couldn't unarchive the classroom",
              ),
          })
        }
        disabled={unarchiveClassroom.isPending}
      >
        <ArchiveRestoreIcon />
        {unarchiveClassroom.isPending ? "Unarchiving…" : "Unarchive"}
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" size="sm" />}>
        <ArchiveIcon />
        Archive
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive this classroom?</AlertDialogTitle>
          <AlertDialogDescription>
            Archived classrooms become read-only — no edits, no new members,
            and the monitor role can&apos;t be transferred until it&apos;s
            unarchived.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              archiveClassroom.mutate(undefined, {
                onSuccess: () => toast.success("Classroom archived"),
                onError: (error) =>
                  toast.error(
                    error instanceof ApiError ? error.message : "Couldn't archive the classroom",
                  ),
              })
            }
            disabled={archiveClassroom.isPending}
          >
            {archiveClassroom.isPending ? "Archiving…" : "Archive classroom"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
