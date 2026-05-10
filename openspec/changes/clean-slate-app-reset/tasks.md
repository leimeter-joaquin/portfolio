## 1. Simplify the Active Shell

- [x] 1.1 Rewrite `app/src/layouts/Layout.astro` so it no longer imports the legacy global stylesheet tree or renders `Header`, `Footer`, or `BgSvg`
- [x] 1.2 Replace `app/src/pages/index.astro` with a minimal clean-slate Astro page that does not render the legacy portfolio sections
- [x] 1.3 Remove `app/src/pages/contact.astro` if it is no longer part of the clean-slate app surface

## 2. Preserve Theme Behavior

- [x] 2.1 Move the existing theme bootstrap logic into the simplified shell so the saved theme still applies before first paint
- [x] 2.2 Add a minimal theme toggle to the clean-slate UI and preserve the expanding light/dark transition effect with graceful fallback support
- [x] 2.3 Remove theme-effect code from deleted legacy components once the new shell owns that behavior

## 3. Prune Legacy Footprint

- [x] 3.1 Delete legacy section and shared UI components that are only used by the current portfolio implementation, while leaving `app/src/components/AIChat.vue` unchanged
- [x] 3.2 Delete `app/src/css/**` and any remaining source imports that depend on the removed Gorko/Sass styling stack
- [x] 3.3 Remove unused assets from `app/src/assets/**` and any other media files no longer referenced by the clean-slate shell
- [x] 3.4 Remove unused dependencies such as `gorko`, `sass`, `@fontsource-variable/space-grotesk`, and `@portfolio/content` if they are no longer required, while keeping `animejs`, `vue`, and `@astrojs/vue`

## 4. Verify the Reset

- [x] 4.1 Confirm `app/src/components/AIChat.vue` is still present and unchanged after the cleanup
- [x] 4.2 Run install/update steps needed to refresh the dependency lockfile after pruning packages
- [x] 4.3 Run `npm run build` in `app` and confirm the clean-slate Astro app compiles successfully
