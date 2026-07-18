"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ClipboardIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useClassroom } from "@/hooks/use-classrooms";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MemberList } from "@/components/classroom/member-list";
import { EditClassroomDialog } from "@/components/classroom/edit-classroom-dialog";
import { ArchiveClassroomAction } from "@/components/classroom/archive-classroom-action";
import { TransferMonitorDialog } from "@/components/classroom/transfer-monitor-dialog";
import { ApiError } from "@/lib/api-client";

export default function ClassroomDetailPage({
  params,
}: {
  params: Promise<{ classroomId: string }>;
}) {
  const { classroomId } = use(params);
  const { data: classroom, isLoading, isError, error } = useClassroom(classroomId);

  function copyJoinCode() {
    if (!classroom) return;
    navigator.clipboard.writeText(classroom.joinCode);
    toast.success("Join code copied");
  }

  return (
    <div className="flex flex-col">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to classrooms
        </Link>

        {isLoading && (
          <div className="flex flex-col gap-4">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        )}

        {isError && (
          <Alert variant="destructive">
            <AlertTitle>Couldn&apos;t load this classroom</AlertTitle>
            <AlertDescription>
              {error instanceof ApiError
                ? error.message
                : "It may not exist, or you may not have access to it."}
            </AlertDescription>
          </Alert>
        )}

        {classroom && (
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <CardTitle className="text-xl">{classroom.name}</CardTitle>
                      {classroom.isArchived && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Archived
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {classroom.courseCode}
                    </CardDescription>
                  </div>

                  {classroom.isMonitor && !classroom.isArchived && (
                    <div className="flex flex-wrap gap-2">
                      <EditClassroomDialog classroom={classroom} />
                      <TransferMonitorDialog classroom={classroom} />
                      <ArchiveClassroomAction classroom={classroom} />
                    </div>
                  )}
                  {classroom.isMonitor && classroom.isArchived && (
                    <ArchiveClassroomAction classroom={classroom} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {classroom.description && (
                  <p className="text-sm text-foreground">{classroom.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <UsersIcon className="size-3.5" />
                    {classroom.memberCount}{" "}
                    {classroom.memberCount === 1 ? "member" : "members"}
                  </span>

                  {classroom.isMonitor && (
                    <button
                      type="button"
                      onClick={copyJoinCode}
                      className="flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-xs tracking-widest text-foreground transition-colors hover:bg-muted"
                    >
                      <ClipboardIcon className="size-3.5" />
                      {classroom.joinCode}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Members</CardTitle>
                <CardDescription>
                  Everyone in this classroom, including the monitor.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MemberList classroom={classroom} />
              </CardContent>
            </Card>
          </div>
        )}
    </div>
  );
}
