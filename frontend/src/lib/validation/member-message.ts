import { z } from "zod";

export const memberMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Enter a message")
    .max(1000, "Message is too long. Please shorten it."),
});
export type MemberMessageFormValues = z.infer<typeof memberMessageSchema>;

export const memberReplySchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Enter a reply")
    .max(1000, "Reply is too long. Please shorten it."),
});
export type MemberReplyFormValues = z.infer<typeof memberReplySchema>;
