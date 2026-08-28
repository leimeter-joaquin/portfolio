## MODIFIED Requirements

### Requirement: Project cards are grid-aligned and uncluttered

Project cards SHALL be laid out in a CSS grid with equal heights, the featured card spanning the full row. Each card SHALL stack its title above its summary so long titles do not break the layout, with tags pinned to the bottom. The trailing title dash and the arrow glyph SHALL be removed. The "All projects" link SHALL be removed from the section header.

#### Scenario: A project has a long title

- **WHEN** a card title is long (e.g. "Radium Rocket — Internal Projects")
- **THEN** the title wraps on its own line above the summary without cramping it

#### Scenario: Cards render in a row

- **WHEN** multiple cards render side by side
- **THEN** they share equal heights and align on a grid, with no arrow glyph or "All projects" link
