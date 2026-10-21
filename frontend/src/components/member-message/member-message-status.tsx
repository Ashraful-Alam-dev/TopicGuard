import { CheckCheck, Clock } from "lucide-react"

import { Badge } from "@/components/ui/badge"

export function MemberMessageStatus({
  replied,
  audience,
}: {
  replied: boolean
  /** "monitor" sees what still needs their attention. */
  audience: "member" | "monitor"
}) {
  if (replied) {
    return (
      <Badge variant="secondary" className="gap-1">
        <CheckCheck className="size-3" />
        Replied
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Clock className="size-3" />
      {audience === "monitor" ? "Needs reply" : "Awaiting reply"}
    </Badge>
  )
}
