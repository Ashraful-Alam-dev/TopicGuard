import { z } from "zod";

export const TOPIC_TITLE_MAX_LENGTH = 100;
export const TOPIC_DESCRIPTION_MAX_LENGTH = 150;

export const topicSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(
      TOPIC_TITLE_MAX_LENGTH,
      `Title must be at most ${TOPIC_TITLE_MAX_LENGTH} characters`,
    ),
});
export type TopicFormValues = z.infer<typeof topicSchema>;
