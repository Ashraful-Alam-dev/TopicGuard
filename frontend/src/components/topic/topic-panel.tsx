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
import { TopicMemberPicker } from "@/components/topic/topic-member-picker"
import {
  useCheckSimilarity,
  useDeleteOwnTopic,
  useOwnTopic,
  useRegisterTopic,
  useUpdateOwnTopic,
  useTopicAvailability,
} from "@/lib/hooks/use-topics"
import { useAuth } from "@/lib/hooks/use-auth"
import { TopicSimilarityCard } from "@/components/topic/topic-similarity-card"
import { ConsultAiButton } from "@/components/topic/consult-ai-button"
import { ConsultAiCard } from "@/components/topic/consult-ai-card"
import { useConsultAi } from "@/lib/hooks/use-consult-ai"
import {
  getConsultAiErrorMessage,
  isConsultAiDailyLimitError,
} from "@/lib/consult-ai/get-error-message"
import {
  CONSULT_AI_COOLDOWN_SECONDS,
  CONSULT_AI_MIN_TITLE_LENGTH,
  CONSULT_AI_TITLE_MAX_LENGTH,
} from "@/lib/consult-ai/constants"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { getApiErrorMessage } from "@/lib/api/client"
import { topicSchema, type TopicFormValues } from "@/lib/validation/topic"
import type {
  ConsultAiResult,
  SimilarTopic,
  Submission,
  TopicMember,
} from "@/lib/types"

