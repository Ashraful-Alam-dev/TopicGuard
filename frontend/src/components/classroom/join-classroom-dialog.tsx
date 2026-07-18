"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LogInIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useJoinClassroom } from "@/hooks/use-classrooms";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  joinCode: z
    .string()
    .length(8, "Join code must be exactly 8 characters")
    .transform((value) => value.toUpperCase()),
});

type FormValues = z.infer<typeof schema>;

export function JoinClassroomDialog() {
  const [open, setOpen] = React.useState(false);
  const joinClassroom = useJoinClassroom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { joinCode: "" },
  });

  function onSubmit(values: FormValues) {
    joinClassroom.mutate(
      { joinCode: values.joinCode },
      {
        onSuccess: () => {
          toast.success("Joined classroom");
          setOpen(false);
          reset();
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't join that classroom",
          );
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" />}>
        <LogInIcon />
        Join with code
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Join a classroom</DialogTitle>
            <DialogDescription>
              Ask the monitor for the 8-character join code.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5 py-4">
            <Label htmlFor="joinCode">Join code</Label>
            <Input
              id="joinCode"
              placeholder="A3F9K2QP"
              maxLength={8}
              autoComplete="off"
              className="font-mono uppercase tracking-widest"
              aria-invalid={Boolean(errors.joinCode)}
              {...register("joinCode")}
            />
            {errors.joinCode && (
              <p className="text-xs text-destructive">{errors.joinCode.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={joinClassroom.isPending}>
              {joinClassroom.isPending ? "Joining…" : "Join classroom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
