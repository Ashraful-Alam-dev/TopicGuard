"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateClassroom } from "@/hooks/use-classrooms";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  courseCode: z.string().min(1, "Course code is required").max(50),
  description: z.string().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function CreateClassroomDialog() {
  const [open, setOpen] = React.useState(false);
  const createClassroom = useCreateClassroom();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", courseCode: "", description: "" },
  });

  function onSubmit(values: FormValues) {
    createClassroom.mutate(
      {
        name: values.name,
        courseCode: values.courseCode,
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Classroom created");
          setOpen(false);
          reset();
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't create the classroom",
          );
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon />
        Create classroom
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Create a classroom</DialogTitle>
            <DialogDescription>
              You&apos;ll be set as the monitor. You can transfer that role later.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Classroom name</Label>
              <Input
                id="name"
                placeholder="Data Structures — Section B"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="courseCode">Course code</Label>
              <Input
                id="courseCode"
                placeholder="CS-204"
                aria-invalid={Boolean(errors.courseCode)}
                {...register("courseCode")}
              />
              {errors.courseCode && (
                <p className="text-xs text-destructive">{errors.courseCode.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="What this classroom is for…"
                rows={3}
                {...register("description")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={createClassroom.isPending}>
              {createClassroom.isPending ? "Creating…" : "Create classroom"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