export function TopicPanel({ submission }: { submission: Submission }) {
  const { user } = useAuth()
  const { data: topic, isLoading } = useOwnTopic(submission.id)
  const registerTopic = useRegisterTopic(submission.id)
  const updateTopic = useUpdateOwnTopic(submission.id)
  const deleteTopic = useDeleteOwnTopic(submission.id)
  const checkSimilarity = useCheckSimilarity(submission.id)
  const [isEditing, setIsEditing] = React.useState(false)

  // A student without a topic yet is always their own future leader. Once a
  // topic exists, only the student who registered it may manage it — a
  // team member can view but not edit/delete/change membership.
  const isLeader =
    !topic || !topic.isTeamTopic || topic.leader.id === user?.id

  const [selectedMembers, setSelectedMembers] = React.useState<TopicMember[]>(
    topic?.members ?? [],
  )

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
    topic?.id,
  )

  const [pendingValues, setPendingValues] =
    React.useState<TopicFormValues | null>(null)
  const [similarTopics, setSimilarTopics] = React.useState<SimilarTopic[]>([])

  // --- Consult AI (optional, non-blocking) -------------------------------
  const consultAi = useConsultAi()
  const [consultResult, setConsultResult] =
    React.useState<ConsultAiResult | null>(null)
  const [consultError, setConsultError] = React.useState<string | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = React.useState(0)
  // Sticky for the rest of the session once the per-user daily cap is hit —
  // no point letting the 30s cooldown re-enable a button that will just
  // 429 again immediately.
  const [dailyLimitReached, setDailyLimitReached] = React.useState(false)
  const cooldownIntervalRef = React.useRef<
    ReturnType<typeof setInterval> | null
  >(null)

  React.useEffect(() => {
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current)
      }
    }
  }, [])

  function startConsultAiCooldown() {
    setCooldownRemaining(CONSULT_AI_COOLDOWN_SECONDS)

    if (cooldownIntervalRef.current) {
      clearInterval(cooldownIntervalRef.current)
    }

    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) {
            clearInterval(cooldownIntervalRef.current)
          }
          return 0
        }

        return prev - 1
      })
    }, 1000)
  }

  function dismissConsultAi() {
    setConsultResult(null)
    setConsultError(null)
  }

  function useRecommendedTopic(recommendedTitle: string) {
    setTitle(recommendedTitle)

    reset({
      title: recommendedTitle,
    })

    dismissConsultAi()
  }

  // Activation conditions #1 and #2 from the spec — cooldown (#3) and the
  // in-flight request are handled separately by ConsultAiButton so a stale
  // "active" value can't race a click that's already cooling down.
  const isTitleLongEnough =
    title.trim().length > CONSULT_AI_MIN_TITLE_LENGTH

  const isConfirmedNotDuplicate =
    title === debouncedTitle &&
    !isCheckingAvailability &&
    !!availability?.available

  const consultAiActive =
    isTitleLongEnough && isConfirmedNotDuplicate

  function handleConsultAi() {
    if (
      !consultAiActive ||
      cooldownRemaining > 0 ||
      consultAi.isPending
    ) {
      return
    }

    // Cooldown starts immediately on click, independent of the request's
    // own outcome — this is spam/rate-limit protection, not a loading state.
    startConsultAiCooldown()
    setConsultError(null)

    consultAi.mutate(
      {
        submissionId: submission.id,
        title: title.trim().slice(0, CONSULT_AI_TITLE_MAX_LENGTH),
      },
      {
        onSuccess: (data) => {
          setConsultResult(data)
          setConsultError(null)
        },
        onError: (error) => {
          setConsultResult(null)
          setConsultError(getConsultAiErrorMessage(error))
          if (isConsultAiDailyLimitError(error)) {
            setDailyLimitReached(true)
          }
        },
      },
    )
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TopicFormValues>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      title: "",
    },
  })

  /*
   * Keep the form synchronized only when the actual topic changes.
   *
   * Do NOT use `values: { title: ... }` here. That would cause React Hook
   * Form to overwrite the title whenever TopicPanel re-renders, such as
   * when team members are selected or deselected.
   */
  React.useEffect(() => {
    const currentTitle = topic?.originalTitle ?? ""

    setTitle(currentTitle)

    reset({
      title: currentTitle,
    })

    setSelectedMembers(topic?.members ?? [])
  }, [topic?.id, topic?.originalTitle, reset])

  const canManage = submission.isOpen

  function saveTopic(values: TopicFormValues) {
    const payload = {
      ...values,
      memberIds: selectedMembers.map((member) => member.id),
    }

    if (topic) {
      updateTopic.mutate(payload, {
        onSuccess: () => {
          toast.success("Topic updated")
          setIsEditing(false)
          setPendingValues(null)
          dismissConsultAi()
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
    } else {
      registerTopic.mutate(payload, {
        onSuccess: () => {
          toast.success("Topic registered")
          setPendingValues(null)
          dismissConsultAi()
        },
        onError: (error) => toast.error(getApiErrorMessage(error)),
      })
    }
  }

  function onSubmit(values: TopicFormValues) {
    if (availability && !availability.available) {
      return
    }

    checkSimilarity.mutate(
      {
        title: values.title,
        topicId: topic?.id,
      },
      {
        onSuccess: (result) => {
          if (result.isDuplicate) {
            toast.error(
              result.duplicate
                ? `"${result.duplicate.title}" has already been registered by ${result.duplicate.studentName}.`
                : "This topic has already been registered.",
            )
            return
          }

          if (
            result.similarTopics &&
            result.similarTopics.length > 0
          ) {
            setSimilarTopics(result.similarTopics)
            setPendingValues(values)
            return
          }

          // No overlap at all — nothing to confirm, save straight away.
          saveTopic(values)
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error)),
      },
    )
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

  const isSaving =
    registerTopic.isPending || updateTopic.isPending

  const isCheckingSimilarity =
    checkSimilarity.isPending

  if (topic && !isEditing) {
    return (
      <>
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

        {canManage && isLeader && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTitle(topic.originalTitle)
                reset({
                  title: topic.originalTitle,
                })
                setSelectedMembers(topic.members)
                setIsEditing(true)
                dismissConsultAi()
              }}
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
                    You&apos;ll need to register a new topic if you
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
                          toast.error(
                            getApiErrorMessage(error),
                          ),
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
      </>
    )
  }

  if (!topic && !canManage) {
    return (
      <Card className="px-4">
        <p className="text-sm text-muted-foreground">
          This submission is closed and you didn&apos;t register a
          topic while it was open.
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

            <div className="relative">
              <Input
                id="topic-title"
                placeholder="e.g. Real-time collaborative editing with CRDTs"
                aria-invalid={!!errors.title}
                className="pr-24"
                {...register("title")}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                }}
              />
              <ConsultAiButton
                active={consultAiActive}
                isPending={consultAi.isPending}
                cooldownRemaining={cooldownRemaining}
                dailyLimitReached={dailyLimitReached}
                onClick={handleConsultAi}
              />
            </div>

            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}

            {!errors.title &&
              debouncedTitle.trim().length > 2 && (
                <>
                  {isCheckingAvailability && (
                    <p className="text-xs text-muted-foreground">
                      Checking topic availability...
                    </p>
                  )}

                  {!isCheckingAvailability &&
                    availability?.available && (
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


          {(consultResult || consultError) && (
            <ConsultAiCard
              result={consultResult}
              errorMessage={consultError}
              onUseTopic={useRecommendedTopic}
              onDismiss={dismissConsultAi}
            />
          )}

          {isLeader && (
            <TopicMemberPicker
              submissionId={submission.id}
              selected={selectedMembers}
              onChange={setSelectedMembers}
              disabled={
                isSaving || isCheckingSimilarity
              }
            />
          )}

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              size="sm"
              disabled={
                isSaving || isCheckingSimilarity
              }
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
                  setTitle(topic.originalTitle)
                  reset({
                    title: topic.originalTitle,
                  })
                  setSelectedMembers(topic.members)
                  dismissConsultAi()
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
          if (!open) {
            handleGoBackToEdit()
          }
        }}
        similarTopics={similarTopics}
        onConfirm={handleSubmitAnyway}
        onGoBack={handleGoBackToEdit}
        isSubmitting={isSaving}
      />
    </>
  )
}