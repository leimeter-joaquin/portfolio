## ADDED Requirements

### Requirement: Experience renders as a horizontal timeline

The experience section SHALL present roles on a single horizontally scrolling line ordered oldest to newest (left to right). On load the scroller SHALL be positioned at the most recent (right) end so the visitor scrolls left to move back in time. Each node SHALL show the date range and company/role.

#### Scenario: Visitor opens the page

- **WHEN** the experience section renders
- **THEN** entries appear on a horizontal line ordered oldest→newest
- **AND** the scroller is initially scrolled to the most recent entry

### Requirement: Timeline entry opens a detail modal

Activating a timeline node SHALL open a modal dialog showing the entry's full description, highlights, tech stack, date range, and live link when present. The dialog SHALL be dismissible by button, backdrop, and Escape, and return focus to the trigger.

#### Scenario: Visitor activates an entry

- **WHEN** the visitor clicks or activates a timeline node
- **THEN** a modal opens with that entry's description, highlights, stack, dates, and link
- **AND** Escape or the close control dismisses it
