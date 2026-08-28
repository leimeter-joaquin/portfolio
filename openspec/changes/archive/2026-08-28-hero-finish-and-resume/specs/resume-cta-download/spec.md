## ADDED Requirements

### Requirement: Header CTA downloads the CV

The header SHALL present a Resume call-to-action that downloads the CV from the content-defined path (`site.cv.path`) using the content-defined label (`site.cv.label`). The prior "Let's Talk" mailto CTA SHALL be removed. The CTA SHALL retain the accent pill styling.

#### Scenario: Visitor clicks the Resume CTA

- **WHEN** the visitor activates the header CTA
- **THEN** the browser downloads the file at `site.cv.path`
- **AND** the CTA label reads `site.cv.label`

#### Scenario: CV path is changed in content

- **WHEN** `site.cv.path` is edited in content
- **THEN** the header CTA targets the new path on next build with no component edits
