"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PencilIcon } from "lucide-react";
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
import { useUpdateClassroom } from "@/hooks/use-classrooms";
import { ApiError } from "@/lib/api-client";
import { Classroom } from "@/types/classroom";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(150),
  courseCode: z.string().min(1, "Course code is required").max(50),
  description: z.string().max(2000).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export function EditClassroomDialog({ classroom }: { classroom: Classroom }) {
  const [open, setOpen] = React.useState(false);
  const updateClassroom = useUpdateClassroom(classroom.id);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: classroom.name,
      courseCode: classroom.courseCode,
      description: classroom.description ?? "",
    },
  });

  function onSubmit(values: FormValues) {
    updateClassroom.mutate(
      {
        name: values.name,
        courseCode: values.courseCode,
        description: values.description || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Classroom updated");
          setOpen(false);
        },
        onError: (error) => {
          toast.error(
            error instanceof ApiError ? error.message : "Couldn't update the classroom",
          );
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <PencilIcon />
        Edit
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit classroom</DialogTitle>
            <DialogDescription>Update the classroom&apos;s details.</DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-name">Classroom name</Label>
              <Input
                id="edit-name"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-courseCode">Course code</Label>
              <Input
                id="edit-courseCode"
                aria-invalid={Boolean(errors.courseCode)}
                {...register("courseCode")}
              />
              {errors.courseCode && (
                <p className="text-xs text-destructive">{errors.courseCode.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" rows={3} {...register("description")} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={updateClassroom.isPending}>
              {updateClassroom.isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
