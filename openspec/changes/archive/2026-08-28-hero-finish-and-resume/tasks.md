## 1. Hero animation

- [x] 1.1 Delete the bio-typing `<script>` block in `Hero.astro`
- [x] 1.2 Delete the `.hero__bio--typing` caret CSS + `hero-caret` keyframes
- [x] 1.3 Confirm headline word-stagger animation still runs

## 2. Hero layout

- [x] 2.1 Make `.hero` fill the viewport below the header (`min-height` with svh/dvh)
- [x] 2.2 Vertically center `.hero__inner`; preserve 900px breakpoint
- [x] 2.3 Add scroll-down indicator linking to `#work`, motion-aware

## 3. Resume CTA

- [x] 3.1 Replace header "Let's Talk" mailto with a download link to `site.cv.path`, label `site.cv.label`
- [x] 3.2 Keep `.header__cta` pill styling
- [x] 3.3 Add `app/public/cv/` placeholder so the path resolves

## 4. Verify

- [x] 4.1 Dev server: hero is full-height, no typewrite, headline animates, scroll cue jumps to Projects
- [x] 4.2 Header CTA reads "Resume" and triggers a download
- [x] 4.3 Toggle dark/light — ripple effect unchanged
