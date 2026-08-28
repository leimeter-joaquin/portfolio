import data from "@portfolio/content/data";
import type { HeroDocument } from "@portfolio/content/schemas/hero";
import type { SiteDocument } from "@portfolio/content/schemas/site";
import type { ProjectDocument } from "@portfolio/content/schemas/project";
import type { ExperienceDocument } from "@portfolio/content/schemas/experience";

// `@portfolio/content/data` resolves to the built index.json. Cast the slices
// to their authored types so the rest of the app stays type-safe.
const index = data as unknown as {
  hero: HeroDocument;
  site: SiteDocument;
  projects: ProjectDocument[];
  experience: ExperienceDocument[];
};

export const hero: HeroDocument =
  index.hero;
export const site: SiteDocument =
  index.site;
export const projects: ProjectDocument[] =
  index.projects;
export const experience: ExperienceDocument[] =
  index.experience;

// --- Project card view model -------------------------------------------------
// Content projects carry no presentation fields (gradient, featured, summary,
// thumbnail). Derive a card model the existing ProjectCard component expects.

export type ProjectCard = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  href?: string;
  featured?: boolean;
  gradient: [string, string];
  thumbnailLabel?: string;
};

// Muted blue gradient stops matching the existing design language.
const GRADIENTS: [string, string][] = [
  ["#1a2540", "#0f1a30"],
  ["#1c2a44", "#101b30"],
  ["#1f2c46", "#101b30"],
  ["#212f4a", "#0f1a30"],
  ["#18223c", "#0d1830"],
  ["#23314e", "#111c32"],
];

// Featured = the current role (no end date); otherwise the most recent start.
function pickFeaturedSlug(
  list: ProjectDocument[],
): string | undefined {
  if (list.length === 0)
    return undefined;
  const current = list.find(
    (p) => p.dateEnd === null,
  );
  if (current) return current.slug;
  return [...list].sort((a, b) =>
    b.dateStart.localeCompare(
      a.dateStart,
    ),
  )[0]?.slug;
}

function toCard(
  project: ProjectDocument,
  index: number,
  featuredSlug: string | undefined,
): ProjectCard {
  const tags =
    project.stack.length > 0
      ? project.stack
      : project.tags;
  const href =
    project.links.live ??
    project.links.repo ??
    undefined;
  return {
    id: project.slug,
    title: project.title,
    summary:
      project.highlights[0] ??
      project.tags.join(" · "),
    tags,
    href,
    featured:
      project.slug === featuredSlug,
    gradient:
      GRADIENTS[
        index % GRADIENTS.length
      ],
    thumbnailLabel: project.title,
  };
}

// Most recent first, then map to cards.
const sortedProjects = [
  ...projects,
].sort((a, b) =>
  b.dateStart.localeCompare(
    a.dateStart,
  ),
);
const featuredSlug = pickFeaturedSlug(
  sortedProjects,
);

export const projectCards: ProjectCard[] =
  sortedProjects.map((p, i) =>
    toCard(p, i, featuredSlug),
  );

// --- Experience timeline -----------------------------------------------------
// A vertical, date-ordered (newest → oldest) view. Each entry joins a
// project's dates + rich body with the matching experience role label.

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonth(
  iso: string,
): string {
  const [y, m] = iso.split("-");
  const idx = Math.max(
    0,
    Math.min(11, Number(m) - 1),
  );
  return `${MONTHS[idx]} ${y}`;
}

function formatRange(
  start: string,
  end: string | null | undefined,
): string {
  return `${formatMonth(start)} — ${end ? formatMonth(end) : "Present"}`;
}

// Inclusive month count between two "YYYY-MM" strings; open-ended roles count through today.
function monthsBetween(
  start: string,
  end: string | null,
): number {
  const [sy, sm] = start
    .split("-")
    .map(Number);
  const now = new Date();
  const [ey, em] = end
    ? end.split("-").map(Number)
    : [
        now.getFullYear(),
        now.getMonth() + 1,
      ];
  return Math.max(
    1,
    (ey - sy) * 12 + (em - sm) + 1,
  );
}

export type TimelineEntry = {
  id: string;
  company: string;
  role: string;
  range: string;
  year: string;
  durationMonths: number;
  isCurrent: boolean;
  paragraphs: string[];
  highlights: string[];
  stack: string[];
  href?: string;
};

export const timelineEntries: TimelineEntry[] =
  [...projects]
    .sort((a, b) =>
      b.dateStart.localeCompare(
        a.dateStart,
      ),
    )
    .map((p) => {
      const exp = experience.find((e) =>
        p.title.startsWith(e.company),
      );
      return {
        id: p.slug,
        company: p.title,
        role: exp?.role ?? "",
        range: formatRange(
          p.dateStart,
          p.dateEnd ?? null,
        ),
        year: p.dateStart.split("-")[0],
        durationMonths: monthsBetween(
          p.dateStart,
          p.dateEnd ?? null,
        ),
        isCurrent: !p.dateEnd,
        paragraphs: p.bodyMarkdown
          .split(/\n\n+/)
          .map((s) => s.trim())
          .filter(Boolean),
        highlights: p.highlights,
        stack: p.stack,
        href:
          p.links.live ??
          p.links.repo ??
          undefined,
      };
    });
