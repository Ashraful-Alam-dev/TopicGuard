import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(150, "Name must be at most 150 characters"),
  courseCode: z
    .string()
    .min(1, "Enter a course code")
    .max(50, "Course code must be at most 50 characters"),
  description: z
    .string()
    .max(2000, "Description must be at most 2000 characters")
    .optional()
    .or(z.literal("")),
});
export type CreateClassroomFormValues = z.infer<typeof createClassroomSchema>;

export const joinClassroomSchema = z.object({
  joinCode: z
    .string()
    .length(8, "Join code must be exactly 8 characters")
    .transform((v) => v.toUpperCase()),
});
export type JoinClassroomFormValues = z.infer<typeof joinClassroomSchema>;
