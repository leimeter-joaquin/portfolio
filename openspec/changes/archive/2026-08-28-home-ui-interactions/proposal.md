## Why

Post-integration UX review surfaced several refinements: the header nav anchors are noise, the "All projects" link is dead, project cards misalign and a long title (Radium Rocket) breaks the card head, the card arrow adds nothing, the email is not easy to copy, and the experience list would read better as an interactive horizontal timeline.

## What Changes

- **Header**: remove the Work / About / Stack nav (and its scroll-spy script). Brand + theme toggle + Resume remain.
- **Email copy**: add a copy-to-clipboard button beside the email in the hero meta block, with brief copied feedback.
- **Project cards**: align all cards in a CSS grid (featured spans the full row); stack title over summary so long titles don't break; remove the trailing title dash and the arrow glyph; equalize card heights with tags pinned to the bottom.
- **Selected work**: remove the "All projects →" link.
- **Experience → horizontal timeline**: replace the static list with a horizontally scrolling timeline ordered oldest→newest, initially scrolled to the most recent end so the user scrolls back through time. Each node opens a modal (`<dialog>`) with the full project description, highlights, stack, dates, and live link. Timeline entries join project data (dates + rich body) with the experience role label.

## Capabilities

### New Capabilities

- `email-copy`: Copy-to-clipboard control for the contact email.
- `experience-timeline`: Horizontal, date-ordered timeline with per-entry detail modal.

### Modified Capabilities

- `site-header`: nav anchors removed.
- `projects-section`: grid-aligned cards, stacked head, no arrow/dash, no "All projects" link.

## Impact

- `app/src/components/Header.astro` — remove nav markup + scroll-spy script
- `app/src/components/sections/Hero.astro` — email copy button + script
- `app/src/components/ProjectCard.astro` — stacked head, remove arrow + dash, equal-height flex
- `app/src/components/sections/Projects.astro` — single grid, featured spans, remove "All projects"
- `app/src/components/sections/Experience.astro` — rewritten as horizontal timeline + dialog modal
- `app/src/data/content.ts` — add `timelineEntries` (projects joined with experience role)
