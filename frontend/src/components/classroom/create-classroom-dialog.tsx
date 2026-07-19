"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useCreateClassroom } from "@/lib/hooks/use-classrooms"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  createClassroomSchema,
  type CreateClassroomFormValues,
} from "@/lib/validation/classroom"

export function CreateClassroomDialog() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const createClassroom = useCreateClassroom()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassroomFormValues>({
    resolver: zodResolver(createClassroomSchema),
  })

  function onSubmit(values: CreateClassroomFormValues) {
    createClassroom.mutate(
      { ...values, description: values.description || undefined },
      {
        onSuccess: (classroom) => {
          toast.success("Classroom created")
          setOpen(false)
          reset()
          router.push(`/classrooms/${classroom.id}`)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      }
    )
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
          <Button>
            <Plus />
            Create classroom
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Create a classroom</DialogTitle>
            <DialogDescription>
              You&apos;ll be the monitor and get a join code to share with
              students.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Classroom name</Label>
              <Input
                id="name"
                placeholder="Senior Capstone 2026"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="courseCode">Course code</Label>
              <Input
                id="courseCode"
                placeholder="CS-499"
                aria-invalid={!!errors.courseCode}
                {...register("courseCode")}
              />
              {errors.courseCode && (
                <p className="text-xs text-destructive">
                  {errors.courseCode.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="description"
                placeholder="What this classroom is for..."
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createClassroom.isPending}>
              {createClassroom.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Create classroom
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
