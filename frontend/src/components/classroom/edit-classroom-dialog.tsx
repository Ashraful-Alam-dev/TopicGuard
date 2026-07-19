"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil } from "lucide-react"
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
import { useUpdateClassroom } from "@/lib/hooks/use-classrooms"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  createClassroomSchema,
  type CreateClassroomFormValues,
} from "@/lib/validation/classroom"
import type { Classroom } from "@/lib/types"

export function EditClassroomDialog({ classroom }: { classroom: Classroom }) {
  const [open, setOpen] = React.useState(false)
  const updateClassroom = useUpdateClassroom(classroom.id)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClassroomFormValues>({
    resolver: zodResolver(createClassroomSchema),
    defaultValues: {
      name: classroom.name,
      courseCode: classroom.courseCode,
      description: classroom.description ?? "",
    },
  })

  function onSubmit(values: CreateClassroomFormValues) {
    updateClassroom.mutate(
      { ...values, description: values.description || undefined },
      {
        onSuccess: () => {
          toast.success("Classroom updated")
          setOpen(false)
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
          <Button variant="outline" size="sm">
            <Pencil />
            Edit
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Edit classroom</DialogTitle>
            <DialogDescription>
              Update the name, course code, or description.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Classroom name</Label>
              <Input
                id="edit-name"
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
              <Label htmlFor="edit-courseCode">Course code</Label>
              <Input
                id="edit-courseCode"
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
              <Label htmlFor="edit-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea id="edit-description" rows={3} {...register("description")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateClassroom.isPending}>
              {updateClassroom.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
