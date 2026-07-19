import Link from "next/link"
import { ChevronRight, Lock, LockOpen } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { formatDateTime } from "@/lib/utils-format"
import type { Submission } from "@/lib/types"

export function SubmissionCard({ submission }: { submission: Submission }) {
  return (
    <Link href={`/submissions/${submission.id}`} className="block">
      <Card className="group px-4 transition-all duration-200 hover:shadow-md hover:ring-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold text-foreground">
              {submission.title}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatDateTime(submission.openDate)} –{" "}
              {formatDateTime(submission.closeDate)}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>

        <div className="mt-3">
          {submission.isOpen ? (
            <Badge variant="secondary" className="gap-1">
              <LockOpen className="size-3" />
              Open
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Lock className="size-3" />
              Closed
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  )
}
