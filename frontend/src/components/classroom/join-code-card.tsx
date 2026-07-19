"use client"

import * as React from "react"
import { Check, Copy, KeyRound } from "lucide-react"

import { Button } from "@/components/ui/button"

export function JoinCodeCard({ joinCode }: { joinCode: string }) {
  const [copied, setCopied] = React.useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(joinCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access can fail (e.g. insecure context); silently ignore,
      // the code is still visible for manual copying.
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-accent">
          <KeyRound className="size-4 text-accent-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Join code</p>
          <p className="font-mono text-base font-semibold tracking-[0.25em] text-foreground">
            {joinCode}
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="text-success" /> : <Copy />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}
