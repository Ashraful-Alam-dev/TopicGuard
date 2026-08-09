"use client"

import { BookOpen } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { ClassroomCard } from "@/components/classroom/classroom-card"
import { CreateClassroomDialog } from "@/components/classroom/create-classroom-dialog"
import { JoinClassroomDialog } from "@/components/classroom/join-classroom-dialog"
import { useAuth } from "@/lib/hooks/use-auth"
import { useClassrooms } from "@/lib/hooks/use-classrooms"

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: classrooms, isLoading } = useClassrooms()

  const hasClassrooms = classrooms && classrooms.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Your classrooms"}
          </h1>

          <p className="text-sm text-muted-foreground">
            Classrooms you monitor or have joined.
          </p>
        </div>

        {!isLoading && hasClassrooms && (
          <div className="flex items-center gap-2">
            <JoinClassroomDialog />
            <CreateClassroomDialog />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : hasClassrooms ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {classrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No classrooms yet"
          description="Create a classroom to start monitoring submissions, or join one with a code from your class monitor."
          action={
            <div className="mt-2 flex items-center justify-center gap-2">
              <JoinClassroomDialog />
              <CreateClassroomDialog />
            </div>
          }
        />
      )}
    </div>
  )
}