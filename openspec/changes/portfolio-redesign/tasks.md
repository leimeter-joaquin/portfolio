## 1. Tokens & Global Styles

- [x] 1.1 Create `app/src/css/_tokens.scss` with SCSS maps for color, type-scale, space, radii, shadow
- [x] 1.2 Create `app/src/css/globals.scss` that emits tokens as CSS custom properties under `:root` (dark default) and `html[data-theme="light"]`
- [x] 1.3 Add minimal CSS reset in `globals.scss` (box-sizing, margin reset, body font-family Plus Jakarta Sans)
- [x] 1.4 Import `globals.scss` once from `Layout.astro`

## 2. Path Aliases

- [x] 2.1 Add `paths` for `@components/*`, `@data/*`, `@css/*` in `app/tsconfig.json`
- [x] 2.2 Mirror aliases in `app/astro.config.mjs` via `vite.resolve.alias`
- [x] 2.3 Verify `npm run build` resolves the aliases

## 3. Mock Data Module

- [x] 3.1 Create `app/src/data/mock.ts` with `Project`, `Role` types and exported `heroCopy`, `projects`, `experience`, `contact`
- [x] 3.2 Populate three projects (one featured: "Payment — core payments platform" + two secondary) with tags and gradient stops matching the design
- [x] 3.3 Populate three roles (Full Stack Developer @ Radium-Rocket, Stage Technician @ Mark Audio, Administrative Assistant @ Voices in Anger ESL)
- [x] 3.4 Populate `contact` with location "Rosario / Santa Fe, Argentina", email, github, linkedin

## 4. Layout Shell & Theme Toggle

- [x] 4.1 Add `<div id="theme-overlay" aria-hidden="true">` to `Layout.astro` body, fixed-positioned, pointer-events none, with `clip-path: circle(0px at 50% 50%)`
- [x] 4.2 Extract toggle markup into `app/src/components/ThemeToggle.astro` with sun/moon icons and accessible label
- [x] 4.3 Replace View Transitions API code in `Layout.astro` with AnimeJS-driven animation: capture rect, set overlay color to incoming theme canvas via `data-next-theme`, animate `clipPath` from `circle(0px at cx cy)` to `circle(R at cx cy)` where R = viewport diagonal, then on `complete` flip `data-theme`, persist, reset overlay synchronously
- [x] 4.4 Wrap motion in `prefers-reduced-motion` guard; instant-flip fallback
- [x] 4.5 Verify keyboard activation (Enter/Space) triggers same flow with focus-visible outline

## 5. Header Component

- [x] 5.1 Create `app/src/components/Header.astro` with brand mark (name + role tagline), nav list (Work/About/Stack anchors), `ThemeToggle`, and "Let's Talk" pill CTA
- [x] 5.2 CTA link is `mailto:${contact.email}`
- [x] 5.3 Add `IntersectionObserver` script that toggles `aria-current="true"` on the link matching the in-view section
- [x] 5.4 Scoped SCSS using BEM (`.header`, `.header__brand`, `.header__nav`, `.header__cta`); no hardcoded colors
- [x] 5.5 Mobile breakpoint: collapse nav to a row under brand at < 640px (no hamburger this iteration)

## 6. Hero Section

- [x] 6.1 Create `app/src/components/sections/Hero.astro` with `<section id="about">` wrapper
- [x] 6.2 Render eyebrow ("Full Stack Developer"), display headline with `<span class="hero__accent">whole system</span>` rendered in `--color-accent-strong`
- [x] 6.3 Two-column layout (headline+bio left, meta block right) collapsing to single column < 900px
- [x] 6.4 Meta block lists role, location, email, github, linkedin from `contact` mock
- [x] 6.5 Inline AnimeJS island: word-stagger fade+rise on mount; reduced-motion guard
- [x] 6.6 Add `id="stack"` anchor target on the meta block element

## 7. Projects Section

- [x] 7.1 Create `app/src/components/ProjectCard.astro` accepting a `Project` prop and a `featured` flag, rendering thumbnail (CSS gradient from `project.gradient` stops), title, summary, tag chips
- [x] 7.2 Apply CSS-only hover lift (translateY + shadow swell) with smooth transitions
- [x] 7.3 Create `app/src/components/sections/Projects.astro` with `<section id="work">` wrapper, eyebrow + h2 ("Things I've shipped"), "All projects" header link
- [x] 7.4 Layout: featured card spans full width on top row; two secondary cards in a 2-column grid below
- [x] 7.5 Featured = first project where `featured === true`; secondaries = next two non-featured in declared order
- [x] 7.6 Scoped SCSS using BEM (`.projects`, `.projects__grid`, `.project-card`, `.project-card--featured`)

## 8. Experience Section

- [x] 8.1 Create `app/src/components/sections/Experience.astro` with `<section>` wrapper, eyebrow + h2 ("Where I've worked")
- [x] 8.2 Render each role as a row: date range left, title + company center, optional note right
- [x] 8.3 Add a `formatRange(start, end)` helper that emits "MMM YYYY — MMM YYYY" or "— Present"
- [x] 8.4 Scoped SCSS for the timeline grid; use border-top dividers between rows

## 9. Footer

- [x] 9.1 Create `app/src/components/Footer.astro` with copyright (current year via `new Date().getFullYear()`) and GitHub + LinkedIn links from `contact`
- [x] 9.2 Scoped SCSS aligned with header/section padding

## 10. Home Page Composition

- [x] 10.1 Rewrite `app/src/pages/index.astro` to render `Header`, `Hero`, `Projects`, `Experience`, `Footer` in order inside `Layout`
- [x] 10.2 Remove all `home__panel` placeholder markup and styles
- [x] 10.3 Remove the in-Layout header utility row now that `ThemeToggle` lives inside `Header`
- [x] 10.4 Confirm `AIChat.vue` is not imported anywhere

## 11. Verification

- [x] 11.1 `npm run build` from repo root completes with no Astro/TS errors
- [x] 11.2 `npm run dev`: visit `localhost:4321`, verify Hero matches Hero _ Dark.png and Hero _ Light.png after theme flip
- [x] 11.3 Manually test theme expand: confirm overlay sweeps from toggle position outward, no flash
- [x] 11.4 Test `prefers-reduced-motion` (devtools rendering panel): confirm no animations play
- [x] 11.5 Keyboard tab through header → toggle → CTA, verify focus rings and `aria-current` updates while scrolling
- [x] 11.6 Run `npm run format` from repo root
- [x] 11.7 Run `openspec validate portfolio-redesign --strict`
