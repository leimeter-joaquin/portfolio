# Feature: project-images

## Goal
Allow each project to declare its own image via markdown frontmatter, so images are data-driven rather than hardcoded in the component.

## Scope
- Add optional `image` field (filename string, nullable) to the project Zod schema in `content`
- Update existing markdown project files to include the `image` field (empty/null for now — actual image files will be added separately)
- Update `Projects.astro` to resolve the asset dynamically from the filename instead of using the hardcoded `imageMap`
- Out of scope: adding actual image files, card visual design changes (covered in `project-card-redesign.md`)

## Design / behaviour
- The `image` field in frontmatter stores only the filename, e.g. `brookfield-residential.webp`
- Images live in `app/src/assets/projects/` — Astro optimises them at build time
- If `image` is null or absent, the card renders without an image (existing `--no-image` layout applies)

## Constraints
- Images must live in `app/src/assets/projects/`, not in `content/` — Astro's image pipeline only processes assets inside the app package
- Use Astro's dynamic import pattern to resolve assets by filename at build time
- Do not add a `image` field to the `documents[]` AI index in `build.ts` — it is not needed for RAG
- Schema field should be optional and nullable: `z.string().nullable().optional()`

## Acceptance criteria
- [ ] `image` field added to `ProjectFrontmatterSchema` as optional/nullable string
- [ ] All existing project markdown files updated with `image: null`
- [ ] `Projects.astro` resolves images dynamically from the filename — no hardcoded map
- [ ] Cards with no image still render correctly using the `--no-image` modifier
- [ ] `npm run build` passes end-to-end
