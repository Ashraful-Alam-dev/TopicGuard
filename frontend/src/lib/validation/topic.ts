import { z } from "zod";

export const topicSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be at most 255 characters"),
});
export type TopicFormValues = z.infer<typeof topicSchema>;
