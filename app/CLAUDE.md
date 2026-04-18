# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in the `app/` package.

## CSS conventions

### Two-layer styling

Every component uses two layers together — never mix them up:

1. **Gorko utility classes** for color, typography, and spacing (applied via `class=` in the template)
2. **Scoped `<style>` blocks** for layout and structural CSS specific to the component

```astro
<!-- Gorko utilities handle color/type; scoped styles handle layout -->
<h2 class="color-white weight-bold">
  Title
</h2>

<style>
  .section__header h2 {
    font-size: 2.25rem;
  }
</style>
```

### Gorko utility classes

Generated from `src/css/config.scss`. Pattern: `{property}-{token}`.

| Prefix     | Property    | Example                                         |
| ---------- | ----------- | ----------------------------------------------- |
| `bg-`      | background  | `bg-surface`, `bg-primary`                      |
| `color-`   | color       | `color-white`, `color-muted`, `color-secondary` |
| `text-`    | font-size   | `text-500`, `text-700`                          |
| `weight-`  | font-weight | `weight-bold`, `weight-light`                   |
| `gap-top-` | margin-top  | `gap-top-500`                                   |
| `pad-top-` | padding-top | `pad-top-700`                                   |
| `box-`     | display     | `box-flex`, `box-hide`                          |

Responsive variants use `:{breakpoint}` suffix: `text-500:md`, `box-hide:sm`.

**Available color tokens:** `primary` (#db3069), `background` (#0c1223), `secondary` (#cbd5e1), `muted` (#94a3b8), `surface` (#141a2e), `surface-alt`, `surface-dark`, `border`, `outline`, `white`.

**Size scale:** `300` (0.8rem) · `400` (1rem) · `500` (1.25rem) · `600` (1.6rem) · `700` (2rem) · `900` (3rem).

### Global utility classes (defined in `globals.scss`)

- `.glow-primary` — pink box-shadow glow, enhanced on hover
- `.text-gradient-primary` — pink-to-purple gradient text (uses `-webkit-background-clip`)
- `.section-wrapper` — max-width container (1280px, centered, `padding-inline: 1rem`)

### BEM naming for scoped styles

Component-local classes follow BEM: `.block`, `.block__element`, `.block--modifier`.

```astro
<section class="projects">
  <ul class="projects__grid">
    <li
      class="projects__card projects__card--featured"
    >
    </li>
  </ul>
</section>
```

Raw HTML elements inside a BEM block are targeted by descendant selector, not given their own class:

```scss
.projects__header h2 {
  font-size: 2.25rem;
}
```

### Design token usage

Always use color tokens via Gorko utility classes or SCSS `map-get($gorko-colors, "token")` — never hardcode hex values in new code. Raw hex values that already exist in components are legacy; replace when touching that code.

```scss
// correct
background: rgba(
  map-get($gorko-colors, "primary"),
  0.2
);

// avoid
background: rgba(219, 48, 105, 0.2);
```

### Section layout pattern

Every page section wraps its content in `.section-wrapper` for consistent max-width and padding:

```astro
<section
  id="section-id"
  class="section-name section-wrapper"
>
  ...
</section>
```

### Adding new utility partials

Drop new SCSS utilities in `src/css/utilities/` and import them in `globals.scss` after the Gorko import.
