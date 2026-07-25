"use client"

import { Loader2, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

interface ConsultAiButtonProps {
  /** True once length/duplicate/cooldown conditions all pass. */
  active: boolean
  isPending: boolean
  /** Seconds left in the post-click cooldown, 0 when idle. */
  cooldownRemaining: number
  onClick: () => void
}

/**
 * Floating trigger rendered inside the title input's right edge. Purely
 * presentational — TopicPanel owns the activation/cooldown state and
 * passes it down, since that logic is shared with the rest of the form.
 */
export function ConsultAiButton({
  active,
  isPending,
  cooldownRemaining,
  onClick,
}: ConsultAiButtonProps) {
  const onCooldown = cooldownRemaining > 0
  const disabled = !active || isPending || onCooldown

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label="Consult AI for feedback on this topic"
      title={
        onCooldown
          ? `Consult AI is cooling down (${cooldownRemaining}s)`
          : "Consult AI for feedback on this topic"
      }
      className={cn(
        "absolute top-1/2 right-1 flex h-6 -translate-y-1/2 items-center gap-1 rounded-md px-1.5 text-[0.7rem] font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground",
        "disabled:pointer-events-none disabled:opacity-40",
        active && !disabled && "text-primary hover:text-primary",
      )}
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {onCooldown ? `${cooldownRemaining}s` : "Consult AI"}
    </button>
  )
}
