import { z } from "zod";

export const ExperienceFrontmatterSchema = z.object({
  type: z.literal("experience"),
  company: z.string().min(1),
  role: z.string().min(1),
  dateStart: z.string().min(1), // YYYY-MM
  dateEnd: z.string().min(1).nullable().optional(), // null = present
  location: z.string().min(1).optional(),
  summary: z.string().min(1),
});

export type ExperienceFrontmatter = z.infer<typeof ExperienceFrontmatterSchema>;

export type ExperienceDocument = ExperienceFrontmatter & {
  bodyMarkdown: string;
  bodyText: string;
  sourcePath: string;
};
