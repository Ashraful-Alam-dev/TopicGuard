"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft, Archive, Crown, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/empty-state"
import { JoinCodeCard } from "@/components/classroom/join-code-card"
import { MemberList } from "@/components/classroom/member-list"
import { EditClassroomDialog } from "@/components/classroom/edit-classroom-dialog"
import { TransferMonitorDialog } from "@/components/classroom/transfer-monitor-dialog"
import { ArchiveClassroomAction } from "@/components/classroom/archive-classroom-action"
import { useClassroom } from "@/lib/hooks/use-classrooms"
import { formatDate } from "@/lib/utils-format"

export default function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: classroom, isLoading, isError } = useClassroom(id)

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        All classrooms
      </Link>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : isError || !classroom ? (
        <EmptyState
          icon={Users}
          title="Classroom not found"
          description="It may have been removed, or you don't have access to it."
        />
      ) : (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">
                  {classroom.name}
                </h1>
                {classroom.isMonitor && (
                  <Crown className="size-4 shrink-0 text-warning" />
                )}
                {classroom.isArchived && (
                  <Badge variant="outline" className="gap-1 text-muted-foreground">
                    <Archive className="size-3" />
                    Archived
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {classroom.courseCode} · {classroom.memberCount}{" "}
                {classroom.memberCount === 1 ? "member" : "members"} · created{" "}
                {formatDate(classroom.createdAt)}
              </p>
            </div>

            {classroom.isMonitor && (
              <div className="flex flex-wrap items-center gap-2">
                <EditClassroomDialog classroom={classroom} />
                <TransferMonitorDialog
                  classroom={classroom}
                  members={classroom.members ?? []}
                />
                <ArchiveClassroomAction classroom={classroom} />
              </div>
            )}
          </div>

          {classroom.isMonitor && !classroom.isArchived && (
            <JoinCodeCard joinCode={classroom.joinCode} />
          )}

          {classroom.description && (
            <Card className="px-4">
              <p className="text-sm leading-relaxed text-foreground">
                {classroom.description}
              </p>
            </Card>
          )}

          <Card className="px-4">
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Members
              </h2>
            </div>
            <Separator className="my-3" />
            {classroom.members && classroom.members.length > 0 ? (
              <MemberList
                members={classroom.members}
                monitorId={classroom.monitor.id}
              />
            ) : (
              <p className="px-2 py-2 text-sm text-muted-foreground">
                No members yet.
              </p>
            )}
          </Card>
        </>
      )}
    </div>
  )
}
