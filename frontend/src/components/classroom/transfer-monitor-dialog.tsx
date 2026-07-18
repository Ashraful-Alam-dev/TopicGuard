"use client";

import * as React from "react";
import { CrownIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTransferMonitor } from "@/hooks/use-classrooms";
import { ApiError } from "@/lib/api-client";
import { Classroom } from "@/types/classroom";
import { User } from "@/types/user";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TransferMonitorDialog({ classroom }: { classroom: Classroom }) {
  const [open, setOpen] = React.useState(false);
  const [candidate, setCandidate] = React.useState<User | null>(null);
  const transferMonitor = useTransferMonitor(classroom.id);

  const otherMembers = (classroom.members ?? []).filter(
    (member) => member.id !== classroom.monitor.id,
  );

  function confirmTransfer() {
    if (!candidate) return;
    transferMonitor.mutate(
      { newMonitorId: candidate.id },
      {
        onSuccess: () => {
          toast.success(`${candidate.name} is now the monitor`);
          setCandidate(null);
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't transfer the monitor role",
          );
          setCandidate(null);
        },
      },
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <CrownIcon />
          Transfer monitor
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer monitor role</DialogTitle>
            <DialogDescription>
              Pick a member to become the new monitor. You&apos;ll stay a member of
              this classroom.
            </DialogDescription>
          </DialogHeader>

          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto py-2">
            {otherMembers.length === 0 ? (
              <p className="px-1.5 py-4 text-center text-sm text-muted-foreground">
                No other members to transfer to yet.
              </p>
            ) : (
              otherMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-2 rounded-lg px-1.5 py-2 hover:bg-muted/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar size="sm">
                      <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{member.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCandidate(member)}
                  >
                    <UserRoundIcon />
                    Make monitor
                  </Button>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(candidate)}
        onOpenChange={(next) => !next && setCandidate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make {candidate?.name} the monitor?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose monitor permissions for this classroom. This can be
              undone later by whoever becomes monitor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmTransfer}
              disabled={transferMonitor.isPending}
            >
              {transferMonitor.isPending ? "Transferring…" : "Transfer monitor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
