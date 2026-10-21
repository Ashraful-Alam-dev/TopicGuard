"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, MessageSquarePlus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { useSendMemberMessage } from "@/lib/hooks/use-member-messages"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  memberMessageSchema,
  type MemberMessageFormValues,
} from "@/lib/validation/member-message"

export function SendMemberMessageDialog({
  classroomId,
}: {
  classroomId: string
}) {
  const [open, setOpen] = React.useState(false)
  const sendMessage = useSendMemberMessage(classroomId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MemberMessageFormValues>({
    resolver: zodResolver(memberMessageSchema),
  })

  function onSubmit(values: MemberMessageFormValues) {
    sendMessage.mutate(values.content, {
      onSuccess: () => {
        toast.success("Message sent to your CR")
        setOpen(false)
        reset()
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
          <Button variant="outline" size="sm">
            <MessageSquarePlus />
            Message CR
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Message your CR</DialogTitle>
            <DialogDescription>
              Only the classroom monitor (CR) can see this message. Use it
              for questions about topics, deadlines or submissions. Their
              reply will appear under your messages.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="member-message-content">Message</Label>
              <Textarea
                id="member-message-content"
                placeholder="Write your question or request..."
                rows={5}
                aria-invalid={!!errors.content}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-xs text-destructive">
                  {errors.content.message}
                </p>
              )}
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
            <Button type="submit" disabled={sendMessage.isPending}>
              {sendMessage.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
