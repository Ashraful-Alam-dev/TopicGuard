import type { LucideIcon } from "lucide-react"

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-accent">
        <Icon className="size-5 text-accent-foreground" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-foreground">{title}</h3>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
