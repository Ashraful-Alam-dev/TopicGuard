"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useJoinClassroom } from "@/lib/hooks/use-classrooms"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  joinClassroomSchema,
  type JoinClassroomFormValues,
} from "@/lib/validation/classroom"

export function JoinClassroomDialog() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const joinClassroom = useJoinClassroom()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JoinClassroomFormValues>({
    resolver: zodResolver(joinClassroomSchema),
  })

  function onSubmit(values: JoinClassroomFormValues) {
    joinClassroom.mutate(values.joinCode, {
      onSuccess: (classroom) => {
        toast.success(`Joined ${classroom.name}`)
        setOpen(false)
        reset()
        router.push(`/classrooms/${classroom.id}`)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button variant="outline">
            <KeyRound />
            Join with code
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Join a classroom</DialogTitle>
            <DialogDescription>
              Enter the 8-character code your monitor shared with you.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="joinCode" className="sr-only">
              Join code
            </Label>
            <Input
              id="joinCode"
              placeholder="A1B2C3D4"
              maxLength={8}
              autoCapitalize="characters"
              autoComplete="off"
              className="text-center font-mono text-lg tracking-[0.3em] uppercase"
              aria-invalid={!!errors.joinCode}
              {...register("joinCode")}
            />
            {errors.joinCode && (
              <p className="mt-1.5 text-center text-xs text-destructive">
                {errors.joinCode.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={joinClassroom.isPending}>
              {joinClassroom.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Join classroom
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
