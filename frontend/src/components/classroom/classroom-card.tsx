import Link from "next/link"
import { Archive, ChevronRight, Crown, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { Classroom } from "@/lib/types"

export function ClassroomCard({ classroom }: { classroom: Classroom }) {
  return (
    <Link href={`/classrooms/${classroom.id}`} className="block">
      <Card className="group px-4 transition-all duration-200 hover:shadow-md hover:ring-primary/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-[15px] font-semibold text-foreground">
                {classroom.name}
              </p>
              {classroom.isMonitor && (
                <Crown className="size-3.5 shrink-0 text-warning" />
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {classroom.courseCode}
            </p>
          </div>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
        </div>

        <div className="mt-3 flex items-center gap-2">
          {classroom.isArchived && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <Archive className="size-3" />
              Archived
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Users className="size-3" />
            {classroom.memberCount}
          </Badge>
        </div>
      </Card>
    </Link>
  )
}
