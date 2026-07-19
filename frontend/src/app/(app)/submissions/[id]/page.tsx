"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardList, Lock, LockOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { EditSubmissionDialog } from "@/components/submission/edit-submission-dialog"
import { OpenCloseSubmissionAction } from "@/components/submission/open-close-submission-action"
import { TopicPanel } from "@/components/topic/topic-panel"
import { SubmissionTopicsPanel } from "@/components/topic/submission-topics-panel"
import { useSubmission } from "@/lib/hooks/use-submissions"
import { useClassroom } from "@/lib/hooks/use-classrooms"
import { formatDateTime } from "@/lib/utils-format"

export default function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: submission, isLoading, isError } = useSubmission(id)
  const { data: classroom } = useClassroom(submission?.classroomId ?? "")

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={submission ? `/classrooms/${submission.classroomId}` : "/dashboard"}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        {classroom ? classroom.name : "Back"}
      </Link>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : isError || !submission ? (
        <EmptyState
          icon={ClipboardList}
          title="Submission not found"
          description="It may have been removed, or you don't have access to it."
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {submission.title}
                </h1>
                {submission.isOpen ? (
                  <Badge variant="secondary" className="gap-1">
                    <LockOpen className="size-3" />
                    Open
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="gap-1 text-muted-foreground"
                  >
                    <Lock className="size-3" />
                    Closed
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatDateTime(submission.openDate)} –{" "}
                {formatDateTime(submission.closeDate)}
              </p>
            </div>

            {classroom?.isMonitor && (
              <div className="flex flex-wrap items-center gap-2">
                <EditSubmissionDialog submission={submission} />
                <OpenCloseSubmissionAction submission={submission} />
              </div>
            )}
          </div>

          {submission.description && (
            <Card className="px-4">
              <p className="text-sm leading-relaxed text-foreground">
                {submission.description}
              </p>
            </Card>
          )}

          <div>
            {classroom?.isMonitor ? (
              <>
                <div>
                  <h2 className="text-sm font-medium">Your topic</h2>
                  <Separator className="my-3" />
                  <TopicPanel submission={submission} />
                </div>

                <div className="mt-8">
                  <h2 className="text-sm font-medium">Registered topics</h2>
                  <Separator className="my-3" />
                  <SubmissionTopicsPanel submissionId={submission.id} />
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-sm font-medium">Your topic</h2>
                <Separator className="my-3" />
                <TopicPanel submission={submission} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
