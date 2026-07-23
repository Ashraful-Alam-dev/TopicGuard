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
import { SimilarityConfirmDialog } from "@/components/topic/similarity-confirm-dialog"
import {
  useCheckSimilarity,
  useDeleteOwnTopic,
  useOwnTopic,
  useRegisterTopic,
  useUpdateOwnTopic,
  useTopicAvailability,
} from "@/lib/hooks/use-topics"
import { TopicSimilarityCard } from "@/components/topic/topic-similarity-card"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { getApiErrorMessage } from "@/lib/api/client"
import { topicSchema, type TopicFormValues } from "@/lib/validation/topic"
import type { SimilarTopic, Submission } from "@/lib/types"

export function TopicPanel({ submission }: { submission: Submission }) {
  const { data: topic, isLoading } = useOwnTopic(submission.id)
  const registerTopic = useRegisterTopic(submission.id)
  const updateTopic = useUpdateOwnTopic(submission.id)
  const deleteTopic = useDeleteOwnTopic(submission.id)
  const checkSimilarity = useCheckSimilarity(submission.id)
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

  const [pendingValues, setPendingValues] =
    React.useState<TopicFormValues | null>(null)
  const [similarTopics, setSimilarTopics] = React.useState<SimilarTopic[]>([])

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

  function saveTopic(values: TopicFormValues) {
    if (topic) {
      updateTopic.mutate(values, {
        onSuccess: () => {
          toast.success("Topic updated")
          setIsEditing(false)
          setPendingValues(null)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
    } else {
      registerTopic.mutate(values, {
        onSuccess: () => {
          toast.success("Topic registered")
          setPendingValues(null)
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
    }
  }

  function onSubmit(values: TopicFormValues) {
    if (availability && !availability.available) {
      return
    }

    checkSimilarity.mutate(values.title, {
      onSuccess: (result) => {
        if (result.isDuplicate) {
          toast.error(
            result.duplicate
              ? `"${result.duplicate.title}" has already been registered by ${result.duplicate.studentName}.`
              : "This topic has already been registered.",
          )
          return
        }

        if (result.similarTopics && result.similarTopics.length > 0) {
          setSimilarTopics(result.similarTopics)
          setPendingValues(values)
          return
        }

        // No overlap at all — nothing to confirm, save straight away.
        saveTopic(values)
      },
      onError: (error) => toast.error(getApiErrorMessage(error)),
    })
  }

  function handleSubmitAnyway() {
    if (pendingValues) {
      saveTopic(pendingValues)
    }
  }

  function handleGoBackToEdit() {
    setPendingValues(null)
    setSimilarTopics([])
  }

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />
  }

  const isSaving = registerTopic.isPending || updateTopic.isPending
  const isCheckingSimilarity = checkSimilarity.isPending

  if (topic && !isEditing) {
    return (
      <div className="space-y-3">
        <TopicSimilarityCard
          topic={{
            ...topic,
            highestSimilarity: topic.highestSimilarity,
            similarTopics: topic.similarTopics,
            student: {
              id: topic.studentId,
              name: "You",
              email: "",
              avatarUrl: null,
            },
          }}
          showStudent={false}
        />

        {canManage && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="mr-2 size-4" />
              Edit
            </Button>

            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                }
              />

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete your topic?
                  </AlertDialogTitle>

                  <AlertDialogDescription>
                    You'll need to register a new topic if you
                    change your mind.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    disabled={deleteTopic.isPending}
                    onClick={() =>
                      deleteTopic.mutate(undefined, {
                        onSuccess: () =>
                          toast.success("Topic deleted"),
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
    <>
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
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || isCheckingSimilarity}
            >
              {(isSaving || isCheckingSimilarity) && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isCheckingSimilarity
                ? "Checking for similar topics..."
                : topic
                  ? "Save changes"
                  : "Register topic"}
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

      <SimilarityConfirmDialog
        open={!!pendingValues}
        onOpenChange={(open) => {
          if (!open) handleGoBackToEdit()
        }}
        similarTopics={similarTopics}
        onConfirm={handleSubmitAnyway}
        onGoBack={handleGoBackToEdit}
        isSubmitting={isSaving}
      />
    </>
  )
}
