import z from "zod";

export const HeroFontmatterSchema = z.object({
  statusBadge: z.string(),
  name: z.string(),
  tagline: z.string(),
  description: z.string(),
});

export type HeroFontmatter = z.infer<typeof HeroFontmatterSchema>

export type HeroDocument = HeroFontmatter & {
  bodyMarkdown: string; // raw markdown body
  bodyText: string; // plain text (for AI/RAG)
  sourcePath: string;
};
