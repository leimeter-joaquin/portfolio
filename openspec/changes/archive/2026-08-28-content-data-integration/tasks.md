## 1. Content schemas

- [x] 1.1 Extend `content/src/schemas/hero.ts` with `eyebrow`, `headline`, `accentPhrase`, `bio` (keep existing fields)
- [x] 1.2 Add `content/src/schemas/site.ts` — `SiteSchema` with `contact { location, email, github, linkedin }` and `cv { path, label }`
- [x] 1.3 Add `content/src/schemas/experience.ts` — `ExperienceSchema` with `company, role, dateStart, dateEnd (nullable), location?, summary`

## 2. Content markdown

- [x] 2.1 Add displayed copy frontmatter to `content/src/markdown/hero.md`
- [x] 2.2 Add `content/src/markdown/site.md` with corrected links + CV path
- [x] 2.3 Add `content/src/markdown/experience/*.md` for the real career timeline

## 3. Build pipeline

- [x] 3.1 Add `site` + `experience` branches to the loop in `content/src/build.ts`
- [x] 3.2 Emit `site` + `experience` in the `index` object
- [x] 3.3 Run `npm run build:content`; confirm new keys in `dist/index.json`

## 4. App wiring

- [x] 4.1 Add `@portfolio/content: "*"` to `app/package.json`; verify resolution (alias fallback if needed)
- [x] 4.2 Create `app/src/data/content.ts` — typed re-export of `hero`, `site`, `projects`, `experience` + project view-model mapping
- [x] 4.3 Rewire `Hero.astro` to content (eyebrow/headline/accentPhrase/bio + contact aside)
- [x] 4.4 Rewire `Projects.astro` + `ProjectCard.astro` to mapped project model
- [x] 4.5 Rewire `Experience.astro` to `content.experience`
- [x] 4.6 Rewire `Header.astro` + `Footer.astro` to `site.contact`
- [x] 4.7 Delete `app/src/data/mock.ts`

## 5. Verify

- [x] 5.1 `npm run build` from root compiles end to end
- [x] 5.2 Dev server: every section shows real content, all links correct
