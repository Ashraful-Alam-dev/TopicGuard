"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Pencil, Tag, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  useDeleteOwnTopic,
  useOwnTopic,
  useRegisterTopic,
  useUpdateOwnTopic,
  useTopicAvailability,
} from "@/lib/hooks/use-topics"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { getApiErrorMessage } from "@/lib/api/client"
import { topicSchema, type TopicFormValues } from "@/lib/validation/topic"
import type { Submission } from "@/lib/types"

export function TopicPanel({ submission }: { submission: Submission }) {
  const { data: topic, isLoading } = useOwnTopic(submission.id)
  const registerTopic = useRegisterTopic(submission.id)
  const updateTopic = useUpdateOwnTopic(submission.id)
  const deleteTopic = useDeleteOwnTopic(submission.id)
  const [isEditing, setIsEditing] = React.useState(false)

  const [title, setTitle] = React.useState(
  topic?.originalTitle ?? "",
)

const debouncedTitle = useDebounce(title, 500)

const {
  data: availability,
  isFetching: isCheckingAvailability,
} = useTopicAvailability(
  submission.id,
  debouncedTitle,
)


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    values: { title: topic?.originalTitle ?? "" },
  })

  const canManage = submission.isOpen

  function onSubmit(values: TopicFormValues) {
    if (availability && !availability.available) {
      return
    }

    if (topic) {
      updateTopic.mutate(values, {
        onSuccess: () => {
          toast.success("Topic updated")
          setIsEditing(false)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
    } else {
      registerTopic.mutate(values, {
        onSuccess: () => toast.success("Topic registered"),
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
    }
  }

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />
  }

  const isSaving = registerTopic.isPending || updateTopic.isPending

  if (topic && !isEditing) {
    return (
      <Card className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <Tag className="mt-0.5 size-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Your topic</p>
              <p className="mt-0.5 text-sm font-medium text-foreground">
                {topic.originalTitle}
              </p>
            </div>
          </div>

          {canManage && (
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your topic?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You&apos;ll need to register a new topic for this
                      submission if you change your mind.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      disabled={deleteTopic.isPending}
                      onClick={() =>
                        deleteTopic.mutate(undefined, {
                          onSuccess: () => toast.success("Topic deleted"),
                          onError: (error) =>
                            toast.error(getApiErrorMessage(error)),
                        })
                      }
                    >
                      {deleteTopic.isPending && (
                        <Loader2 className="size-4 animate-spin" />
                      )}
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </Card>
    )
  }

  if (!topic && !canManage) {
    return (
      <Card className="px-4">
        <p className="text-sm text-muted-foreground">
          This submission is closed and you didn&apos;t register a topic
          while it was open.
        </p>
      </Card>
    )
  }

  return (
    <Card className="px-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="topic-title">
            {topic ? "Edit your topic" : "Register your topic"}
          </Label>
          <Input
            id="topic-title"
            placeholder="e.g. Real-time collaborative editing with CRDTs"
            aria-invalid={!!errors.title}
            {...register("title")}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
            }}
          />
          {errors.title && (
            <p className="text-xs text-destructive">
              {errors.title.message}
            </p>
          )}

          {!errors.title && debouncedTitle.trim().length > 2 && (
            <>
              {isCheckingAvailability && (
                <p className="text-xs text-muted-foreground">
                  Checking topic availability...
                </p>
              )}

              {!isCheckingAvailability && availability?.available && (
                <p className="text-xs text-green-600">
                  ✓ Topic is available
                </p>
              )}

              {!isCheckingAvailability &&
                availability &&
                !availability.available && (
                  <p className="text-xs text-destructive">
                    This topic has already been registered by{" "}
                    <span className="font-medium">
                      {availability.student?.name}
                    </span>
                    .
                  </p>
                )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={isSaving}>
            {isSaving && <Loader2 className="size-4 animate-spin" />}
            {topic ? "Save changes" : "Register topic"}
          </Button>
          {topic && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false)
                reset({ title: topic.originalTitle })
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
