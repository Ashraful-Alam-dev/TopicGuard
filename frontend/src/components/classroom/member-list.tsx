import { CrownIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Classroom } from "@/types/classroom";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function MemberList({ classroom }: { classroom: Classroom }) {
  const members = classroom.members ?? [];

  return (
    <ul className="flex flex-col divide-y divide-border">
      {members.map((member) => {
        const isMonitor = member.id === classroom.monitor.id;
        return (
          <li key={member.id} className="flex items-center gap-3 py-3">
            <Avatar>
              <AvatarFallback>{initials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{member.name}</p>
              <p className="truncate text-xs text-muted-foreground">{member.email}</p>
            </div>
            {isMonitor && (
              <Badge variant="secondary" className="shrink-0 gap-1">
                <CrownIcon className="text-warning" />
                Monitor
              </Badge>
            )}
          </li>
        );
      })}
    </ul>
  );
}
