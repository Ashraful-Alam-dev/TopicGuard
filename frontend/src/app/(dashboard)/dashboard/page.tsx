"use client";

import { BookOpenIcon } from "lucide-react";
import { useClassrooms } from "@/hooks/use-classrooms";
import { ClassroomCard } from "@/components/classroom/classroom-card";
import { CreateClassroomDialog } from "@/components/classroom/create-classroom-dialog";
import { JoinClassroomDialog } from "@/components/classroom/join-classroom-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DashboardPage() {
  const { data: classrooms, isLoading, isError } = useClassrooms();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl">Your classrooms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Classrooms you monitor or have joined.
          </p>
        </div>
        <div className="flex gap-2">
          <JoinClassroomDialog />
          <CreateClassroomDialog />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load your classrooms</AlertTitle>
          <AlertDescription>Refresh the page to try again.</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && classrooms?.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <BookOpenIcon className="size-8 text-muted-foreground" />
          <p className="font-medium">No classrooms yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a classroom to start as its monitor, or join one with a
            code from your instructor.
          </p>
        </div>
      )}

      {!isLoading && !isError && classrooms && classrooms.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      )}
    </div>
  );
}
