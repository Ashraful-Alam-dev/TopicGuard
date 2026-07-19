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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {user ? `Welcome back, ${user.name.split(" ")[0]}` : "Your classrooms"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Classrooms you monitor or have joined.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <JoinClassroomDialog />
          <CreateClassroomDialog />
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : classrooms && classrooms.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {classrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No classrooms yet"
          description="Create a classroom to start monitoring submissions, or join one with a code from your instructor."
          action={
            <div className="mt-2 flex items-center gap-2">
              <JoinClassroomDialog />
              <CreateClassroomDialog />
            </div>
          }
        />
      )}
    </div>
  )
}
