"use client"

import { ClipboardList } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { SubmissionCard } from "@/components/submission/submission-card"
import { useSubmissions } from "@/lib/hooks/use-submissions"

export function SubmissionList({
  classroomId,
  isMonitor,
}: {
  classroomId: string
  isMonitor: boolean
}) {
  const { data: submissions, isLoading } = useSubmissions(classroomId)

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="No submissions yet"
        description={
          isMonitor
            ? "Create a submission to let students register a topic."
            : "Your monitor hasn't opened any submissions yet."
        }
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {submissions.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  )
}
