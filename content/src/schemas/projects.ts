import { z } from "zod";

export const ProjectFrontmatterSchema = z.object({
  type: z.literal("project"),
  title: z.string().min(1),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be kebab-case"),
  dateStart: z.string().min(1), // keep simple; you can tighten later
  dateEnd: z.string().min(1).nullable().optional(),
  stack: z.array(z.string().min(1)).default([]),
  tags: z.array(z.string().min(1)).default([]),
  links: z
    .object({
      repo: z.string().url().nullable().default(null),
      live: z.string().url().nullable().default(null),
    })
    .default({ repo: null, live: null }),
  highlights: z.array(z.string().min(1)).default([]),
});

export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatterSchema>;

export type ProjectDocument = ProjectFrontmatter & {
  bodyMarkdown: string; // raw markdown body
  bodyText: string; // plain text (for AI/RAG)
  sourcePath: string;
};
