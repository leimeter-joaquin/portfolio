## Context

`clean-slate-app-reset` reduced `app/` to a minimal Astro shell with a placeholder home panel and a theme toggle implemented via the View Transitions API + CSS clip-path. We have approved Hero designs (Hero _ Dark.png, Hero _ Light.png) showing a single-page portfolio with header, hero, projects, experience, and an implied footer. Backend integration (content pipeline + AI server) is deferred — this change is UI-only against typed mock data.

Constraints:

- Astro 5 + Vue island for `AIChat.vue` (kept dormant)
- SCSS for component-scoped styling and shared tokens; no CSS framework
- AnimeJS v4 already in deps; used for theme expand and section motion
- `prefers-reduced-motion` MUST collapse all motion to instant transitions
- The View Transitions API is _not_ universally available in target browsers; replacing it with an AnimeJS overlay removes the cross-browser caveat already documented in the prior spec

## Goals / Non-Goals

**Goals:**

- Faithful implementation of the approved Hero designs (light + dark) for the home page
- Component-per-section architecture in `app/src/components/sections/` with co-located scoped SCSS
- Centralized design tokens (color, type scale, spacing, radii, shadow) in `_tokens.scss`, surfaced as CSS custom properties for runtime theme swapping
- AnimeJS-driven theme expand that originates at the toggle's coordinates and works in every evergreen browser
- Mock data module typed in TypeScript so swapping to backend data later is a one-line import change
- Accessible nav with keyboard focus styles and `aria-current` on active anchor
- Lighthouse-ready: no layout shift on theme swap, fonts preconnected, images lazy

**Non-Goals:**

- Wiring `@portfolio/content` or the server API
- Per-project detail routes / case studies
- Blog, RSS, sitemap
- A real ProjectCard image pipeline — gradient placeholders only
- CMS integration
- Unit/integration tests for the visual components (manual QA + a build smoke check is sufficient for this iteration)

## Decisions

### 1. AnimeJS overlay for theme expand (replaces View Transitions API)

Render an absolutely positioned `<div id="theme-overlay">` inside `Layout.astro`'s `<body>`. On toggle click:

1. Capture toggle's bounding rect → compute origin (cx, cy) and target radius (`Math.hypot(viewportDiagonal)`).
2. Set the overlay's background to the **incoming** theme's canvas color (read from the `data-theme="<next>"` CSS custom property snapshot).
3. Position overlay as a circle at (cx, cy) with radius 0 via `clip-path: circle(0px at <cx>px <cy>px)`.
4. Run `animate(overlay, { clipPath: ['circle(0px at...)', 'circle(<R>px at...)'], duration: 700, easing: 'cubicBezier(0.22, 1, 0.36, 1)' })`.
5. On animation `complete`: flip `html.dataset.theme`, persist to localStorage, then reset overlay to `clip-path: circle(0px ...)` synchronously. Because the document body now matches the overlay color, the reset is invisible.

Alternatives considered:

- **Keep View Transitions API**: simplest but Safari/Firefox support gaps and produces a jarring snapshot on complex pages. Rejected.
- **CSS-only `@keyframes` driving clip-path**: no JS dep, but then we cannot drive radius from the toggle's measured position — would need CSS custom properties set per click anyway, plus we already ship AnimeJS for other motion. Rejected for consistency.

### 2. Section-component architecture

```
app/src/components/
├── Header.astro
├── Footer.astro
├── ThemeToggle.astro
├── ProjectCard.astro
├── sections/
│   ├── Hero.astro
│   ├── Projects.astro
│   └── Experience.astro
```

Each component owns its scoped `<style lang="scss">` and a small island `<script>` if it needs AnimeJS. `Layout.astro` only owns the global shell (head, fonts, theme bootstrap, overlay element, header/footer mount points are slots).

Alternative: a single `Home.astro` page rendering inline. Rejected — reduces reusability and bloats the page file.

### 3. Mock data module shape

`app/src/data/mock.ts` exports typed objects:

