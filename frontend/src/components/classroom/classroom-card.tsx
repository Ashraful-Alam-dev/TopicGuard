import Link from "next/link";
import { UsersIcon, CrownIcon, ArchiveIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Classroom } from "@/types/classroom";

export function ClassroomCard({ classroom }: { classroom: Classroom }) {
  return (
    <Link href={`/classroom/${classroom.id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg">{classroom.name}</CardTitle>
            {classroom.isMonitor && (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <CrownIcon className="text-warning" />
                Monitor
              </Badge>
            )}
          </div>
          <CardDescription>{classroom.courseCode}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <UsersIcon className="size-3.5" />
            {classroom.memberCount} {classroom.memberCount === 1 ? "member" : "members"}
          </span>
          {classroom.isArchived && (
            <Badge variant="outline" className="gap-1 text-muted-foreground">
              <ArchiveIcon />
              Archived
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
