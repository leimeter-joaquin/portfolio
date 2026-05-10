## Context

The current `app` is a themed portfolio implementation built from Gorko utilities, shared SCSS files, and a section/component hierarchy (`Header`, `Footer`, `BgSvg`, `Hero`, `Expertise`, `Projects`, `ContactForm`, and related assets). The requested direction is not a redesign of that system but a reset: remove the legacy UI, remove the old stylesheet and asset footprint, and leave behind only a near-starter Astro shell plus three preserved foundations for future work: `AIChat.vue`, the expanding light/dark theme behavior, and the `animejs` dependency.

## Goals / Non-Goals

**Goals:**

- Strip the app back to a minimal Astro baseline with a simplified `Layout.astro` and homepage
- Remove Gorko, the SCSS/CSS file tree, and legacy components/pages/assets that only support the current portfolio UI
- Preserve the existing theme bootstrap and re-home the expanding theme transition into the clean shell
- Preserve `src/components/AIChat.vue`, `vue`, `@astrojs/vue`, and `animejs`
- Remove unused dependencies and assets so the project footprint matches the clean-slate state

**Non-Goals:**

- Designing a new full portfolio or rebuilding the removed sections in a different visual language
- Reintegrating `AIChat.vue` into the live UI
- Introducing a new global design system or replacing the removed SCSS layer with another stylesheet architecture
- Removing Vue support entirely

## Decisions

### 1. Replace the current shared shell with a minimal Astro shell

**Decision:** Simplify `Layout.astro` so it no longer imports legacy global styles or renders `Header`, `Footer`, or `BgSvg`. The homepage becomes a minimal starter-like surface with only the content needed to prove the app is live and ready for future iteration.

**Why:** The current shell bakes in the entire legacy site structure. Removing those imports at the shell level guarantees that deleting the old section/component files will not leave dangling runtime dependencies.

**Alternatives considered:** Keeping the old shell and only emptying section contents. Rejected because it would leave the old architecture and styling system partially alive, which conflicts with the clean-slate goal.

### 2. Remove the dedicated stylesheet tree instead of migrating it

**Decision:** Delete `src/css/**`, remove `gorko` and `sass`, and keep only minimal plain CSS inside the remaining Astro files.

**Why:** The request is to clear the site back to near-starter status, not to modernize the current SCSS stack. Inline or component-local CSS is sufficient for the minimal shell and theme effect, and it avoids replacing one styling architecture with another during a reset.

**Alternatives considered:** Replacing Gorko with a lighter SCSS setup. Rejected because it still leaves a styling framework in place when the goal is to reduce the app to essentials.

### 3. Preserve the theme effect by extracting it from the removed header

**Decision:** Move the dark/light bootstrap and expanding transition logic out of `Header.astro` into the minimal shell, likely in `Layout.astro` plus a simple toggle control on `index.astro`.

**Why:** The effect is explicitly worth keeping, but the header component that currently owns it is not. Re-homing the logic lets the transition survive independently of the removed UI.

**Alternatives considered:** Dropping the expanding effect and keeping only a static theme toggle. Rejected because the user explicitly called out the effect as something to preserve.

### 4. Preserve future-facing modules without rendering them

**Decision:** Keep `src/components/AIChat.vue`, `vue`, `@astrojs/vue`, and `animejs`, but do not render `AIChat.vue` in the clean-slate UI.

**Why:** This keeps the future implementation hooks intact without compromising the goal of a stripped-down present-day interface.

**Alternatives considered:** Deleting Vue support because the live UI will be minimal. Rejected because it would discard the preserved chat component’s runtime foundation.

### 5. Prune aggressively, but only where references are gone

**Decision:** Remove legacy pages, utility components, and assets only after the new shell no longer imports them.

**Why:** This sequencing keeps the reset safe and buildable. It also makes unused-file pruning objective: if nothing imports it in the final shell, it can go unless it is one of the explicitly preserved items.

**Alternatives considered:** Bulk-deleting components and assets first. Rejected because it increases the chance of broken imports during the transition.

## Risks / Trade-offs

- [Aggressive deletion may remove something the user wanted to revisit later] → Preserve `AIChat.vue`, theme-transition behavior, and `animejs`, and rely on version control for any intentionally removed legacy pieces
- [Removing the stylesheet tree can leave small visual regressions during the reset] → Keep the remaining shell visually minimal so only a tiny amount of replacement CSS is required
- [Contact or anchor links may break once the old sections/routes are removed] → Remove or simplify navigation with the reset so no live UI points to deleted surfaces
- [Unused dependency pruning can accidentally remove future-needed packages] → Only remove packages that are no longer required by the retained shell, theme logic, or preserved Vue foundation

## Migration Plan

1. Simplify `Layout.astro` and `index.astro` so they no longer depend on the legacy site structure
2. Move the theme toggle and expanding theme logic into the new minimal shell
3. Delete legacy sections, shared UI components, background SVG, and unused routes
4. Delete `src/css/**`, remove Gorko/Sass and other unused dependencies, and prune unused assets
5. Verify `AIChat.vue` remains untouched and the app still builds cleanly

## Open Questions

- None for proposal readiness; the requested reset scope is specific enough to implement directly
