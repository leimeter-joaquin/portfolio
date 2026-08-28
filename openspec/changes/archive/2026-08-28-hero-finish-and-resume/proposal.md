## Why

With the app now content-driven (`content-data-integration`), the remaining work is presentation polish to finish portfolio v1:

- The hero bio plays a typewrite animation the owner dislikes.
- The hero does not fill the viewport and gives no cue to scroll.
- The header CTA is a red "Let's Talk" mailto; it should be a Resume CTA that downloads the CV (the contact form / AI chat land in a later version, so a mailto CTA is premature).

## What Changes

- **Remove the bio typewrite**: delete the bio-typing script and the typing-caret CSS in `Hero.astro`. Keep the headline word-stagger entrance animation (owner likes it). The bio renders statically.
- **Full-height hero**: the hero fills the viewport below the sticky header using small/dynamic viewport units, with its content vertically centered; the existing 900px responsive breakpoint is preserved.
- **Scroll-down indicator**: an accessible animated cue at the hero's bottom links to the Projects section (`#work`); the bounce animation is disabled under `prefers-reduced-motion`.
- **Resume CTA download**: replace the header "Let's Talk" mailto with a download link to `site.cv.path` labeled `site.cv.label` ("Resume"), keeping the existing accent pill styling. Add an `app/public/cv/` location so the path is valid; the owner drops the real PDF there.

The dark/light ripple toggle is untouched.

## Capabilities

### New Capabilities

- `hero-fullscreen`: Hero occupies the viewport height below the header with centered content.
- `hero-scroll-cue`: Accessible, motion-aware scroll indicator linking to the next section.
- `resume-cta-download`: Header CTA downloads the CV from the content-defined path.

### Modified Capabilities

- `hero-section` (from `portfolio-redesign`): the bio no longer types in; it renders statically. The headline stagger animation is retained.

## Impact

- `app/src/components/sections/Hero.astro` — remove bio typewrite script + caret CSS; full-height layout; scroll-down indicator
- `app/src/components/Header.astro` — Resume download CTA from `site.cv`
- `app/public/cv/` — placeholder so `/cv/joaquin-leimeter-cv.pdf` resolves; owner adds the PDF
