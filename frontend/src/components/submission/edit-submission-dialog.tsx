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
import { useUpdateSubmission } from "@/lib/hooks/use-submissions"
import { getApiErrorMessage } from "@/lib/api/client"
import { toDatetimeLocalValue } from "@/lib/utils-format"
import {
  createSubmissionSchema,
  type CreateSubmissionFormValues,
} from "@/lib/validation/submission"
import type { Submission } from "@/lib/types"

export function EditSubmissionDialog({
  submission,
}: {
  submission: Submission
}) {
  const [open, setOpen] = React.useState(false)
  const updateSubmission = useUpdateSubmission(
    submission.id,
    submission.classroomId
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubmissionFormValues>({
    resolver: zodResolver(createSubmissionSchema),
    defaultValues: {
      title: submission.title,
      description: submission.description ?? "",
      openDate: toDatetimeLocalValue(submission.openDate),
      closeDate: toDatetimeLocalValue(submission.closeDate),
    },
  })

  function onSubmit(values: CreateSubmissionFormValues) {
    updateSubmission.mutate(
      {
        ...values,
        description: values.description || undefined,
        openDate: new Date(values.openDate).toISOString(),
        closeDate: new Date(values.closeDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Submission updated")
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
            <DialogTitle>Edit submission</DialogTitle>
            <DialogDescription>
              Update the title, description, or open/close window.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-submission-title">Title</Label>
              <Input
                id="edit-submission-title"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-destructive">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-submission-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="edit-submission-description"
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-submission-open-date">Opens</Label>
                <Input
                  id="edit-submission-open-date"
                  type="datetime-local"
                  aria-invalid={!!errors.openDate}
                  {...register("openDate")}
                />
                {errors.openDate && (
                  <p className="text-xs text-destructive">
                    {errors.openDate.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-submission-close-date">Closes</Label>
                <Input
                  id="edit-submission-close-date"
                  type="datetime-local"
                  aria-invalid={!!errors.closeDate}
                  {...register("closeDate")}
                />
                {errors.closeDate && (
                  <p className="text-xs text-destructive">
                    {errors.closeDate.message}
                  </p>
                )}
              </div>
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
            <Button type="submit" disabled={updateSubmission.isPending}>
              {updateSubmission.isPending && (
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
