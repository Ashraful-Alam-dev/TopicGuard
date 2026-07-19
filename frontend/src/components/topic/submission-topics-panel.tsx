"use client"

import { Tag } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSubmissionTopics } from "@/lib/hooks/use-topics"
import { getInitials, formatDateTime } from "@/lib/utils-format"

export function SubmissionTopicsPanel({
  submissionId,
}: {
  submissionId: string
}) {
  const { data, isLoading } = useSubmissionTopics(submissionId)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!data || data.topics.length === 0) {
    return (
      <EmptyState
        icon={Tag}
        title="No topics registered yet"
        description="Registered topics will show up here as students submit them."
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <Badge variant="secondary" className="w-fit gap-1">
        <Tag className="size-3" />
        {data.totalTopics} {data.totalTopics === 1 ? "topic" : "topics"}
      </Badge>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead className="text-right">Registered</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar size="sm">
                    <AvatarFallback>
                      {getInitials(topic.student.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {topic.student.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {topic.student.email}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {topic.originalTitle}
              </TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {formatDateTime(topic.createdAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
