import z from "zod";

export const HeroFontmatterSchema = z.object({
  // AI/RAG-oriented fields (kept for future semantic search)
  name: z.string(),
  statusBadge: z.string(),
  tagline: z.string(),
  description: z.string(),
  // Fields rendered by the app hero
  eyebrow: z.string(),
  headline: z.string(),
  accentPhrase: z.string(),
  bio: z.string(),
});

export type HeroFontmatter = z.infer<typeof HeroFontmatterSchema>;

export type HeroDocument = HeroFontmatter & {
  bodyMarkdown: string; // raw markdown body
  bodyText: string; // plain text (for AI/RAG)
  sourcePath: string;
};
