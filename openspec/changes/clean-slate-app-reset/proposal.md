## Why

The current app is still built around the older Gorko-driven portfolio implementation, which makes it harder to start the redesign from a truly neutral foundation. Resetting the app to a near-fresh Astro baseline now creates a clean starting point while preserving the few pieces we explicitly want to carry forward.

## What Changes

- **BREAKING**: Remove the current portfolio UI structure, including the header, footer, background SVG, section components, contact route, and page content that depend on them
- **BREAKING**: Remove the Gorko styling system and the existing `src/css/**` SCSS/CSS layer
- **BREAKING**: Remove unused assets, utility components, and content-specific dependencies that are only there to support the current portfolio build
- Preserve `src/components/AIChat.vue` exactly as a dormant future module
- Preserve the light/dark theme bootstrap and the expanding theme-transition effect, but move them into the simplified clean-slate shell
- Preserve the `animejs` dependency as part of the future-ready base
- Reduce the app to a minimal Astro shell that behaves more like a fresh starter project than a partially redesigned portfolio

## Capabilities

### New Capabilities

- `starter-shell`: Provide a minimal homepage shell with no legacy portfolio sections or ornamental site chrome
- `theme-expansion-toggle`: Preserve light/dark switching with the expanding transition effect and persisted theme preference
- `clean-foundation`: Remove the legacy Gorko/style/asset footprint while preserving `AIChat.vue`, Vue support, and the `animejs` dependency

### Modified Capabilities

_(none)_

## Impact

- `app/src/layouts/Layout.astro` — simplify the shared shell and host the preserved theme bootstrap/transition logic
- `app/src/pages/index.astro` — replace the section-based portfolio homepage with a minimal clean-slate page
- `app/src/pages/contact.astro` and legacy section/component files — remove if no longer used
- `app/src/css/**` and `app/src/assets/**` — delete the old styling layer and unused assets
- `app/package.json` and lockfile — remove Gorko and other now-unused dependencies while retaining `animejs`, `vue`, and `@astrojs/vue`
- `app/src/components/AIChat.vue` — preserved unchanged
