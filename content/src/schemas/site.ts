import z from "zod";

export const SiteFontmatterSchema = z.object({
  contact: z.object({
    location: z.string(),
    email: z.string().email(),
    github: z.string().url(),
    linkedin: z.string().url(),
  }),
  cv: z.object({
    path: z.string().min(1),
    label: z.string().min(1),
  }),
});

export type SiteFontmatter = z.infer<typeof SiteFontmatterSchema>;

export type SiteDocument = SiteFontmatter & {
  bodyMarkdown: string;
  bodyText: string;
  sourcePath: string;
};
