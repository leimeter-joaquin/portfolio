import z from 'zod'

export const TechFontmatterSchema = z.object({
  name: z.string(),
  proficiencyBadge: z.string(),
  description: z.string()
})

export type TechFontmatter = z.infer<typeof TechFontmatterSchema>

export type TechDocument = TechFontmatter & {
  bodyMarkdown: string; // raw markdown body
  bodyText: string; // plain text (for AI/RAG)
  sourcePath: string;
};

