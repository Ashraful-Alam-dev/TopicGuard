"use client"

import * as React from "react"
import { Loader2, Crown } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useTransferMonitor } from "@/lib/hooks/use-classrooms"
import { getApiErrorMessage } from "@/lib/api/client"
import type { Classroom, User } from "@/lib/types"

export function TransferMonitorDialog({
  classroom,
  members,
}: {
  classroom: Classroom
  members: User[]
}) {
  const [open, setOpen] = React.useState(false)
  const [newMonitorId, setNewMonitorId] = React.useState<string | null>(null)
  const transferMonitor = useTransferMonitor(classroom.id)

  const candidates = members.filter((m) => m.id !== classroom.monitor.id)

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newMonitorId) return

    transferMonitor.mutate(newMonitorId, {
      onSuccess: (updated) => {
        toast.success(`${updated.monitor.name} is now the monitor`)
        setOpen(false)
        setNewMonitorId(null)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setNewMonitorId(null)
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline" size="sm">
            <Crown />
            Transfer monitor
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Transfer monitor role</DialogTitle>
            <DialogDescription>
              The new monitor gets full control of this classroom. You&apos;ll
              remain a member.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-4">
            <Label htmlFor="new-monitor">New monitor</Label>
            {candidates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No other members have joined this classroom yet.
              </p>
            ) : (
              <select
                id="new-monitor"
                value={newMonitorId ?? ""}
                onChange={(e) => setNewMonitorId(e.target.value || null)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              >
                <option value="" disabled>
                  Choose a member
                </option>
                {candidates.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} · {member.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newMonitorId || transferMonitor.isPending}
            >
              {transferMonitor.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Transfer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
