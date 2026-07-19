import { z } from "zod";

export const createMessageSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must be at most 200 characters"),
  content: z.string().min(1, "Enter a message"),
});
export type CreateMessageFormValues = z.infer<typeof createMessageSchema>;
