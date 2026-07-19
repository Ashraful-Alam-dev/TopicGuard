"use client"

import * as React from "react"
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
import { useCreateSubmission } from "@/lib/hooks/use-submissions"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  createSubmissionSchema,
  type CreateSubmissionFormValues,
} from "@/lib/validation/submission"

export function CreateSubmissionDialog({
  classroomId,
}: {
  classroomId: string
}) {
  const [open, setOpen] = React.useState(false)
  const createSubmission = useCreateSubmission(classroomId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSubmissionFormValues>({
    resolver: zodResolver(createSubmissionSchema),
  })

  function onSubmit(values: CreateSubmissionFormValues) {
    createSubmission.mutate(
      {
        ...values,
        description: values.description || undefined,
        openDate: new Date(values.openDate).toISOString(),
        closeDate: new Date(values.closeDate).toISOString(),
      },
      {
        onSuccess: () => {
          toast.success("Submission created")
          setOpen(false)
          reset()
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
          <Button size="sm">
            <Plus />
            New submission
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Create a submission</DialogTitle>
            <DialogDescription>
              Students can register a topic while it&apos;s open, between
              the dates below.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="submission-title">Title</Label>
              <Input
                id="submission-title"
                placeholder="Final project proposal"
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
              <Label htmlFor="submission-description">
                Description{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="submission-description"
                placeholder="Instructions or scope for this submission..."
                rows={3}
                {...register("description")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="submission-open-date">Opens</Label>
                <Input
                  id="submission-open-date"
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
                <Label htmlFor="submission-close-date">Closes</Label>
                <Input
                  id="submission-close-date"
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
            <Button type="submit" disabled={createSubmission.isPending}>
              {createSubmission.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Create submission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
