import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ProjectFrontmatter, ProjectFrontmatterSchema, type ProjectDocument } from "./schemas/project.js";
import { HeroDocument, HeroFontmatter, HeroFontmatterSchema } from "./schemas/hero.js";
import z, { ZodTypeAny } from "zod";
import { TechDocument, TechFontmatterSchema } from "./schemas/tech.js";

const CONTENT_ROOT = path.resolve(process.cwd(), "src");
const OUT_DIR = path.resolve(process.cwd(), "dist");
const OUT_FILE = path.join(OUT_DIR, "index.json");

function walk(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...walk(p));
    else files.push(p);
  }
  return files;
}

function stripMarkdownToText(md: string): string {
  // intentionally simple; good enough to start for AI indexing
  return md
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`[^`]*`/g, "") // inline code
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "") // images
    .replace(/\[[^\]]*\]\([^)]+\)/g, "$1") // links -> text
    .replace(/^#+\s+/gm, "") // headings
    .replace(/[*_>-]/g, " ") // some markdown tokens
    .replace(/\s+/g, " ")
    .trim();
}

type BaseDocument<T> = T & {
  bodyMarkdown: string;
  bodyText: string;
  sourcePath: string;
};

function loadFile<S extends ZodTypeAny>(
  filePath: string,
  schema: S
): BaseDocument<z.infer<S>> {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const frontmatter = schema.parse(parsed.data);

  const bodyMarkdown = parsed.content.trim();
  const bodyText = stripMarkdownToText(bodyMarkdown);

  return {
    ...frontmatter,
    bodyMarkdown,
    bodyText,
    sourcePath: path.relative(process.cwd(), filePath),
  };
}

function main() {
  const allFiles = walk(CONTENT_ROOT).filter((f) => f.endsWith(".md"));

  let hero: HeroDocument | undefined;
  const projects: ProjectDocument[] = [];
  const techs: TechDocument[] = []

  for (const file of allFiles) {
    if (file.includes(`${path.sep}hero${path.sep}`)) {
      hero = loadFile(file, HeroFontmatterSchema)
    }
    if (file.includes(`${path.sep}projects${path.sep}`)) {
      projects.push(loadFile(file, ProjectFrontmatterSchema));
    }
    if (file.includes(`${path.sep}techs${path.sep}`)) {
      techs.push(loadFile(file, TechFontmatterSchema))
    }
  }

  // TODO: add other documents to AI flat structure.
  // “documents” is a flattened AI-friendly view of the same content
  const documents = projects.map((p) => ({
    id: `project:${p.slug}`,
    type: "project" as const,
    title: p.title,
    slug: p.slug,
    tags: [...p.tags, ...p.stack],
    text: [
      p.title,
      p.highlights.join(" "),
      p.bodyText,
    ].join("\n"),
    url: `/projects/${p.slug}`,
  }));

  const index = {
    generatedAt: new Date().toISOString(),
    hero,
    projects,
    techs,
    documents,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(index, null, 2), "utf8");

  console.log(`Wrote ${OUT_FILE}`);
}

main();
