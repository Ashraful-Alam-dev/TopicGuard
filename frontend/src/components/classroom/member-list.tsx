import { Crown } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils-format"
import type { User } from "@/lib/types"

export function MemberList({
  members,
  monitorId,
}: {
  members: User[]
  monitorId: string
}) {
  return (
    <ul className="flex flex-col gap-1">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/60"
        >
          <Avatar size="sm">
            <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-sm font-medium text-foreground">
                {member.name}
              </p>
              {member.id === monitorId && (
                <Crown className="size-3.5 shrink-0 text-warning" />
              )}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {member.email}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
