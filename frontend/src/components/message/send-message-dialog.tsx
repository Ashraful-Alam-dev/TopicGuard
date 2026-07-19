"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Megaphone } from "lucide-react"
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
import { useSendMessage } from "@/lib/hooks/use-messages"
import { getApiErrorMessage } from "@/lib/api/client"
import {
  createMessageSchema,
  type CreateMessageFormValues,
} from "@/lib/validation/message"

export function SendMessageDialog({ classroomId }: { classroomId: string }) {
  const [open, setOpen] = React.useState(false)
  const sendMessage = useSendMessage(classroomId)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMessageFormValues>({
    resolver: zodResolver(createMessageSchema),
  })

  function onSubmit(values: CreateMessageFormValues) {
    sendMessage.mutate(values, {
      onSuccess: () => {
        toast.success("Announcement sent")
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
            <Megaphone />
            New announcement
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Send an announcement</DialogTitle>
            <DialogDescription>
              Every member of this classroom will be able to see this
              message.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message-title">Title</Label>
              <Input
                id="message-title"
                placeholder="Class cancelled tomorrow"
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
              <Label htmlFor="message-content">Message</Label>
              <Textarea
                id="message-content"
                placeholder="Share the details..."
                rows={4}
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
