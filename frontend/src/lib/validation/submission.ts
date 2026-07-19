import { z } from "zod";

export const createSubmissionSchema = z
  .object({
    title: z
      .string()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title must be at most 200 characters"),
    description: z
      .string()
      .max(2000, "Description must be at most 2000 characters")
      .optional()
      .or(z.literal("")),
    openDate: z.string().min(1, "Choose an open date"),
    closeDate: z.string().min(1, "Choose a close date"),
  })
  .refine(
    (values) => new Date(values.closeDate) > new Date(values.openDate),
    {
      message: "Close date must be after the open date",
      path: ["closeDate"],
    }
  );
export type CreateSubmissionFormValues = z.infer<typeof createSubmissionSchema>;