```ts
export type Project = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  href?: string;
  featured?: boolean;
  gradient: [string, string]; // tailwind-free gradient stops, two CSS color strings
};
export type Role = {
  company: string;
  title: string;
  start: string; // ISO yyyy-mm
  end: string | "present";
};
export const heroCopy = { ... };
export const projects: Project[] = [...];
export const experience: Role[] = [...];
export const contact = { location, email, github, linkedin };
```

Section components import from `@data/mock` (path alias added in `tsconfig.json`). When backend lands, swap the import target — section component code stays put.

### 4. Design tokens & theming

`app/src/css/_tokens.scss` defines SCSS maps for color, type-scale, space, radii. `globals.scss` imports and emits as CSS custom properties under `:root` and `html[data-theme="light"]`. Section SCSS reads `var(--color-accent)`, `var(--text-display)` etc. — no SCSS color math at component level. This keeps theme swapping purely a CSS custom property update, which is what makes the AnimeJS overlay strategy invisible at the seam.

Tokens chosen to match the Amber Forge palette already in `Layout.astro` (per project memory: `--accent: #f2a65a` dark / `#b7641f` light) but the headline accent in the design is more pink/red — tokens will include both `--accent` (amber) and `--accent-strong` (pink/red) so the headline highlight uses `--accent-strong`.

### 5. Anchor nav & section IDs

Nav items: Work → `#work`, About → `#about`, Stack → `#stack`. Since the design shows only Hero/Projects/Experience, map:

- `#work` → Projects section (`<section id="work">`)
- `#about` → Hero section (`<section id="about">`) — bio lives there
- `#stack` → an embedded subsection inside Hero or as a future expansion. For this iteration, point `#stack` to the Hero meta block (acts as anchor target; copy/visuals can grow later).

`Header.astro` uses an `IntersectionObserver` to apply `aria-current="true"` to the in-view nav link.

### 6. AnimeJS motion budget

- Hero headline: word-by-word fade+rise on mount (`stagger(60)`).
- Project card hover: subtle `translateY(-4px)` + shadow swell. Use CSS transitions, not AnimeJS — too cheap for a JS lib.
- Theme overlay: per Decision 1.
- All wrapped in `if (!matchMedia('(prefers-reduced-motion: reduce)').matches)` guard.

### 7. Path aliases

Add to `app/tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@components/*": ["src/components/*"],
      "@data/*": ["src/data/*"],
      "@css/*": ["src/css/*"]
    }
  }
}
```

Astro picks these up via `astro.config.mjs` `vite.resolve.alias` mirror.

## Risks / Trade-offs

- **AnimeJS overlay flash on slow paint** → Mitigation: pre-set overlay's color via `data-next-theme` CSS rule before the animation begins; the body itself does not change color until `complete`.
- **`#stack` anchor has no real target this iteration** → Mitigation: anchor exists on the Hero meta block; future change can add a dedicated Stack section without nav churn.
- **Mock data drift vs. future backend schema** → Mitigation: types in `mock.ts` mirror the eventual content-pipeline shapes (project, role) so the swap is a path-rewrite.
- **Unsynced specs from `clean-slate-app-reset`** → Mitigation: this proposal treats capabilities as new; once that change is archived to `openspec/specs/`, a follow-up may emit deltas.
- **Headline color contrast in light mode** → Mitigation: pick `--accent-strong` light value to meet WCAG AA against canvas.

## Migration Plan

This is an additive UI change. No data migration. Rollout:

1. Implement components, tokens, mock module on a feature branch.
2. `npm run build` from repo root; verify no broken Astro/TS errors.
3. Manual QA in Chrome, Firefox, Safari: hero render, theme toggle in both directions, hover states, reduced-motion preference.
4. Merge to main; deploy via existing pipeline.

Rollback: revert merge; previous `clean-slate-app-reset` shell returns.

## Open Questions

- Final copy for hero bio, project summaries, role descriptions — using lorem-realistic mock for now; user to provide finals before backend wiring.
- Whether the "Let's Talk" CTA opens a `mailto:` or scrolls to a contact form (no contact form is in the visible designs). For this iteration: `mailto:` to `contact.email`.
